package org.zerock.mallapi.security.filter;

import java.io.IOException;
import java.util.Set;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.web.filter.OncePerRequestFilter;
import org.zerock.mallapi.dto.MemberDTO;
import org.zerock.mallapi.security.CustomUserDetailsService;
import org.zerock.mallapi.util.CustomJWTException;
import org.zerock.mallapi.util.JWTUtil;

@RequiredArgsConstructor
public class JWTCheckFilter extends OncePerRequestFilter {

    private static final Set<String> MEMBER_ENDPOINTS = Set.of("/api/member/login", "/api/member/refresh");

    private final JWTUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final AuthenticationEntryPoint entryPoint;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();
        return !path.startsWith("/api/") || MEMBER_ENDPOINTS.contains(path) || "OPTIONS".equals(method)
                || (path.startsWith("/api/products/view/") && ("GET".equals(method) || "HEAD".equals(method)));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization != null) {
            try {
                String email = jwtUtil.getAccessSubject(JWTUtil.bearerToken(authorization));
                MemberDTO member = userDetailsService.loadUserByUsername(email);
                member.eraseCredentials();
                var context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                        member, null, member.getAuthorities()));
                SecurityContextHolder.setContext(context);
            } catch (CustomJWTException | UsernameNotFoundException failure) {
                SecurityContextHolder.clearContext();
                entryPoint.commence(request, response, new BadCredentialsException("Invalid access token", failure));
                return;
            }
        }

        chain.doFilter(request, response);
    }
}
