package org.zerock.mallapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CartItemDTO(
        @NotBlank String email,
        @Positive Long pno,
        @NotNull Integer qty,
        @Positive Long cino) {
}
