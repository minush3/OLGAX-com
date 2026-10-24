package com.olgax.hr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryStructureResponseDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private BigDecimal basicSalary;
    private BigDecimal housingAllowance;
    private BigDecimal transportAllowance;
    private BigDecimal otherAllowances;
    private BigDecimal totalAllowances;
    private BigDecimal grossSalary;
    private String currency;
    private LocalDate effectiveDate;
    private boolean active;
    private List<DeductionResponseDto> deductions;
}
