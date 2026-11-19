package org.zerock.mallapi.service;

import java.time.Duration;
import java.util.Base64;
import java.security.SecureRandom;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;
import org.zerock.mallapi.dto.MemberDTO;

@Service
public class KakaoLoginService {

    private final SecureRandom random = new SecureRandom();
    private final RestClient client;
    private final MemberService members;
    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;
    private final String authHost;
    private final String apiHost;

    public KakaoLoginService(RestClient.Builder builder, MemberService members,
            @Value("${mall.kakao.client-id:}") String clientId,
            @Value("${mall.kakao.client-secret:}") String clientSecret,
            @Value("${mall.kakao.redirect-uri:http://localhost:3000/member/kakao}") String redirectUri,
            @Value("${mall.kakao.auth-host:https://kauth.kakao.com}") String authHost,
            @Value("${mall.kakao.api-host:https://kapi.kakao.com}") String apiHost) {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(8));
        client = builder.requestFactory(factory).build();
        this.members = members;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.authHost = authHost;
        this.apiHost = apiHost;
    }

    public String createState() {
        byte[] value = new byte[32];
        random.nextBytes(value);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    public String authorizationUrl(String state) {
        checkConfigured();
        return UriComponentsBuilder.fromUriString(authHost + "/oauth/authorize")
                .queryParam("response_type", "code")
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("scope", "account_email")
                .queryParam("state", state)
                .build().encode().toUriString();
    }

    public MemberDTO login(String code) {
        checkConfigured();

        var form = new LinkedMultiValueMap<String, String>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);
        form.add("code", code);

        JsonNode profile;
        try {
            JsonNode tokens = client.post().uri(authHost + "/oauth/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form).retrieve().body(JsonNode.class);
            if (tokens == null || tokens.path("access_token").asText().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "KAKAO_LOGIN_FAILED");
            }
            profile = client.get().uri(apiHost + "/v2/user/me")
                    .headers(headers -> headers.setBearerAuth(tokens.path("access_token").asText()))
                    .retrieve().body(JsonNode.class);
        } catch (RestClientException failure) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "KAKAO_LOGIN_FAILED");
        }

        if (profile == null || !profile.path("id").canConvertToLong() || profile.path("id").asLong() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "KAKAO_LOGIN_FAILED");
        }
        JsonNode account = profile.path("kakao_account");
        String email = account.path("email").asText("").trim();
        boolean verified = account.path("is_email_valid").asBoolean() && account.path("is_email_verified").asBoolean();
        return members.getKakaoMember(profile.path("id").asText(), verified && !email.isBlank() ? email : null);
    }

    public boolean secureCookie() {
        return redirectUri.startsWith("https://");
    }

    private void checkConfigured() {
        if (clientId.isBlank() || clientSecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "KAKAO_NOT_CONFIGURED");
        }
    }
}
