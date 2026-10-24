package com.olgax.hr.controller;

import com.olgax.hr.dto.DeductionRequestDto;
import com.olgax.hr.dto.DeductionResponseDto;
import com.olgax.hr.dto.SalaryStructureRequestDto;
import com.olgax.hr.dto.SalaryStructureResponseDto;
import com.olgax.hr.service.SalaryStructureService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/salary-structures")
@CrossOrigin(origins = "*")
public class SalaryStructureController {

    @Autowired
    private SalaryStructureService salaryStructureService;

    @PostMapping
    public ResponseEntity<SalaryStructureResponseDto> createSalaryStructure(
            @Valid @RequestBody SalaryStructureRequestDto request) {
        SalaryStructureResponseDto created = salaryStructureService.createSalaryStructure(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SalaryStructureResponseDto>> getAllSalaryStructures(
            @RequestParam(required = false) Boolean activeOnly) {
        List<SalaryStructureResponseDto> list = salaryStructureService.getAllSalaryStructures(activeOnly);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalaryStructureResponseDto> getSalaryStructureById(@PathVariable Long id) {
        SalaryStructureResponseDto dto = salaryStructureService.getSalaryStructureById(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<SalaryStructureResponseDto> getActiveSalaryStructureByEmployeeId(
            @PathVariable Long employeeId) {
        SalaryStructureResponseDto dto = salaryStructureService.getActiveSalaryStructureByEmployeeId(employeeId);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalaryStructureResponseDto> updateSalaryStructure(
            @PathVariable Long id,
            @Valid @RequestBody SalaryStructureRequestDto request) {
        SalaryStructureResponseDto updated = salaryStructureService.updateSalaryStructure(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSalaryStructure(@PathVariable Long id) {
        salaryStructureService.deleteSalaryStructure(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/deductions")
    public ResponseEntity<DeductionResponseDto> addDeduction(
            @PathVariable Long id,
            @Valid @RequestBody DeductionRequestDto request) {
        DeductionResponseDto added = salaryStructureService.addDeduction(id, request);
        return new ResponseEntity<>(added, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}/deductions/{deductionId}")
    public ResponseEntity<Void> removeDeduction(
            @PathVariable Long id,
            @PathVariable Long deductionId) {
        salaryStructureService.removeDeduction(id, deductionId);
        return ResponseEntity.noContent().build();
    }
}
