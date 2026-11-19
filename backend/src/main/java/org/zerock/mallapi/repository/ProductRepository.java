package org.zerock.mallapi.repository;

import java.util.Optional;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.mallapi.domain.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = "imageList")
    @Query("select p from Product p where p.pno = :pno and p.delFlag = false")
    Optional<Product> selectOne(@Param("pno") Long pno);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Product> findByPnoAndDelFlagFalse(Long pno);

    @Query(value = """
            select p, image.fileName from Product p
            left join p.imageList image on image.ord = 0
            where p.delFlag = false
            """, countQuery = "select count(p) from Product p where p.delFlag = false")
    Page<Object[]> selectList(Pageable pageable);
}
