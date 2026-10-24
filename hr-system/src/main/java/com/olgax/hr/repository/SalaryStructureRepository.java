package com.olgax.hr.repository;

import com.olgax.hr.model.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, Long> {
    Optional<SalaryStructure> findByEmployeeIdAndActiveTrue(Long employeeId);
    List<SalaryStructure> findByEmployeeId(Long employeeId);
    List<SalaryStructure> findAllByActiveTrue();
}
