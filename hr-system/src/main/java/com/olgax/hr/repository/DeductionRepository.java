package com.olgax.hr.repository;

import com.olgax.hr.model.Deduction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeductionRepository extends JpaRepository<Deduction, Long> {
    List<Deduction> findBySalaryStructureId(Long salaryStructureId);
}
