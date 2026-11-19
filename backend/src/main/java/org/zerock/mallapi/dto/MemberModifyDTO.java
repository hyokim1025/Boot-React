package org.zerock.mallapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MemberModifyDTO(
        @NotBlank @Size(max = 80) String nickname,
        @Size(max = 72) String pw,
        @Size(max = 72) String currentPassword) {
}
