package com.olgax.hr.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRunRequestDto {

    @NotBlank(message = "Payroll period is required (e.g. 2026-10)")
    private String period;

    @NotNull(message = "Payroll start date is required")
    private LocalDate startDate;

    @NotNull(message = "Payroll end date is required")
    private LocalDate endDate;

    private LocalDate paymentDate;

    /**
     * Optional list of employee IDs to run payroll for.
     * If null or empty, payroll is processed for all active employees with an active salary structure.
     */
    private List<Long> employeeIds;

    private String notes;
}
