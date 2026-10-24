package com.olgax.hr.service;

import com.olgax.hr.dto.PayrollCalculationResult;
import com.olgax.hr.dto.PayrollRunRequestDto;
import com.olgax.hr.dto.PayrollRunResponseDto;
import com.olgax.hr.exception.PayrollProcessingException;
import com.olgax.hr.model.*;
import com.olgax.hr.repository.EmployeeRepository;
import com.olgax.hr.repository.PayrollRunRepository;
import com.olgax.hr.repository.PayslipRepository;
import com.olgax.hr.repository.SalaryStructureRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PayrollServiceTest {

    @Mock
    private PayrollRunRepository payrollRunRepository;

    @Mock
    private PayslipRepository payslipRepository;

    @Mock
    private SalaryStructureRepository salaryStructureRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private PayrollCalculationService calculationService;

    @InjectMocks
    private PayrollService payrollService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testTriggerPayrollRun_Success() {
        Employee employee = new Employee();
        employee.setId(10L);
        employee.setFirstName("Alice");
        employee.setLastName("Smith");
        employee.setEmail("alice@example.com");
        employee.setActive(true);

        SalaryStructure structure = SalaryStructure.builder()
                .id(1L)
                .employee(employee)
                .basicSalary(new BigDecimal("3000.00"))
                .housingAllowance(new BigDecimal("500.00"))
                .transportAllowance(new BigDecimal("200.00"))
                .currency("USD")
                .effectiveDate(LocalDate.now())
                .active(true)
                .build();

        PayrollCalculationResult calcResult = PayrollCalculationResult.builder()
                .basicSalary(new BigDecimal("3000.00"))
                .allowances(new BigDecimal("700.00"))
                .grossPay(new BigDecimal("3700.00"))
                .taxAmount(new BigDecimal("170.00"))
                .deductionsAmount(new BigDecimal("100.00"))
                .totalDeductions(new BigDecimal("270.00"))
                .netPay(new BigDecimal("3430.00"))
                .build();

        PayrollRunRequestDto request = PayrollRunRequestDto.builder()
                .period("2026-10")
                .startDate(LocalDate.of(2026, 10, 1))
                .endDate(LocalDate.of(2026, 10, 31))
                .paymentDate(LocalDate.of(2026, 10, 31))
                .build();

        when(payrollRunRepository.existsByPeriod("2026-10")).thenReturn(false);
        when(employeeRepository.findAll()).thenReturn(List.of(employee));
        when(salaryStructureRepository.findByEmployeeIdAndActiveTrue(10L)).thenReturn(Optional.of(structure));
        when(calculationService.calculateForSalaryStructure(structure)).thenReturn(calcResult);
        when(payrollRunRepository.save(any(PayrollRun.class))).thenAnswer(invocation -> {
            PayrollRun run = invocation.getArgument(0);
            run.setId(100L);
            return run;
        });

        PayrollRunResponseDto response = payrollService.triggerPayrollRun(request);

        assertNotNull(response);
        assertEquals("2026-10", response.getPeriod());
        assertEquals(1, response.getTotalEmployees());
        assertEquals(new BigDecimal("3000.00"), response.getTotalBasicSalary());
        assertEquals(new BigDecimal("700.00"), response.getTotalAllowances());
        assertEquals(new BigDecimal("3700.00"), response.getTotalGrossPay());
        assertEquals(new BigDecimal("170.00"), response.getTotalTax());
        assertEquals(new BigDecimal("270.00"), response.getTotalDeductions());
        assertEquals(new BigDecimal("3430.00"), response.getTotalNetPay());
        assertEquals(1, response.getPayslips().size());

        verify(payrollRunRepository, times(1)).save(any(PayrollRun.class));
    }

    @Test
    void testTriggerPayrollRun_AlreadyProcessed_ThrowsException() {
        PayrollRunRequestDto request = PayrollRunRequestDto.builder()
                .period("2026-10")
                .startDate(LocalDate.of(2026, 10, 1))
                .endDate(LocalDate.of(2026, 10, 31))
                .build();

        when(payrollRunRepository.existsByPeriod("2026-10")).thenReturn(true);

        assertThrows(PayrollProcessingException.class, () -> payrollService.triggerPayrollRun(request));
        verify(payrollRunRepository, never()).save(any());
    }

    @Test
    void testTriggerPayrollRun_InvalidDateRange_ThrowsException() {
        PayrollRunRequestDto request = PayrollRunRequestDto.builder()
                .period("2026-10")
                .startDate(LocalDate.of(2026, 10, 31))
                .endDate(LocalDate.of(2026, 10, 1)) // start after end
                .build();

        assertThrows(PayrollProcessingException.class, () -> payrollService.triggerPayrollRun(request));
    }
}
