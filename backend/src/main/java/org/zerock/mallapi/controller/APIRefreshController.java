package org.zerock.mallapi.controller;

import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.zerock.mallapi.util.JWTUtil;

@RestController
@RequiredArgsConstructor
public class APIRefreshController {

    private final JWTUtil jwtUtil;

    @RequestMapping(path = "/api/member/refresh", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<Map<String, String>> refresh(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @RequestParam(required = false) String refreshToken) {
        var tokens = jwtUtil.refreshTokens(JWTUtil.bearerToken(authorization), refreshToken);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(tokens);
    }
}
