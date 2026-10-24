package com.olgax.hr.controller;

import com.olgax.hr.dto.PayrollRunRequestDto;
import com.olgax.hr.dto.PayrollRunResponseDto;
import com.olgax.hr.dto.PayslipResponseDto;
import com.olgax.hr.service.PayrollService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payroll-runs")
@CrossOrigin(origins = "*")
public class PayrollRunController {

    @Autowired
    private PayrollService payrollService;

    @PostMapping
    public ResponseEntity<PayrollRunResponseDto> triggerPayrollRun(
            @Valid @RequestBody PayrollRunRequestDto request) {
        PayrollRunResponseDto response = payrollService.triggerPayrollRun(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PayrollRunResponseDto>> getAllPayrollRuns() {
        List<PayrollRunResponseDto> runs = payrollService.getAllPayrollRuns();
        return ResponseEntity.ok(runs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PayrollRunResponseDto> getPayrollRunById(@PathVariable Long id) {
        PayrollRunResponseDto run = payrollService.getPayrollRunById(id);
        return ResponseEntity.ok(run);
    }

    @GetMapping("/{id}/payslips")
    public ResponseEntity<List<PayslipResponseDto>> getPayslipsByPayrollRunId(@PathVariable Long id) {
        List<PayslipResponseDto> payslips = payrollService.getPayslipsByPayrollRunId(id);
        return ResponseEntity.ok(payslips);
    }

    @GetMapping("/payslips/{payslipId}")
    public ResponseEntity<PayslipResponseDto> getPayslipById(@PathVariable Long payslipId) {
        PayslipResponseDto payslip = payrollService.getPayslipById(payslipId);
        return ResponseEntity.ok(payslip);
    }

    @GetMapping("/employees/{employeeId}/payslips")
    public ResponseEntity<List<PayslipResponseDto>> getPayslipsByEmployeeId(@PathVariable Long employeeId) {
        List<PayslipResponseDto> payslips = payrollService.getPayslipsByEmployeeId(employeeId);
        return ResponseEntity.ok(payslips);
    }
}
