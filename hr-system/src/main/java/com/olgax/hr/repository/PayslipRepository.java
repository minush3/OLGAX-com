package com.olgax.hr.repository;

import com.olgax.hr.model.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, Long> {
    List<Payslip> findByPayrollRunId(Long payrollRunId);
    List<Payslip> findByEmployeeId(Long employeeId);
    Optional<Payslip> findByPayrollRunIdAndEmployeeId(Long payrollRunId, Long employeeId);
}
