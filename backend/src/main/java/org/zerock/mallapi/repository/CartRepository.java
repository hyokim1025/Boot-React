package org.zerock.mallapi.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.mallapi.domain.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByOwnerEmail(String email);
}
