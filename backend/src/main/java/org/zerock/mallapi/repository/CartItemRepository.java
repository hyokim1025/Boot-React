package org.zerock.mallapi.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.mallapi.domain.CartItem;
import org.zerock.mallapi.dto.CartItemListDTO;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCinoAndCartOwnerEmail(Long cino, String email);

    Optional<CartItem> findByCartCnoAndProductPno(Long cno, Long pno);

    @Query("""
            select new org.zerock.mallapi.dto.CartItemListDTO(ci.cino, ci.qty, p.pno, p.pname, p.price, image.fileName)
            from CartItem ci
            join ci.product p
            left join p.imageList image on image.ord = 0
            where ci.cart.owner.email = :email and p.delFlag = false
            order by ci.cino desc
            """)
    List<CartItemListDTO> getItemsOfCartDTOByEmail(@Param("email") String email);
}
