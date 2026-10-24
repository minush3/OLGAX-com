package com.olgax.hr.service;

import com.olgax.hr.model.Employee;
import com.olgax.hr.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeService employeeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllEmployees() {
        Employee emp1 = new Employee();
        emp1.setId(1L);
        emp1.setFirstName("Minushanth");
        emp1.setLastName("Vijayanathan");
        emp1.setEmail("minushanthnathan@gmail.com");

        when(employeeRepository.findAll()).thenReturn(Arrays.asList(emp1));

        List<Employee> employees = employeeService.getAllEmployees();

        assertEquals(1, employees.size());
        assertEquals("Minushanth", employees.get(0).getFirstName());
        verify(employeeRepository, times(1)).findAll();
    }
}
