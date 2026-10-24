package com.olgax.hr.service;

import com.olgax.hr.dto.PayrollCalculationResult;
import com.olgax.hr.exception.PayrollProcessingException;
import com.olgax.hr.model.Deduction;
import com.olgax.hr.model.DeductionType;
import com.olgax.hr.model.SalaryStructure;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * PayrollCalculationService (v0.1)
 *
 * Provides core payroll calculation logic:
 * - Gross Pay = Basic Salary + Allowances (Housing + Transport + Other)
 * - Deductions = Sum of fixed and percentage-based employee deductions
 * - Tax = Calculated tax withholding (from explicit tax deductions or progressive tax rule)
 * - Net Pay = Gross Pay - (Tax + Deductions)
 */
@Service
public class PayrollCalculationService {

    public static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;
    public static final int SCALE = 2;

    /**
     * Core calculation taking basic salary, allowances, deductions, and tax.
     *
     * @param basicSalary     employee base salary
     * @param allowances      total allowances (housing, transport, other)
     * @param otherDeductions non-tax deductions (insurance, pension, loan, etc.)
     * @param taxAmount       tax withholding amount
     * @return PayrollCalculationResult containing the breakdown and net pay
     */
    public PayrollCalculationResult calculateNetPay(
            BigDecimal basicSalary,
            BigDecimal allowances,
            BigDecimal otherDeductions,
            BigDecimal taxAmount) {

        BigDecimal safeBasic = basicSalary != null 
                ? basicSalary.setScale(SCALE, ROUNDING_MODE) 
                : BigDecimal.ZERO.setScale(SCALE, ROUNDING_MODE);

        BigDecimal safeAllowances = allowances != null 
                ? allowances.setScale(SCALE, ROUNDING_MODE) 
                : BigDecimal.ZERO.setScale(SCALE, ROUNDING_MODE);

        BigDecimal safeDeductions = otherDeductions != null 
                ? otherDeductions.setScale(SCALE, ROUNDING_MODE) 
                : BigDecimal.ZERO.setScale(SCALE, ROUNDING_MODE);

        BigDecimal safeTax = taxAmount != null 
                ? taxAmount.setScale(SCALE, ROUNDING_MODE) 
                : BigDecimal.ZERO.setScale(SCALE, ROUNDING_MODE);

        if (safeBasic.compareTo(BigDecimal.ZERO) < 0) {
            throw new PayrollProcessingException("Basic salary cannot be negative: " + safeBasic);
        }

        if (safeAllowances.compareTo(BigDecimal.ZERO) < 0) {
            throw new PayrollProcessingException("Allowances cannot be negative: " + safeAllowances);
        }

        if (safeDeductions.compareTo(BigDecimal.ZERO) < 0) {
            throw new PayrollProcessingException("Deductions cannot be negative: " + safeDeductions);
        }

        if (safeTax.compareTo(BigDecimal.ZERO) < 0) {
            throw new PayrollProcessingException("Tax cannot be negative: " + safeTax);
        }

        // 1. Gross Pay = Basic Salary + Allowances
        BigDecimal grossPay = safeBasic.add(safeAllowances).setScale(SCALE, ROUNDING_MODE);

        // 2. Total Deductions = Tax + Other Deductions
        BigDecimal totalDeductions = safeTax.add(safeDeductions).setScale(SCALE, ROUNDING_MODE);

        // 3. Net Pay = Gross Pay - Total Deductions
        BigDecimal netPay = grossPay.subtract(totalDeductions).setScale(SCALE, ROUNDING_MODE);

        return PayrollCalculationResult.builder()
                .basicSalary(safeBasic)
                .allowances(safeAllowances)
                .grossPay(grossPay)
                .taxAmount(safeTax)
                .deductionsAmount(safeDeductions)
                .totalDeductions(totalDeductions)
                .netPay(netPay)
                .build();
    }

    /**
     * Calculates payroll breakdown directly from an employee's SalaryStructure entity.
     * Evaluates all attached deductions (both fixed amount and percentage of base).
     *
     * @param structure the employee's active salary structure
     * @return PayrollCalculationResult
     */
    public PayrollCalculationResult calculateForSalaryStructure(SalaryStructure structure) {
        if (structure == null) {
            throw new PayrollProcessingException("Salary structure cannot be null");
        }

        BigDecimal basicSalary = structure.getBasicSalary() != null 
                ? structure.getBasicSalary().setScale(SCALE, ROUNDING_MODE) 
                : BigDecimal.ZERO.setScale(SCALE, ROUNDING_MODE);

        BigDecimal allowances = structure.getTotalAllowances().setScale(SCALE, ROUNDING_MODE);
        BigDecimal grossPay = basicSalary.add(allowances).setScale(SCALE, ROUNDING_MODE);

        BigDecimal computedDeductions = BigDecimal.ZERO;
        BigDecimal computedTax = BigDecimal.ZERO;

        List<Deduction> deductions = structure.getDeductions();
        if (deductions != null && !deductions.isEmpty()) {
            for (Deduction deduction : deductions) {
                BigDecimal deductionValue = BigDecimal.ZERO;

                if (deduction.getType() == DeductionType.PERCENTAGE && deduction.getPercentage() != null) {
                    // Percentage is calculated against basic salary
                    deductionValue = basicSalary.multiply(deduction.getPercentage())
                            .divide(BigDecimal.valueOf(100), SCALE, ROUNDING_MODE);
                } else if (deduction.getAmount() != null) {
                    deductionValue = deduction.getAmount().setScale(SCALE, ROUNDING_MODE);
                }

                // If name denotes tax, classify under tax; otherwise non-tax deduction
                if (deduction.getName() != null && deduction.getName().toLowerCase().contains("tax")) {
                    computedTax = computedTax.add(deductionValue);
                } else {
                    computedDeductions = computedDeductions.add(deductionValue);
                }
            }
        }

        // If no explicit tax deduction is configured on the salary structure, apply standard tax rule
        if (computedTax.compareTo(BigDecimal.ZERO) == 0 && grossPay.compareTo(BigDecimal.ZERO) > 0) {
            computedTax = calculateStandardTax(grossPay);
        }

        return calculateNetPay(basicSalary, allowances, computedDeductions, computedTax);
    }

    /**
     * Standard Progressive Tax Bracket (v0.1):
     * - First 1,000: 0% tax (Tax-free allowance)
     * - 1,001 to 3,000: 5% on amount over 1,000
     * - 3,001+: 100 + 10% on amount over 3,000
     *
     * @param taxableGross total gross income
     * @return calculated tax amount
     */
    public BigDecimal calculateStandardTax(BigDecimal taxableGross) {
        if (taxableGross == null || taxableGross.compareTo(BigDecimal.valueOf(1000)) <= 0) {
            return BigDecimal.ZERO.setScale(SCALE, ROUNDING_MODE);
        }

        BigDecimal tax;
        if (taxableGross.compareTo(BigDecimal.valueOf(3000)) <= 0) {
            tax = taxableGross.subtract(BigDecimal.valueOf(1000))
                    .multiply(BigDecimal.valueOf(0.05));
        } else {
            BigDecimal baseTier = BigDecimal.valueOf(100); // (3000 - 1000) * 0.05
            BigDecimal upperTier = taxableGross.subtract(BigDecimal.valueOf(3000))
                    .multiply(BigDecimal.valueOf(0.10));
            tax = baseTier.add(upperTier);
        }

        return tax.setScale(SCALE, ROUNDING_MODE);
    }
}
