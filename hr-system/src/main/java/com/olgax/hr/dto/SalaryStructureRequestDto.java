package com.olgax.hr.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryStructureRequestDto {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Basic salary is required")
    @DecimalMin(value = "0.01", message = "Basic salary must be greater than zero")
    private BigDecimal basicSalary;

    @DecimalMin(value = "0.0", message = "Housing allowance cannot be negative")
    @Builder.Default
    private BigDecimal housingAllowance = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Transport allowance cannot be negative")
    @Builder.Default
    private BigDecimal transportAllowance = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Other allowances cannot be negative")
    @Builder.Default
    private BigDecimal otherAllowances = BigDecimal.ZERO;

    @Size(max = 10, message = "Currency code must not exceed 10 characters")
    @Builder.Default
    private String currency = "USD";

    @NotNull(message = "Effective date is required")
    private LocalDate effectiveDate;

    @Builder.Default
    private Boolean active = true;

    @Valid
    @Builder.Default
    private List<DeductionRequestDto> deductions = new ArrayList<>();
}
