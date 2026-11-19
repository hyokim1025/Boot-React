package org.zerock.mallapi.dto;

import java.util.List;
import java.util.Map;

import lombok.Getter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.zerock.mallapi.domain.Member;
import org.zerock.mallapi.domain.MemberRole;

@Getter
public class MemberDTO extends User {

    private final String nickname;
    private final boolean social;
    private final List<String> roleNames;

    public MemberDTO(String email, String encodedPassword, String nickname, boolean social, List<String> roleNames) {
        super(email, encodedPassword, roleNames.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .toList());
        this.nickname = nickname;
        this.social = social;
        this.roleNames = List.copyOf(roleNames);
    }

    public String getEmail() {
        return getUsername();
    }

    public static MemberDTO from(Member member) {
        return new MemberDTO(member.getEmail(), member.getPw(), member.getNickname(), member.isSocial(),
                member.getMemberRoleList().stream().map(MemberRole::name).toList());
    }

    public Map<String, Object> getClaims() {
        return Map.of("email", getEmail(), "nickname", nickname, "social", social, "roleNames", roleNames);
    }
}
