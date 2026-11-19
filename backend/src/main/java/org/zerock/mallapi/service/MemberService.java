package org.zerock.mallapi.service;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.zerock.mallapi.domain.Member;
import org.zerock.mallapi.domain.MemberRole;
import org.zerock.mallapi.dto.MemberDTO;
import org.zerock.mallapi.dto.MemberModifyDTO;
import org.zerock.mallapi.repository.MemberRepository;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository members;
    private final PasswordEncoder encoder;

    @Transactional
    public MemberDTO getKakaoMember(String kakaoId, String verifiedEmail) {
        var linked = members.findByKakaoId(kakaoId);
        if (linked.isPresent()) {
            return MemberDTO.from(linked.get());
        }
        if (verifiedEmail == null) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "KAKAO_EMAIL_REQUIRED");
        }

        String email = verifiedEmail.toLowerCase(Locale.ROOT);
        if (members.existsById(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "KAKAO_EMAIL_IN_USE");
        }

        Member member = Member.builder()
                .email(email)
                .pw(encoder.encode(UUID.randomUUID().toString()))
                .nickname("소셜회원")
                .social(true)
                .kakaoId(kakaoId)
                .build();
        member.addRole(MemberRole.USER);
        try {
            return MemberDTO.from(members.saveAndFlush(member));
        } catch (DataIntegrityViolationException conflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "KAKAO_EMAIL_IN_USE", conflict);
        }
    }

    @Transactional
    public void modifyMember(String email, MemberModifyDTO details) {
        Member member = members.findById(email).orElseThrow(() -> new NoSuchElementException("Member not found"));
        String password = details.pw();

        if (member.isSocial() || (password != null && !password.isBlank())) {
            if (password == null || password.length() < 8 || password.isBlank()
                    || password.getBytes(StandardCharsets.UTF_8).length > 72) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "INVALID_NEW_PASSWORD");
            }
            if (!member.isSocial() && (details.currentPassword() == null
                    || !encoder.matches(details.currentPassword(), member.getPw()))) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "INVALID_CURRENT_PASSWORD");
            }
            member.changePassword(encoder.encode(password));
        }
        member.changeNickname(details.nickname().trim());
    }
}
