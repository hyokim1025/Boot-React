package org.zerock.mallapi.controller;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Map;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.zerock.mallapi.dto.MemberDTO;
import org.zerock.mallapi.dto.MemberModifyDTO;
import org.zerock.mallapi.service.KakaoLoginService;
import org.zerock.mallapi.service.MemberService;
import org.zerock.mallapi.util.JWTUtil;

@RestController
@RequiredArgsConstructor
public class SocialController {

    private static final String STATE_COOKIE = "mall_kakao_state";
    private static final String KAKAO_PATH = "/api/member/kakao";

    private final KakaoLoginService kakao;
    private final MemberService members;
    private final JWTUtil jwtUtil;

    @PostMapping(KAKAO_PATH + "/start")
    public Map<String, String> start(HttpServletResponse response) {
        String state = kakao.createState();
        String url = kakao.authorizationUrl(state);
        setStateCookie(response, state, Duration.ofMinutes(5));
        return Map.of("url", url);
    }

    @PostMapping(KAKAO_PATH)
    public Map<String, Object> login(@RequestBody KakaoCallback callback,
            @CookieValue(name = STATE_COOKIE, required = false) String state,
            HttpServletResponse response) {
        if (state == null || callback.state() == null || callback.code() == null || callback.code().isBlank()
                || !MessageDigest.isEqual(state.getBytes(StandardCharsets.UTF_8),
                        callback.state().getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "INVALID_KAKAO_STATE");
        }
        setStateCookie(response, "", Duration.ZERO);
        return jwtUtil.issueSession(kakao.login(callback.code()));
    }

    @PutMapping("/api/member/modify")
    public Map<String, String> modify(@AuthenticationPrincipal MemberDTO principal,
            @Valid @RequestBody MemberModifyDTO details) {
        members.modifyMember(principal.getEmail(), details);
        return Map.of("RESULT", "SUCCESS");
    }

    private void setStateCookie(HttpServletResponse response, String state, Duration age) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(STATE_COOKIE, state)
                .httpOnly(true).secure(kakao.secureCookie()).sameSite("Lax")
                .path(KAKAO_PATH).maxAge(age).build().toString());
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
    }

    public record KakaoCallback(String code, String state) {
    }
}
