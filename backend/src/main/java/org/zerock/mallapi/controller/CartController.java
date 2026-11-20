package org.zerock.mallapi.controller;

import java.security.Principal;
import java.util.List;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.zerock.mallapi.dto.CartItemDTO;
import org.zerock.mallapi.dto.CartItemListDTO;
import org.zerock.mallapi.service.CartService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/change")
    public List<CartItemListDTO> changeCart(@Valid @RequestBody CartItemDTO itemDTO, Principal principal) {
        String email = principal.getName();
        if (!email.equals(itemDTO.email())) {
            throw new AccessDeniedException("Cart owner does not match");
        }

        if (itemDTO.qty() <= 0) {
            if (itemDTO.cino() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart item number is required");
            }
            return cartService.remove(email, itemDTO.cino());
        }
        return cartService.addOrModify(email, itemDTO);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/items")
    public List<CartItemListDTO> getCartItems(Principal principal) {
        return cartService.getCartItems(principal.getName());
    }

    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/{cino}")
    public List<CartItemListDTO> removeFromCart(@PathVariable("cino") Long cino, Principal principal) {
        return cartService.remove(principal.getName(), cino);
    }
}
