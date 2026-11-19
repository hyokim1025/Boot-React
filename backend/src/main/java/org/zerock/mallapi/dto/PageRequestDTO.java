package org.zerock.mallapi.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class PageRequestDTO {

    @Min(1)
    @Builder.Default
    private int page = 1;

    @Min(1)
    @Max(100)
    @Builder.Default
    private int size = 10;
}
