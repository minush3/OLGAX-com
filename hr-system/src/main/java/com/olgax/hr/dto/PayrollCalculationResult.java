package com.olgax.hr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollCalculationResult {
    private BigDecimal basicSalary;
    private BigDecimal allowances;
    private BigDecimal grossPay;
    private BigDecimal taxAmount;
    private BigDecimal deductionsAmount;
    private BigDecimal totalDeductions;
    private BigDecimal netPay;
}
