package com.olgax.hr.repository;

import com.olgax.hr.model.PayrollRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRunRepository extends JpaRepository<PayrollRun, Long> {
    Optional<PayrollRun> findByPeriod(String period);
    boolean existsByPeriod(String period);
    List<PayrollRun> findAllByOrderByProcessedAtDesc();
}
