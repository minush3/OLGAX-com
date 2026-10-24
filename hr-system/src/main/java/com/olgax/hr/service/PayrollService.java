package com.olgax.hr.service;

import com.olgax.hr.dto.*;
import com.olgax.hr.exception.PayrollProcessingException;
import com.olgax.hr.exception.ResourceNotFoundException;
import com.olgax.hr.model.*;
import com.olgax.hr.repository.EmployeeRepository;
import com.olgax.hr.repository.PayrollRunRepository;
import com.olgax.hr.repository.PayslipRepository;
import com.olgax.hr.repository.SalaryStructureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PayrollService {

    @Autowired
    private PayrollRunRepository payrollRunRepository;

    @Autowired
    private PayslipRepository payslipRepository;

    @Autowired
    private SalaryStructureRepository salaryStructureRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PayrollCalculationService calculationService;

    /**
     * Triggers and executes a payroll run for a given period.
     * Computes payslips for each eligible employee using the PayrollCalculationService (v0.1).
     *
     * @param request details of the payroll run
     * @return the completed PayrollRunResponseDto
     */
    public PayrollRunResponseDto triggerPayrollRun(PayrollRunRequestDto request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new PayrollProcessingException("Payroll start date cannot be after end date");
        }

        if (payrollRunRepository.existsByPeriod(request.getPeriod())) {
            throw new PayrollProcessingException("Payroll has already been processed for period: " + request.getPeriod());
        }

        // Determine target employees
        List<Employee> targetEmployees;
        if (request.getEmployeeIds() != null && !request.getEmployeeIds().isEmpty()) {
            targetEmployees = employeeRepository.findAllById(request.getEmployeeIds());
            if (targetEmployees.isEmpty()) {
                throw new PayrollProcessingException("No matching employees found for the provided IDs");
            }
        } else {
            // All active employees
            targetEmployees = employeeRepository.findAll().stream()
                    .filter(Employee::isActive)
                    .collect(Collectors.toList());
        }

        if (targetEmployees.isEmpty()) {
            throw new PayrollProcessingException("No active employees available to process payroll");
        }

        PayrollRun payrollRun = PayrollRun.builder()
                .period(request.getPeriod())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .paymentDate(request.getPaymentDate())
                .status(PayrollStatus.COMPLETED)
                .notes(request.getNotes())
                .processedAt(LocalDateTime.now())
                .payslips(new ArrayList<>())
                .build();

        BigDecimal sumBasic = BigDecimal.ZERO;
        BigDecimal sumAllowances = BigDecimal.ZERO;
        BigDecimal sumGross = BigDecimal.ZERO;
        BigDecimal sumTax = BigDecimal.ZERO;
        BigDecimal sumDeductions = BigDecimal.ZERO;
        BigDecimal sumNetPay = BigDecimal.ZERO;
        int processedCount = 0;

        for (Employee employee : targetEmployees) {
            Optional<SalaryStructure> structureOpt = salaryStructureRepository
                    .findByEmployeeIdAndActiveTrue(employee.getId());

            // Skip employees who do not have an active salary structure assigned
            if (structureOpt.isEmpty()) {
                continue;
            }

            SalaryStructure structure = structureOpt.get();
            PayrollCalculationResult calc = calculationService.calculateForSalaryStructure(structure);

            Payslip payslip = Payslip.builder()
                    .employee(employee)
                    .basicSalary(calc.getBasicSalary())
                    .housingAllowance(structure.getHousingAllowance() != null ? structure.getHousingAllowance() : BigDecimal.ZERO)
                    .transportAllowance(structure.getTransportAllowance() != null ? structure.getTransportAllowance() : BigDecimal.ZERO)
                    .otherAllowances(structure.getOtherAllowances() != null ? structure.getOtherAllowances() : BigDecimal.ZERO)
                    .totalAllowances(calc.getAllowances())
                    .grossPay(calc.getGrossPay())
                    .taxAmount(calc.getTaxAmount())
                    .deductionsAmount(calc.getDeductionsAmount())
                    .totalDeductions(calc.getTotalDeductions())
                    .netPay(calc.getNetPay())
                    .currency(structure.getCurrency())
                    .status("GENERATED")
                    .generatedAt(LocalDateTime.now())
                    .build();

            payrollRun.addPayslip(payslip);

            sumBasic = sumBasic.add(calc.getBasicSalary());
            sumAllowances = sumAllowances.add(calc.getAllowances());
            sumGross = sumGross.add(calc.getGrossPay());
            sumTax = sumTax.add(calc.getTaxAmount());
            sumDeductions = sumDeductions.add(calc.getTotalDeductions());
            sumNetPay = sumNetPay.add(calc.getNetPay());
            processedCount++;
        }

        if (processedCount == 0) {
            throw new PayrollProcessingException(
                    "No employees with an active SalaryStructure could be processed for period: " + request.getPeriod());
        }

        payrollRun.setTotalBasicSalary(sumBasic);
        payrollRun.setTotalAllowances(sumAllowances);
        payrollRun.setTotalGrossPay(sumGross);
        payrollRun.setTotalTax(sumTax);
        payrollRun.setTotalDeductions(sumDeductions);
        payrollRun.setTotalNetPay(sumNetPay);
        payrollRun.setTotalEmployees(processedCount);

        PayrollRun savedRun = payrollRunRepository.save(payrollRun);
        return mapToResponseDto(savedRun, true);
    }

    @Transactional(readOnly = true)
    public List<PayrollRunResponseDto> getAllPayrollRuns() {
        return payrollRunRepository.findAllByOrderByProcessedAtDesc().stream()
                .map(run -> mapToResponseDto(run, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PayrollRunResponseDto getPayrollRunById(Long id) {
        PayrollRun payrollRun = payrollRunRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PayrollRun", "id", id));
        return mapToResponseDto(payrollRun, true);
    }

    @Transactional(readOnly = true)
    public List<PayslipResponseDto> getPayslipsByPayrollRunId(Long payrollRunId) {
        if (!payrollRunRepository.existsById(payrollRunId)) {
            throw new ResourceNotFoundException("PayrollRun", "id", payrollRunId);
        }
        return payslipRepository.findByPayrollRunId(payrollRunId).stream()
                .map(this::mapPayslipToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PayslipResponseDto getPayslipById(Long payslipId) {
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> new ResourceNotFoundException("Payslip", "id", payslipId));
        return mapPayslipToDto(payslip);
    }

    @Transactional(readOnly = true)
    public List<PayslipResponseDto> getPayslipsByEmployeeId(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee", "id", employeeId);
        }
        return payslipRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapPayslipToDto)
                .collect(Collectors.toList());
    }

    private PayrollRunResponseDto mapToResponseDto(PayrollRun run, boolean includePayslips) {
        List<PayslipResponseDto> payslipDtos = null;
        if (includePayslips && run.getPayslips() != null) {
            payslipDtos = run.getPayslips().stream()
                    .map(this::mapPayslipToDto)
                    .collect(Collectors.toList());
        }

        return PayrollRunResponseDto.builder()
                .id(run.getId())
                .period(run.getPeriod())
                .startDate(run.getStartDate())
                .endDate(run.getEndDate())
                .paymentDate(run.getPaymentDate())
                .status(run.getStatus())
                .totalBasicSalary(run.getTotalBasicSalary())
                .totalAllowances(run.getTotalAllowances())
                .totalGrossPay(run.getTotalGrossPay())
                .totalTax(run.getTotalTax())
                .totalDeductions(run.getTotalDeductions())
                .totalNetPay(run.getTotalNetPay())
                .totalEmployees(run.getTotalEmployees())
                .processedAt(run.getProcessedAt())
                .notes(run.getNotes())
                .payslips(payslipDtos)
                .build();
    }

    public PayslipResponseDto mapPayslipToDto(Payslip payslip) {
        Employee emp = payslip.getEmployee();
        String employeeName = emp != null ? emp.getFirstName() + " " + emp.getLastName() : "";
        String employeeEmail = emp != null ? emp.getEmail() : "";
        String departmentName = (emp != null && emp.getDepartment() != null) ? emp.getDepartment().getName() : null;
        String positionTitle = (emp != null && emp.getPosition() != null) ? emp.getPosition().getTitle() : null;
        String period = payslip.getPayrollRun() != null ? payslip.getPayrollRun().getPeriod() : null;
        Long payrollRunId = payslip.getPayrollRun() != null ? payslip.getPayrollRun().getId() : null;

        return PayslipResponseDto.builder()
                .id(payslip.getId())
                .payrollRunId(payrollRunId)
                .period(period)
                .employeeId(emp != null ? emp.getId() : null)
                .employeeName(employeeName)
                .employeeEmail(employeeEmail)
                .departmentName(departmentName)
                .positionTitle(positionTitle)
                .basicSalary(payslip.getBasicSalary())
                .housingAllowance(payslip.getHousingAllowance())
                .transportAllowance(payslip.getTransportAllowance())
                .otherAllowances(payslip.getOtherAllowances())
                .totalAllowances(payslip.getTotalAllowances())
                .grossPay(payslip.getGrossPay())
                .taxAmount(payslip.getTaxAmount())
                .deductionsAmount(payslip.getDeductionsAmount())
                .totalDeductions(payslip.getTotalDeductions())
                .netPay(payslip.getNetPay())
                .currency(payslip.getCurrency())
                .generatedAt(payslip.getGeneratedAt())
                .status(payslip.getStatus())
                .build();
    }
}
