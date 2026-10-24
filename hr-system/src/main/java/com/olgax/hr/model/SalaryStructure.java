package com.olgax.hr.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "salary_structures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal basicSalary;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal housingAllowance = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal transportAllowance = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal otherAllowances = BigDecimal.ZERO;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(nullable = false)
    private LocalDate effectiveDate;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @OneToMany(mappedBy = "salaryStructure", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<Deduction> deductions = new ArrayList<>();

    public BigDecimal getTotalAllowances() {
        BigDecimal housing = housingAllowance != null ? housingAllowance : BigDecimal.ZERO;
        BigDecimal transport = transportAllowance != null ? transportAllowance : BigDecimal.ZERO;
        BigDecimal other = otherAllowances != null ? otherAllowances : BigDecimal.ZERO;
        return housing.add(transport).add(other);
    }

    public BigDecimal getGrossSalary() {
        BigDecimal base = basicSalary != null ? basicSalary : BigDecimal.ZERO;
        return base.add(getTotalAllowances());
    }

    public void addDeduction(Deduction deduction) {
        deductions.add(deduction);
        deduction.setSalaryStructure(this);
    }

    public void removeDeduction(Deduction deduction) {
        deductions.remove(deduction);
        deduction.setSalaryStructure(null);
    }
}
