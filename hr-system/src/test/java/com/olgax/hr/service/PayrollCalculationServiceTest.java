package com.olgax.hr.service;

import com.olgax.hr.dto.PayrollCalculationResult;
import com.olgax.hr.exception.PayrollProcessingException;
import com.olgax.hr.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PayrollCalculationServiceTest {

    private PayrollCalculationService calculationService;

    @BeforeEach
    void setUp() {
        calculationService = new PayrollCalculationService();
    }

    @Test
    void testCalculateNetPay_DirectInputs() {
        BigDecimal basicSalary = new BigDecimal("5000.00");
        BigDecimal allowances = new BigDecimal("1200.00");
        BigDecimal deductions = new BigDecimal("300.00");
        BigDecimal tax = new BigDecimal("450.00");

        PayrollCalculationResult result = calculationService.calculateNetPay(basicSalary, allowances, deductions, tax);

        assertNotNull(result);
        assertEquals(new BigDecimal("5000.00"), result.getBasicSalary());
        assertEquals(new BigDecimal("1200.00"), result.getAllowances());
        assertEquals(new BigDecimal("6200.00"), result.getGrossPay()); // 5000 + 1200
        assertEquals(new BigDecimal("450.00"), result.getTaxAmount());
        assertEquals(new BigDecimal("300.00"), result.getDeductionsAmount());
        assertEquals(new BigDecimal("750.00"), result.getTotalDeductions()); // 450 + 300
        assertEquals(new BigDecimal("5450.00"), result.getNetPay()); // 6200 - 750
    }

    @Test
    void testCalculateNetPay_WithNulls_DefaultsToZero() {
        PayrollCalculationResult result = calculationService.calculateNetPay(
                new BigDecimal("3000.00"), null, null, null);

        assertNotNull(result);
        assertEquals(new BigDecimal("3000.00"), result.getBasicSalary());
        assertEquals(new BigDecimal("0.00"), result.getAllowances());
        assertEquals(new BigDecimal("3000.00"), result.getGrossPay());
        assertEquals(new BigDecimal("0.00"), result.getTotalDeductions());
        assertEquals(new BigDecimal("3000.00"), result.getNetPay());
    }

    @Test
    void testCalculateNetPay_NegativeSalary_ThrowsException() {
        assertThrows(PayrollProcessingException.class, () ->
                calculationService.calculateNetPay(new BigDecimal("-100.00"), BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO)
        );
    }

    @Test
    void testCalculateForSalaryStructure_WithAttachedDeductions() {
        Employee employee = new Employee();
        employee.setId(1L);
        employee.setFirstName("John");
        employee.setLastName("Doe");

        List<Deduction> deductions = new ArrayList<>();
        // Fixed deduction
        deductions.add(Deduction.builder()
                .name("Health Insurance")
                .type(DeductionType.FIXED)
                .amount(new BigDecimal("150.00"))
                .build());

        // Percentage deduction (5% of basic salary 4000 = 200)
        deductions.add(Deduction.builder()
                .name("Provident Fund")
                .type(DeductionType.PERCENTAGE)
                .percentage(new BigDecimal("5.00"))
                .build());

        // Explicit Tax deduction
        deductions.add(Deduction.builder()
                .name("Income Tax")
                .type(DeductionType.FIXED)
                .amount(new BigDecimal("300.00"))
                .build());

        SalaryStructure structure = SalaryStructure.builder()
                .employee(employee)
                .basicSalary(new BigDecimal("4000.00"))
                .housingAllowance(new BigDecimal("500.00"))
                .transportAllowance(new BigDecimal("200.00"))
                .otherAllowances(new BigDecimal("100.00"))
                .effectiveDate(LocalDate.now())
                .deductions(deductions)
                .build();

        PayrollCalculationResult result = calculationService.calculateForSalaryStructure(structure);

        // Allowances: 500 + 200 + 100 = 800
        // Gross Pay: 4000 + 800 = 4800
        // Non-tax deductions: 150 (Insurance) + 200 (5% of 4000 PF) = 350
        // Tax: 300
        // Total Deductions: 350 + 300 = 650
        // Net Pay: 4800 - 650 = 4150
        assertEquals(new BigDecimal("4000.00"), result.getBasicSalary());
        assertEquals(new BigDecimal("800.00"), result.getAllowances());
        assertEquals(new BigDecimal("4800.00"), result.getGrossPay());
        assertEquals(new BigDecimal("300.00"), result.getTaxAmount());
        assertEquals(new BigDecimal("350.00"), result.getDeductionsAmount());
        assertEquals(new BigDecimal("650.00"), result.getTotalDeductions());
        assertEquals(new BigDecimal("4150.00"), result.getNetPay());
    }

    @Test
    void testStandardTaxBracketCalculations() {
        // Below 1000 -> 0%
        assertEquals(new BigDecimal("0.00"), calculationService.calculateStandardTax(new BigDecimal("800.00")));
        assertEquals(new BigDecimal("0.00"), calculationService.calculateStandardTax(new BigDecimal("1000.00")));

        // 1000 to 3000 -> 5% on amount over 1000
        // 2000 -> (2000 - 1000) * 0.05 = 50.00
        assertEquals(new BigDecimal("50.00"), calculationService.calculateStandardTax(new BigDecimal("2000.00")));

        // 3000 -> (3000 - 1000) * 0.05 = 100.00
        assertEquals(new BigDecimal("100.00"), calculationService.calculateStandardTax(new BigDecimal("3000.00")));

        // Over 3000 -> 100 + 10% on amount over 3000
        // 4000 -> 100 + (4000 - 3000) * 0.10 = 100 + 100 = 200.00
        assertEquals(new BigDecimal("200.00"), calculationService.calculateStandardTax(new BigDecimal("4000.00")));
    }
}
