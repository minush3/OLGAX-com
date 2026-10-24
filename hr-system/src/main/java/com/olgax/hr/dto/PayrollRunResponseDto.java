package com.olgax.hr.dto;

import com.olgax.hr.model.PayrollStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRunResponseDto {
    private Long id;
    private String period;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate paymentDate;
    private PayrollStatus status;
    private BigDecimal totalBasicSalary;
    private BigDecimal totalAllowances;
    private BigDecimal totalGrossPay;
    private BigDecimal totalTax;
    private BigDecimal totalDeductions;
    private BigDecimal totalNetPay;
    private Integer totalEmployees;
    private LocalDateTime processedAt;
    private String notes;
    private List<PayslipResponseDto> payslips;
}
