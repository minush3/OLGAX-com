package com.olgax.hr.repository;
import com.olgax.hr.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DepartmentRepository extends JpaRepository<Department, Long> {}
