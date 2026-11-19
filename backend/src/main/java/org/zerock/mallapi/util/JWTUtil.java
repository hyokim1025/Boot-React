package org.zerock.mallapi.util;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

import javax.crypto.SecretKey;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JWTUtil {

    private static final String ISSUER = "mallapi";
    private static final String ACCESS = "access";
    private static final String REFRESH = "refresh";

    private final SecretKey key;
    private final JwtParser parser;
    private final Duration accessTtl;
    private final Duration refreshTtl;

    public JWTUtil(@Value("${mall.jwt.secret:}") String secret,
            @Value("${mall.jwt.access-ttl:PT10M}") Duration accessTtl,
            @Value("${mall.jwt.refresh-ttl:PT24H}") Duration refreshTtl) {
        key = secret.isBlank() ? Jwts.SIG.HS256.key().build() : Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        parser = Jwts.parser().verifyWith(key).build();
        this.accessTtl = accessTtl;
        this.refreshTtl = refreshTtl;
    }

    public Map<String, String> issueTokens(String email) {
        String session = UUID.randomUUID().toString();
        return Map.of(
                "accessToken", generateToken(email, session, ACCESS, accessTtl),
                "refreshToken", generateToken(email, session, REFRESH, refreshTtl));
    }

    public String getAccessSubject(String token) {
        return validateToken(token, ACCESS, false).getSubject();
    }

    public Map<String, String> refreshTokens(String accessToken, String refreshToken) {
        Claims access = validateToken(accessToken, ACCESS, true);
        Claims refresh = validateToken(refreshToken, REFRESH, false);
        String email = access.getSubject();
        String session = access.get("sid", String.class);

        if (!email.equals(refresh.getSubject()) || !session.equals(refresh.get("sid", String.class))) {
            throw new CustomJWTException("INVALID_REFRESH_TOKEN");
        }

        Instant now = Instant.now();
        if (access.getExpiration().toInstant().isAfter(now)) {
            return Map.of("accessToken", accessToken, "refreshToken", refreshToken);
        }

        String newAccess = generateToken(email, session, ACCESS, accessTtl);
        String newRefresh = refresh.getExpiration().toInstant().isBefore(now.plus(Duration.ofHours(1)))
                ? generateToken(email, session, REFRESH, refreshTtl) : refreshToken;
        return Map.of("accessToken", newAccess, "refreshToken", newRefresh);
    }

    public static String bearerToken(String header) {
        if (header == null || !header.regionMatches(true, 0, "Bearer ", 0, 7) || header.substring(7).isBlank()) {
            throw new CustomJWTException("ERROR_ACCESS_TOKEN");
        }
        return header.substring(7);
    }

    private String generateToken(String email, String session, String kind, Duration ttl) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(ISSUER)
                .subject(email)
                .id(UUID.randomUUID().toString())
                .claim("tokenType", kind)
                .claim("sid", session)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    private Claims validateToken(String token, String kind, boolean allowExpired) {
        String error = ACCESS.equals(kind) ? "ERROR_ACCESS_TOKEN" : "INVALID_REFRESH_TOKEN";
        Claims claims;
        try {
            claims = parser.parseSignedClaims(token).getPayload();
        } catch (ExpiredJwtException expired) {
            if (!allowExpired) {
                throw new CustomJWTException(error);
            }
            claims = expired.getClaims();
        } catch (JwtException | IllegalArgumentException failure) {
            throw new CustomJWTException(error);
        }

        if (!ISSUER.equals(claims.getIssuer()) || !kind.equals(claims.get("tokenType"))
                || claims.getSubject() == null || claims.getSubject().isBlank()
                || !(claims.get("sid") instanceof String) || claims.getExpiration() == null
                || (!allowExpired && !claims.getExpiration().toInstant().isAfter(Instant.now()))) {
            throw new CustomJWTException(error);
        }

        return claims;
    }
}
