package com.olgax.hr.service;

import com.olgax.hr.dto.*;
import com.olgax.hr.exception.ResourceNotFoundException;
import com.olgax.hr.model.Deduction;
import com.olgax.hr.model.Employee;
import com.olgax.hr.model.SalaryStructure;
import com.olgax.hr.repository.DeductionRepository;
import com.olgax.hr.repository.EmployeeRepository;
import com.olgax.hr.repository.SalaryStructureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SalaryStructureService {

    @Autowired
    private SalaryStructureRepository salaryStructureRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DeductionRepository deductionRepository;

    public SalaryStructureResponseDto createSalaryStructure(SalaryStructureRequestDto request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        // If marking active, deactivate any existing active salary structure for this employee
        if (Boolean.TRUE.equals(request.getActive())) {
            salaryStructureRepository.findByEmployeeIdAndActiveTrue(request.getEmployeeId())
                    .ifPresent(existing -> {
                        existing.setActive(false);
                        salaryStructureRepository.save(existing);
                    });
        }

        SalaryStructure salaryStructure = SalaryStructure.builder()
                .employee(employee)
                .basicSalary(request.getBasicSalary())
                .housingAllowance(request.getHousingAllowance() != null ? request.getHousingAllowance() : BigDecimal.ZERO)
                .transportAllowance(request.getTransportAllowance() != null ? request.getTransportAllowance() : BigDecimal.ZERO)
                .otherAllowances(request.getOtherAllowances() != null ? request.getOtherAllowances() : BigDecimal.ZERO)
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .effectiveDate(request.getEffectiveDate())
                .active(request.getActive() != null ? request.getActive() : true)
                .deductions(new ArrayList<>())
                .build();

        if (request.getDeductions() != null && !request.getDeductions().isEmpty()) {
            for (DeductionRequestDto deductionDto : request.getDeductions()) {
                Deduction deduction = Deduction.builder()
                        .name(deductionDto.getName())
                        .type(deductionDto.getType())
                        .amount(deductionDto.getAmount() != null ? deductionDto.getAmount() : BigDecimal.ZERO)
                        .percentage(deductionDto.getPercentage())
                        .description(deductionDto.getDescription())
                        .build();
                salaryStructure.addDeduction(deduction);
            }
        }

        SalaryStructure saved = salaryStructureRepository.save(salaryStructure);
        return mapToResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SalaryStructureResponseDto> getAllSalaryStructures(Boolean activeOnly) {
        List<SalaryStructure> list = Boolean.TRUE.equals(activeOnly)
                ? salaryStructureRepository.findAllByActiveTrue()
                : salaryStructureRepository.findAll();

        return list.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalaryStructureResponseDto getSalaryStructureById(Long id) {
        SalaryStructure salaryStructure = salaryStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryStructure", "id", id));
        return mapToResponseDto(salaryStructure);
    }

    @Transactional(readOnly = true)
    public SalaryStructureResponseDto getActiveSalaryStructureByEmployeeId(Long employeeId) {
        SalaryStructure salaryStructure = salaryStructureRepository.findByEmployeeIdAndActiveTrue(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Active SalaryStructure", "employeeId", employeeId));
        return mapToResponseDto(salaryStructure);
    }

    public SalaryStructureResponseDto updateSalaryStructure(Long id, SalaryStructureRequestDto request) {
        SalaryStructure salaryStructure = salaryStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryStructure", "id", id));

        // If employee is being updated, verify new employee exists
        if (!salaryStructure.getEmployee().getId().equals(request.getEmployeeId())) {
            Employee newEmployee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));
            salaryStructure.setEmployee(newEmployee);
        }

        // Handle active flag changes
        if (Boolean.TRUE.equals(request.getActive()) && !salaryStructure.isActive()) {
            salaryStructureRepository.findByEmployeeIdAndActiveTrue(request.getEmployeeId())
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        existing.setActive(false);
                        salaryStructureRepository.save(existing);
                    });
        }

        salaryStructure.setBasicSalary(request.getBasicSalary());
        salaryStructure.setHousingAllowance(request.getHousingAllowance() != null ? request.getHousingAllowance() : BigDecimal.ZERO);
        salaryStructure.setTransportAllowance(request.getTransportAllowance() != null ? request.getTransportAllowance() : BigDecimal.ZERO);
        salaryStructure.setOtherAllowances(request.getOtherAllowances() != null ? request.getOtherAllowances() : BigDecimal.ZERO);
        salaryStructure.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        salaryStructure.setEffectiveDate(request.getEffectiveDate());
        salaryStructure.setActive(request.getActive() != null ? request.getActive() : true);

        // Update deductions if provided
        if (request.getDeductions() != null) {
            salaryStructure.getDeductions().clear();
            for (DeductionRequestDto deductionDto : request.getDeductions()) {
                Deduction deduction = Deduction.builder()
                        .name(deductionDto.getName())
                        .type(deductionDto.getType())
                        .amount(deductionDto.getAmount() != null ? deductionDto.getAmount() : BigDecimal.ZERO)
                        .percentage(deductionDto.getPercentage())
                        .description(deductionDto.getDescription())
                        .build();
                salaryStructure.addDeduction(deduction);
            }
        }

        SalaryStructure updated = salaryStructureRepository.save(salaryStructure);
        return mapToResponseDto(updated);
    }

    public void deleteSalaryStructure(Long id) {
        if (!salaryStructureRepository.existsById(id)) {
            throw new ResourceNotFoundException("SalaryStructure", "id", id);
        }
        salaryStructureRepository.deleteById(id);
    }

    public DeductionResponseDto addDeduction(Long salaryStructureId, DeductionRequestDto deductionDto) {
        SalaryStructure salaryStructure = salaryStructureRepository.findById(salaryStructureId)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryStructure", "id", salaryStructureId));

        Deduction deduction = Deduction.builder()
                .name(deductionDto.getName())
                .type(deductionDto.getType())
                .amount(deductionDto.getAmount() != null ? deductionDto.getAmount() : BigDecimal.ZERO)
                .percentage(deductionDto.getPercentage())
                .description(deductionDto.getDescription())
                .build();

        salaryStructure.addDeduction(deduction);
        Deduction savedDeduction = deductionRepository.save(deduction);

        return mapDeductionToDto(savedDeduction);
    }

    public void removeDeduction(Long salaryStructureId, Long deductionId) {
        SalaryStructure salaryStructure = salaryStructureRepository.findById(salaryStructureId)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryStructure", "id", salaryStructureId));

        Deduction deduction = deductionRepository.findById(deductionId)
                .orElseThrow(() -> new ResourceNotFoundException("Deduction", "id", deductionId));

        salaryStructure.removeDeduction(deduction);
        deductionRepository.delete(deduction);
    }

    public SalaryStructureResponseDto mapToResponseDto(SalaryStructure entity) {
        List<DeductionResponseDto> deductionDtos = entity.getDeductions() != null
                ? entity.getDeductions().stream().map(this::mapDeductionToDto).collect(Collectors.toList())
                : new ArrayList<>();

        Employee emp = entity.getEmployee();
        String employeeName = emp != null ? emp.getFirstName() + " " + emp.getLastName() : "";
        String employeeEmail = emp != null ? emp.getEmail() : "";

        return SalaryStructureResponseDto.builder()
                .id(entity.getId())
                .employeeId(emp != null ? emp.getId() : null)
                .employeeName(employeeName)
                .employeeEmail(employeeEmail)
                .basicSalary(entity.getBasicSalary())
                .housingAllowance(entity.getHousingAllowance())
                .transportAllowance(entity.getTransportAllowance())
                .otherAllowances(entity.getOtherAllowances())
                .totalAllowances(entity.getTotalAllowances())
                .grossSalary(entity.getGrossSalary())
                .currency(entity.getCurrency())
                .effectiveDate(entity.getEffectiveDate())
                .active(entity.isActive())
                .deductions(deductionDtos)
                .build();
    }

    private DeductionResponseDto mapDeductionToDto(Deduction deduction) {
        return DeductionResponseDto.builder()
                .id(deduction.getId())
                .name(deduction.getName())
                .type(deduction.getType())
                .amount(deduction.getAmount())
                .percentage(deduction.getPercentage())
                .description(deduction.getDescription())
                .build();
    }
}
