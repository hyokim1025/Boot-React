package org.zerock.mallapi.config;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.zerock.mallapi.domain.Member;
import org.zerock.mallapi.domain.MemberRole;
import org.zerock.mallapi.dto.MemberDTO;
import org.zerock.mallapi.repository.MemberRepository;
import org.zerock.mallapi.security.CustomUserDetailsService;
import org.zerock.mallapi.security.filter.JWTCheckFilter;
import org.zerock.mallapi.util.JWTUtil;

@Configuration
@EnableMethodSecurity
public class CustomSecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, ObjectMapper mapper, JWTUtil jwtUtil,
            CustomUserDetailsService users, PasswordEncoder passwordEncoder) throws Exception {
        var provider = new DaoAuthenticationProvider(users);
        provider.setPasswordEncoder(passwordEncoder);

        AuthenticationEntryPoint entryPoint = (request, response, failure) ->
                writeJson(mapper, response, HttpServletResponse.SC_UNAUTHORIZED, Map.of("error", "ERROR_ACCESS_TOKEN"));

        return http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .requestCache(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(config -> config.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(provider)
                .authorizeHttpRequests(config -> config
                        .requestMatchers(HttpMethod.POST, "/api/member/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/member/refresh", "/api/products/view/*").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/member/refresh").permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/api/products/view/*").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .formLogin(config -> config
                        .loginPage("/api/member/login")
                        .loginProcessingUrl("/api/member/login")
                        .successHandler((request, response, authentication) -> {
                            MemberDTO member = (MemberDTO) authentication.getPrincipal();
                            Map<String, Object> data = new HashMap<>(member.getClaims());
                            data.putAll(jwtUtil.issueTokens(member.getEmail()));
                            writeJson(mapper, response, HttpServletResponse.SC_OK, data);
                        })
                        .failureHandler((request, response, failure) ->
                                writeJson(mapper, response, HttpServletResponse.SC_UNAUTHORIZED, Map.of("error", "ERROR_LOGIN"))))
                .exceptionHandling(config -> config
                        .authenticationEntryPoint(entryPoint)
                        .accessDeniedHandler((request, response, failure) ->
                                writeJson(mapper, response, HttpServletResponse.SC_FORBIDDEN, Map.of("error", "ERROR_ACCESSDENIED"))))
                .addFilterBefore(new JWTCheckFilter(jwtUtil, users, entryPoint), UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    @ConditionalOnProperty(name = "mall.demo.enabled", havingValue = "true")
    ApplicationRunner demoMember(MemberRepository members, PasswordEncoder encoder) {
        return args -> {
            String email = "user1@aaa.com";
            if (!members.existsById(email)) {
                Member member = Member.builder()
                        .email(email)
                        .pw(encoder.encode("1111"))
                        .nickname("USER1")
                        .build();
                member.addRole(MemberRole.USER);
                members.save(member);
            }
        };
    }

    private static void writeJson(ObjectMapper mapper, HttpServletResponse response, int status,
            Map<String, ?> data) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        mapper.writeValue(response.getOutputStream(), data);
    }
}
