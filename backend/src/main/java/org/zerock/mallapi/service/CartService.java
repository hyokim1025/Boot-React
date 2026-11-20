package org.zerock.mallapi.service;

import java.util.List;
import java.util.NoSuchElementException;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.zerock.mallapi.domain.Cart;
import org.zerock.mallapi.domain.CartItem;
import org.zerock.mallapi.domain.Member;
import org.zerock.mallapi.domain.Product;
import org.zerock.mallapi.dto.CartItemDTO;
import org.zerock.mallapi.dto.CartItemListDTO;
import org.zerock.mallapi.repository.CartItemRepository;
import org.zerock.mallapi.repository.CartRepository;
import org.zerock.mallapi.repository.MemberRepository;
import org.zerock.mallapi.repository.ProductRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class CartService {

    private final CartRepository carts;
    private final CartItemRepository items;
    private final MemberRepository members;
    private final ProductRepository products;

    @Transactional(readOnly = true)
    public List<CartItemListDTO> getCartItems(String email) {
        return items.getItemsOfCartDTOByEmail(email);
    }

    public List<CartItemListDTO> addOrModify(String email, CartItemDTO itemDTO) {
        Member owner = lockMember(email);

        if (itemDTO.cino() != null) {
            CartItem item = findItem(email, itemDTO.cino());
            findProduct(item.getProduct().getPno());
            item.changeQty(itemDTO.qty());
        } else {
            if (itemDTO.pno() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product number is required");
            }
            Product product = findProduct(itemDTO.pno());
            Cart cart = carts.findByOwnerEmail(email)
                    .orElseGet(() -> carts.save(Cart.builder().owner(owner).build()));
            CartItem item = items.findByCartCnoAndProductPno(cart.getCno(), product.getPno())
                    .orElseGet(() -> CartItem.builder().cart(cart).product(product).build());
            item.changeQty(itemDTO.qty());
            items.save(item);
        }
        return items.getItemsOfCartDTOByEmail(email);
    }

    public List<CartItemListDTO> remove(String email, Long cino) {
        lockMember(email);
        items.delete(findItem(email, cino));
        return items.getItemsOfCartDTOByEmail(email);
    }

    private Member lockMember(String email) {
        return members.findForCartUpdate(email)
                .orElseThrow(() -> new NoSuchElementException("Member not found"));
    }

    private CartItem findItem(String email, Long cino) {
        return items.findByCinoAndCartOwnerEmail(cino, email)
                .orElseThrow(() -> new NoSuchElementException("Cart item not found"));
    }

    private Product findProduct(Long pno) {
        return products.findByPnoAndDelFlagFalse(pno)
                .orElseThrow(() -> new NoSuchElementException("Product " + pno + " not found"));
    }
}
