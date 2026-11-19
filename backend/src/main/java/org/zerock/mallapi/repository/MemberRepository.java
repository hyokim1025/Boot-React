package org.zerock.mallapi.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.mallapi.domain.Member;

public interface MemberRepository extends JpaRepository<Member, String> {

    @EntityGraph(attributePaths = "memberRoleList")
    Optional<Member> findByEmail(String email);

    @EntityGraph(attributePaths = "memberRoleList")
    Optional<Member> findByKakaoId(String kakaoId);
}
