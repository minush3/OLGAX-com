package com.olgax.hr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayslipResponseDto {
    private Long id;
    private Long payrollRunId;
    private String period;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String departmentName;
    private String positionTitle;
    private BigDecimal basicSalary;
    private BigDecimal housingAllowance;
    private BigDecimal transportAllowance;
    private BigDecimal otherAllowances;
    private BigDecimal totalAllowances;
    private BigDecimal grossPay;
    private BigDecimal taxAmount;
    private BigDecimal deductionsAmount;
    private BigDecimal totalDeductions;
    private BigDecimal netPay;
    private String currency;
    private LocalDateTime generatedAt;
    private String status;
}
