package com.olgax.hr.dto;

import com.olgax.hr.model.DeductionType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeductionRequestDto {

    @NotBlank(message = "Deduction name is required")
    private String name;

    @Builder.Default
    private DeductionType type = DeductionType.FIXED;

    @DecimalMin(value = "0.0", message = "Deduction amount cannot be negative")
    private BigDecimal amount;

    @DecimalMin(value = "0.0", message = "Percentage cannot be negative")
    @DecimalMax(value = "100.0", message = "Percentage cannot exceed 100")
    private BigDecimal percentage;

    private String description;
}
