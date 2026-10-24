package com.olgax.hr.dto;

import com.olgax.hr.model.DeductionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeductionResponseDto {
    private Long id;
    private String name;
    private DeductionType type;
    private BigDecimal amount;
    private BigDecimal percentage;
    private String description;
}
