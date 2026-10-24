"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Calendar,
  CreditCard,
  Plus,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Printer,
  Search,
  FileText,
  Building,
  User,
  RefreshCw,
  Percent,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Check,
  X,
  Briefcase,
  Layers,
  ArrowLeft,
  Sparkles,
  Download,
  SlidersHorizontal,
} from "lucide-react";

// =============================================================================
// TypeScript Interfaces & Types
// =============================================================================

export type DeductionType = "FIXED" | "PERCENTAGE";
export type PayrollStatus = "DRAFT" | "APPROVED" | "PAID" | "COMPLETED";

export interface DeductionItem {
  id?: number;
  name: string;
  type: DeductionType;
  amount: number;
  percentage?: number;
  description?: string;
}

export interface EmployeeInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  position?: string;
}

export interface SalaryStructure {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  totalAllowances: number;
  grossSalary: number;
  currency: string;
  effectiveDate: string;
  active: boolean;
  deductions: DeductionItem[];
}

export interface Payslip {
  id: number;
  payrollRunId: number;
  period: string;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  departmentName?: string;
  positionTitle?: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  totalAllowances: number;
  grossPay: number;
  taxAmount: number;
  deductionsAmount: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
  generatedAt: string;
  status: string;
}

export interface PayrollRun {
  id: number;
  period: string;
  startDate: string;
  endDate: string;
  paymentDate?: string;
  status: PayrollStatus;
  totalBasicSalary: number;
  totalAllowances: number;
  totalGrossPay: number;
  totalTax: number;
  totalDeductions: number;
  totalNetPay: number;
  totalEmployees: number;
  processedAt: string;
  notes?: string;
  payslips?: Payslip[];
}

// =============================================================================
// Realistic Mock Data for Standalone & Offline Testing
// =============================================================================

const MOCK_EMPLOYEES: EmployeeInfo[] = [
  { id: 1, firstName: "Minushanth", lastName: "Vijayanathan", email: "minushanth@olgax.com", department: "Engineering", position: "Lead Architect" },
  { id: 2, firstName: "Sarah", lastName: "Jenkins", email: "sarah.j@olgax.com", department: "Human Resources", position: "HR Director" },
  { id: 3, firstName: "David", lastName: "Chen", email: "david.c@olgax.com", department: "Product Design", position: "Senior UI/UX Designer" },
  { id: 4, firstName: "Amara", lastName: "Okafor", email: "amara.o@olgax.com", department: "Finance & Accounting", position: "Senior Accountant" },
  { id: 5, firstName: "Liam", lastName: "O'Connor", email: "liam.oc@olgax.com", department: "Engineering", position: "Fullstack Engineer" },
];

const INITIAL_SALARY_STRUCTURES: SalaryStructure[] = [
  {
    id: 1,
    employeeId: 1,
    employeeName: "Minushanth Vijayanathan",
    employeeEmail: "minushanth@olgax.com",
    basicSalary: 6500.0,
    housingAllowance: 800.0,
    transportAllowance: 400.0,
    otherAllowances: 300.0,
    totalAllowances: 1500.0,
    grossSalary: 8000.0,
    currency: "USD",
    effectiveDate: "2026-01-01",
    active: true,
    deductions: [
      { id: 101, name: "Income Tax", type: "FIXED", amount: 620.0, description: "Standard withholding tax" },
      { id: 102, name: "Health Insurance", type: "FIXED", amount: 180.0, description: "Comprehensive corporate medical" },
      { id: 103, name: "Provident Fund", type: "PERCENTAGE", amount: 325.0, percentage: 5.0, description: "5% retirement contribution" },
    ],
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: "Sarah Jenkins",
    employeeEmail: "sarah.j@olgax.com",
    basicSalary: 5200.0,
    housingAllowance: 600.0,
    transportAllowance: 300.0,
    otherAllowances: 200.0,
    totalAllowances: 1100.0,
    grossSalary: 6300.0,
    currency: "USD",
    effectiveDate: "2026-02-01",
    active: true,
    deductions: [
      { id: 201, name: "Income Tax", type: "FIXED", amount: 480.0 },
      { id: 202, name: "Health Insurance", type: "FIXED", amount: 150.0 },
    ],
  },
  {
    id: 3,
    employeeId: 3,
    employeeName: "David Chen",
    employeeEmail: "david.c@olgax.com",
    basicSalary: 4500.0,
    housingAllowance: 500.0,
    transportAllowance: 250.0,
    otherAllowances: 150.0,
    totalAllowances: 900.0,
    grossSalary: 5400.0,
    currency: "USD",
    effectiveDate: "2026-03-01",
    active: true,
    deductions: [
      { id: 301, name: "Income Tax", type: "FIXED", amount: 390.0 },
      { id: 302, name: "Gym Membership", type: "FIXED", amount: 50.0 },
    ],
  },
];

const INITIAL_PAYROLL_RUNS: PayrollRun[] = [
  {
    id: 1,
    period: "2026-10",
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    paymentDate: "2026-10-31",
    status: "PAID",
    totalBasicSalary: 16200.0,
    totalAllowances: 3500.0,
    totalGrossPay: 19700.0,
    totalTax: 1490.0,
    totalDeductions: 2195.0,
    totalNetPay: 17505.0,
    totalEmployees: 3,
    processedAt: "2026-10-24T18:30:00",
    notes: "October regular salary disbursement completed.",
    payslips: [
      {
        id: 1001,
        payrollRunId: 1,
        period: "2026-10",
        employeeId: 1,
        employeeName: "Minushanth Vijayanathan",
        employeeEmail: "minushanth@olgax.com",
        departmentName: "Engineering",
        positionTitle: "Lead Architect",
        basicSalary: 6500.0,
        housingAllowance: 800.0,
        transportAllowance: 400.0,
        otherAllowances: 300.0,
        totalAllowances: 1500.0,
        grossPay: 8000.0,
        taxAmount: 620.0,
        deductionsAmount: 505.0,
        totalDeductions: 1125.0,
        netPay: 6875.0,
        currency: "USD",
        generatedAt: "2026-10-24T18:30:00",
        status: "PAID",
      },
      {
        id: 1002,
        payrollRunId: 1,
        period: "2026-10",
        employeeId: 2,
        employeeName: "Sarah Jenkins",
        employeeEmail: "sarah.j@olgax.com",
        departmentName: "Human Resources",
        positionTitle: "HR Director",
        basicSalary: 5200.0,
        housingAllowance: 600.0,
        transportAllowance: 300.0,
        otherAllowances: 200.0,
        totalAllowances: 1100.0,
        grossPay: 6300.0,
        taxAmount: 480.0,
        deductionsAmount: 150.0,
        totalDeductions: 630.0,
        netPay: 5670.0,
        currency: "USD",
        generatedAt: "2026-10-24T18:30:00",
        status: "PAID",
      },
      {
        id: 1003,
        payrollRunId: 1,
        period: "2026-10",
        employeeId: 3,
        employeeName: "David Chen",
        employeeEmail: "david.c@olgax.com",
        departmentName: "Product Design",
        positionTitle: "Senior UI/UX Designer",
        basicSalary: 4500.0,
        housingAllowance: 500.0,
        transportAllowance: 250.0,
        otherAllowances: 150.0,
        totalAllowances: 900.0,
        grossPay: 5400.0,
        taxAmount: 390.0,
        deductionsAmount: 50.0,
        totalDeductions: 440.0,
        netPay: 4960.0,
        currency: "USD",
        generatedAt: "2026-10-24T18:30:00",
        status: "PAID",
      },
    ],
  },
  {
    id: 2,
    period: "2026-09",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    paymentDate: "2026-09-30",
    status: "PAID",
    totalBasicSalary: 16200.0,
    totalAllowances: 3500.0,
    totalGrossPay: 19700.0,
    totalTax: 1490.0,
    totalDeductions: 2195.0,
    totalNetPay: 17505.0,
    totalEmployees: 3,
    processedAt: "2026-09-30T17:00:00",
    notes: "September payroll finalized.",
    payslips: [],
  },
  {
    id: 3,
    period: "2026-11",
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    paymentDate: "2026-11-30",
    status: "DRAFT",
    totalBasicSalary: 16200.0,
    totalAllowances: 3500.0,
    totalGrossPay: 19700.0,
    totalTax: 1490.0,
    totalDeductions: 2195.0,
    totalNetPay: 17505.0,
    totalEmployees: 3,
    processedAt: "2026-10-24T19:00:00",
    notes: "Upcoming November payroll draft calculation.",
    payslips: [],
  },
];

const API_BASE = "http://127.0.0.1:8080/api/v1";

// =============================================================================
// Helper Calculation Engine (Frontend Mirror of v0.1 Calculation)
// =============================================================================

function calculatePayrollValues(
  basicSalary: number,
  housing: number,
  transport: number,
  other: number,
  deductions: DeductionItem[]
) {
  const safeBasic = isNaN(basicSalary) || basicSalary < 0 ? 0 : basicSalary;
  const safeHousing = isNaN(housing) || housing < 0 ? 0 : housing;
  const safeTransport = isNaN(transport) || transport < 0 ? 0 : transport;
  const safeOther = isNaN(other) || other < 0 ? 0 : other;

  const totalAllowances = safeHousing + safeTransport + safeOther;
  const grossPay = safeBasic + totalAllowances;

  let totalDeductionsAmount = 0;
  let taxAmount = 0;

  deductions.forEach((d) => {
    let dVal = 0;
    if (d.type === "PERCENTAGE") {
      const pct = (d.percentage || 0) / 100;
      dVal = safeBasic * pct;
    } else {
      dVal = d.amount || 0;
    }

    if (d.name && d.name.toLowerCase().includes("tax")) {
      taxAmount += dVal;
    } else {
      totalDeductionsAmount += dVal;
    }
  });

  // Standard progressive withholding fallback if no explicit tax deduction
  if (taxAmount === 0 && grossPay > 0) {
    if (grossPay <= 1000) {
      taxAmount = 0;
    } else if (grossPay <= 3000) {
      taxAmount = (grossPay - 1000) * 0.05;
    } else {
      taxAmount = 100 + (grossPay - 3000) * 0.1;
    }
  }

  const allDeductions = taxAmount + totalDeductionsAmount;
  const netPay = Math.max(0, grossPay - allDeductions);

  return {
    basicSalary: safeBasic,
    totalAllowances,
    grossPay,
    taxAmount,
    deductionsAmount: totalDeductionsAmount,
    totalDeductions: allDeductions,
    netPay,
  };
}

// =============================================================================
// Main Component
// =============================================================================

export default function PayrollDashboard() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<"runs" | "structures" | "calculator">("runs");

  // Core Data States
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(INITIAL_PAYROLL_RUNS);
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>(INITIAL_SALARY_STRUCTURES);
  const [employees, setEmployees] = useState<EmployeeInfo[]>(MOCK_EMPLOYEES);

  // Status & Connectivity States
  const [loading, setLoading] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Search & Filter
  const [runSearchQuery, setRunSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal States
  const [isCreateRunOpen, setIsCreateRunOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [viewingRunPayslips, setViewingRunPayslips] = useState<PayrollRun | null>(null);

  // Form State: Create Payroll Run
  const [runForm, setRunForm] = useState({
    period: "2026-11",
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    paymentDate: "2026-11-30",
    notes: "",
  });
  const [runFormErrors, setRunFormErrors] = useState<{ [key: string]: string }>({});

  // Form State: Salary Structure Form
  const [structureForm, setStructureForm] = useState<{
    employeeId: number;
    basicSalary: number;
    housingAllowance: number;
    transportAllowance: number;
    otherAllowances: number;
    currency: string;
    effectiveDate: string;
    active: boolean;
    deductions: DeductionItem[];
  }>({
    employeeId: 1,
    basicSalary: 5000,
    housingAllowance: 600,
    transportAllowance: 300,
    otherAllowances: 150,
    currency: "USD",
    effectiveDate: "2026-11-01",
    active: true,
    deductions: [
      { name: "Income Tax", type: "FIXED" as DeductionType, amount: 450, percentage: 0, description: "Withholding" },
      { name: "Health Insurance", type: "FIXED" as DeductionType, amount: 150, percentage: 0, description: "Medical Plan" },
      { name: "Provident Fund", type: "PERCENTAGE" as DeductionType, amount: 0, percentage: 5, description: "5% pension" },
    ],
  });
  const [structureFormErrors, setStructureFormErrors] = useState<{ [key: string]: string }>({});

  // Real-time calculation preview for Salary Structure Form
  const previewCalculation = useMemo(() => {
    return calculatePayrollValues(
      structureForm.basicSalary,
      structureForm.housingAllowance,
      structureForm.transportAllowance,
      structureForm.otherAllowances,
      structureForm.deductions
    );
  }, [structureForm]);

  // =============================================================================
  // Data Fetching with Resilient Fallback to Mock Data
  // =============================================================================

  const fetchData = async () => {
    setLoading(true);
    setStatusMessage(null);

    try {
      // Test backend availability with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const [runsRes, structuresRes, empRes] = await Promise.all([
        fetch(`${API_BASE}/payroll-runs`, { signal: controller.signal }).catch(() => null),
        fetch(`${API_BASE}/salary-structures`, { signal: controller.signal }).catch(() => null),
        fetch(`${API_BASE}/employees`, { signal: controller.signal }).catch(() => null),
      ]);
      clearTimeout(timeoutId);

      if (runsRes && runsRes.ok) {
        const runsData = await runsRes.json();
        setPayrollRuns(runsData.length > 0 ? runsData : INITIAL_PAYROLL_RUNS);
        setIsBackendConnected(true);
      } else {
        setIsBackendConnected(false);
      }

      if (structuresRes && structuresRes.ok) {
        const structuresData = await structuresRes.json();
        setSalaryStructures(structuresData.length > 0 ? structuresData : INITIAL_SALARY_STRUCTURES);
      }

      if (empRes && empRes.ok) {
        const empData = await empRes.json();
        if (empData.length > 0) setEmployees(empData);
      }
    } catch {
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =============================================================================
  // Handlers: Create Payroll Run
  // =============================================================================

  const validateRunForm = () => {
    const errors: { [key: string]: string } = {};
    if (!runForm.period.trim()) errors.period = "Period is required (e.g., 2026-11)";
    if (!runForm.startDate) errors.startDate = "Start date is required";
    if (!runForm.endDate) errors.endDate = "End date is required";
    if (runForm.startDate && runForm.endDate && runForm.startDate > runForm.endDate) {
      errors.endDate = "End date cannot be prior to start date";
    }
    setRunFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreatePayrollRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRunForm()) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      if (isBackendConnected) {
        const res = await fetch(`${API_BASE}/payroll-runs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(runForm),
        });

        if (res.ok) {
          const newRun: PayrollRun = await res.json();
          setPayrollRuns([newRun, ...payrollRuns]);
          setIsCreateRunOpen(false);
          setStatusMessage({ type: "success", text: `Payroll run for ${runForm.period} successfully triggered!` });
          return;
        }
      }

      // Standalone / Mock execution
      await new Promise((r) => setTimeout(r, 600)); // Simulate processing latency

      // Calculate payslips for all active salary structures
      const generatedPayslips: Payslip[] = salaryStructures.map((s, index) => {
        const calc = calculatePayrollValues(
          s.basicSalary,
          s.housingAllowance,
          s.transportAllowance,
          s.otherAllowances,
          s.deductions
        );
        const emp = employees.find((e) => e.id === s.employeeId);

        return {
          id: Date.now() + index,
          payrollRunId: Date.now(),
          period: runForm.period,
          employeeId: s.employeeId,
          employeeName: s.employeeName,
          employeeEmail: s.employeeEmail,
          departmentName: emp?.department || "General Operations",
          positionTitle: emp?.position || "Staff Member",
          basicSalary: calc.basicSalary,
          housingAllowance: s.housingAllowance,
          transportAllowance: s.transportAllowance,
          otherAllowances: s.otherAllowances,
          totalAllowances: calc.totalAllowances,
          grossPay: calc.grossPay,
          taxAmount: calc.taxAmount,
          deductionsAmount: calc.deductionsAmount,
          totalDeductions: calc.totalDeductions,
          netPay: calc.netPay,
          currency: s.currency,
          generatedAt: new Date().toISOString(),
          status: "GENERATED",
        };
      });

      const totalBasic = generatedPayslips.reduce((sum, p) => sum + p.basicSalary, 0);
      const totalAllowances = generatedPayslips.reduce((sum, p) => sum + p.totalAllowances, 0);
      const totalGross = generatedPayslips.reduce((sum, p) => sum + p.grossPay, 0);
      const totalTax = generatedPayslips.reduce((sum, p) => sum + p.taxAmount, 0);
      const totalDeductions = generatedPayslips.reduce((sum, p) => sum + p.totalDeductions, 0);
      const totalNet = generatedPayslips.reduce((sum, p) => sum + p.netPay, 0);

      const newRun: PayrollRun = {
        id: Date.now(),
        period: runForm.period,
        startDate: runForm.startDate,
        endDate: runForm.endDate,
        paymentDate: runForm.paymentDate,
        status: "APPROVED",
        totalBasicSalary: totalBasic,
        totalAllowances,
        totalGrossPay: totalGross,
        totalTax,
        totalDeductions,
        totalNetPay: totalNet,
        totalEmployees: generatedPayslips.length,
        processedAt: new Date().toISOString(),
        notes: runForm.notes,
        payslips: generatedPayslips,
      };

      setPayrollRuns([newRun, ...payrollRuns]);
      setIsCreateRunOpen(false);
      setStatusMessage({
        type: "success",
        text: `Successfully executed Payroll Run for ${runForm.period} (${generatedPayslips.length} payslips generated).`,
      });
    } catch {
      setStatusMessage({ type: "error", text: "Failed to execute payroll run. Please verify details." });
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // Handlers: Salary Structure Form
  // =============================================================================

  const validateStructureForm = () => {
    const errors: { [key: string]: string } = {};
    if (!structureForm.employeeId) errors.employeeId = "Please select an employee";
    if (structureForm.basicSalary <= 0) errors.basicSalary = "Basic salary must be greater than 0";
    if (structureForm.housingAllowance < 0) errors.housingAllowance = "Cannot be negative";
    if (structureForm.transportAllowance < 0) errors.transportAllowance = "Cannot be negative";
    if (structureForm.otherAllowances < 0) errors.otherAllowances = "Cannot be negative";
    setStructureFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSalaryStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStructureForm()) return;

    setLoading(true);
    setStatusMessage(null);

    const emp = employees.find((e) => e.id === Number(structureForm.employeeId));
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : "Employee #" + structureForm.employeeId;
    const empEmail = emp ? emp.email : "employee@olgax.com";

    const payload = {
      ...structureForm,
      basicSalary: Number(structureForm.basicSalary),
      housingAllowance: Number(structureForm.housingAllowance || 0),
      transportAllowance: Number(structureForm.transportAllowance || 0),
      otherAllowances: Number(structureForm.otherAllowances || 0),
      employeeName: empName,
      employeeEmail: empEmail,
      totalAllowances: previewCalculation.totalAllowances,
      grossSalary: previewCalculation.grossPay,
    };

    try {
      if (isBackendConnected) {
        const res = await fetch(`${API_BASE}/salary-structures`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const saved: SalaryStructure = await res.json();
          setSalaryStructures([saved, ...salaryStructures.filter((s) => s.employeeId !== saved.employeeId)]);
          setIsStructureModalOpen(false);
          setStatusMessage({ type: "success", text: `Salary structure saved for ${empName}!` });
          return;
        }
      }

      // Mock update
      await new Promise((r) => setTimeout(r, 400));
      const newStructure: SalaryStructure = {
        id: Date.now(),
        ...payload,
        deductions: structureForm.deductions.map((d, i) => ({
          id: Date.now() + i,
          ...d,
        })),
      };

      setSalaryStructures([
        newStructure,
        ...salaryStructures.filter((s) => s.employeeId !== newStructure.employeeId),
      ]);
      setIsStructureModalOpen(false);
      setStatusMessage({ type: "success", text: `Salary structure updated for ${empName} (Gross: $${payload.grossSalary.toLocaleString()})!` });
    } catch {
      setStatusMessage({ type: "error", text: "Failed to save salary structure." });
    } finally {
      setLoading(false);
    }
  };

  // Add & remove deductions in salary structure form
  const handleAddDeductionRow = () => {
    setStructureForm({
      ...structureForm,
      deductions: [
        ...structureForm.deductions,
        { name: "New Deduction", type: "FIXED", amount: 100, percentage: 0, description: "" },
      ],
    });
  };

  const handleRemoveDeductionRow = (index: number) => {
    const updated = [...structureForm.deductions];
    updated.splice(index, 1);
    setStructureForm({ ...structureForm, deductions: updated });
  };

  const handleDeductionChange = (index: number, field: keyof DeductionItem, value: any) => {
    const updated = [...structureForm.deductions];
    updated[index] = { ...updated[index], [field]: value };
    setStructureForm({ ...structureForm, deductions: updated });
  };

  // Status transitions for payroll runs (Draft -> Approved -> Paid)
  const handleRunStatusUpdate = (runId: number, nextStatus: PayrollStatus) => {
    setPayrollRuns(
      payrollRuns.map((r) => {
        if (r.id === runId) {
          return {
            ...r,
            status: nextStatus,
            payslips: r.payslips?.map((p) => ({ ...p, status: nextStatus === "PAID" ? "PAID" : p.status })),
          };
        }
        return r;
      })
    );
    setStatusMessage({ type: "success", text: `Payroll Run status updated to ${nextStatus}.` });
  };

  // Open single payslip modal
  const handleOpenPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setIsPayslipModalOpen(true);
  };

  // =============================================================================
  // Filtering & Computed Stats
  // =============================================================================

  const filteredRuns = useMemo(() => {
    return payrollRuns.filter((run) => {
      const matchesSearch = run.period.toLowerCase().includes(runSearchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || run.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payrollRuns, runSearchQuery, statusFilter]);

  const kpis = useMemo(() => {
    const totalDisbursed = payrollRuns
      .filter((r) => r.status === "PAID" || r.status === "COMPLETED")
      .reduce((sum, r) => sum + r.totalNetPay, 0);

    const activeStructuresCount = salaryStructures.filter((s) => s.active).length;
    const completedRunsCount = payrollRuns.filter((r) => r.status === "PAID" || r.status === "COMPLETED").length;
    const avgNet =
      salaryStructures.length > 0
        ? salaryStructures.reduce((sum, s) => sum + (s.grossSalary - (s.basicSalary * 0.15)), 0) / salaryStructures.length
        : 0;

    return { totalDisbursed, activeStructuresCount, completedRunsCount, avgNet };
  }, [payrollRuns, salaryStructures]);

  // Status badge styling helper
  const getStatusBadge = (status: PayrollStatus | string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="size-3 text-emerald-600" />
            Paid
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <ShieldCheck className="size-3 text-blue-600" />
            Approved
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <Check className="size-3 text-purple-600" />
            Completed
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="size-3 text-amber-600" />
            Draft
          </span>
        );
    }
  };

  // =============================================================================
  // JSX Render
  // =============================================================================

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-sm shadow-indigo-200">
              <DollarSign className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Payroll Management
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Calculate compensation, execute monthly payroll runs, and generate itemized payslips.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Connection Mode Indicator */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
              isBackendConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
            title={isBackendConnected ? "Connected to Spring Boot API" : "Using In-Memory Interactive Mock Mode"}
          >
            <span
              className={`size-2 rounded-full ${isBackendConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
            />
            {isBackendConnected ? "Live Backend" : "Demo Mock Mode"}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="text-slate-700 hover:text-slate-900"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStructureModalOpen(true)}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <Plus className="size-3.5 mr-1.5" />
            Set Up Salary
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateRunOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-300"
          >
            <CreditCard className="size-3.5 mr-1.5" />
            Create Payroll Run
          </Button>
        </div>
      </div>

      {/* Status Notifications Banner */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-sm border transition-all animate-in fade-in-50 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : statusMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === "success" ? (
              <CheckCircle className="size-5 text-emerald-600 shrink-0" />
            ) : statusMessage.type === "error" ? (
              <AlertCircle className="size-5 text-rose-600 shrink-0" />
            ) : (
              <Sparkles className="size-5 text-blue-600 shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-700 ml-4 p-1 rounded"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Disbursed</span>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ${kpis.totalDisbursed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-2">
            <TrendingUp className="size-3.5" />
            <span>Across all closed runs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Structures</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <User className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{kpis.activeStructuresCount} Employees</div>
          <p className="text-xs text-slate-500 mt-2">Configured with base & allowances</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Historical Runs</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Layers className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{payrollRuns.length} Batches</div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <span className="inline-block size-2 rounded-full bg-emerald-500" />
            <span>{kpis.completedRunsCount} finalized</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg. Est. Net Pay</span>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ${kpis.avgNet.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            <span className="text-xs font-normal text-slate-400"> / mo</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">After standard deductions</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("runs")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "runs"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <CreditCard className="size-4" />
          Payroll Runs ({payrollRuns.length})
        </button>

        <button
          onClick={() => setActiveTab("structures")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "structures"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <Briefcase className="size-4" />
          Salary Structures ({salaryStructures.length})
        </button>

        <button
          onClick={() => setActiveTab("calculator")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "calculator"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <SlidersHorizontal className="size-4" />
          Structure Setup & Calculator
        </button>
      </div>

      {/* =======================================================================
          TAB 1: PAYROLL RUNS (Main Dashboard View)
      ======================================================================== */}
      {activeTab === "runs" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <Input
                placeholder="Search by period (e.g., 2026-10)..."
                value={runSearchQuery}
                onChange={(e) => setRunSearchQuery(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                {["ALL", "DRAFT", "APPROVED", "PAID"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      statusFilter === st
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Past Payroll Runs Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/75">
                <TableRow>
                  <TableHead className="w-[120px] font-semibold text-slate-700">Period</TableHead>
                  <TableHead className="font-semibold text-slate-700">Dates</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Employees</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Gross Pay</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Deductions & Tax</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Net Disbursed</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRuns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                      <FileText className="size-8 mx-auto mb-2 opacity-50" />
                      No payroll runs found matching current filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRuns.map((run) => (
                    <TableRow key={run.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-indigo-500" />
                          {run.period}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        <div>
                          {run.startDate} &rarr; {run.endDate}
                        </div>
                        {run.paymentDate && (
                          <div className="text-slate-400 text-[11px] mt-0.5">Paid: {run.paymentDate}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-medium text-slate-700">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-700">
                          {run.totalEmployees}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-800">
                        ${run.totalGrossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right text-xs text-rose-600">
                        -${run.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-700">
                        ${run.totalNetPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(run.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {run.status === "DRAFT" && (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleRunStatusUpdate(run.id, "APPROVED")}
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              Approve
                            </Button>
                          )}
                          {run.status === "APPROVED" && (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleRunStatusUpdate(run.id, "PAID")}
                              className="text-emerald-600 hover:bg-emerald-50"
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => setViewingRunPayslips(run)}
                            className="text-indigo-600 hover:bg-indigo-50"
                          >
                            <Eye className="size-3 mr-1" />
                            Payslips
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 2: SALARY STRUCTURES LIST
      ======================================================================== */}
      {activeTab === "structures" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Configured Salary Structures</h2>
            <Button
              size="sm"
              onClick={() => setIsStructureModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="size-3.5 mr-1" />
              Add Structure
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {salaryStructures.map((s) => {
              const calc = calculatePayrollValues(
                s.basicSalary,
                s.housingAllowance,
                s.transportAllowance,
                s.otherAllowances,
                s.deductions
              );
              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{s.employeeName}</h3>
                        <p className="text-xs text-slate-500">{s.employeeEmail}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>

                    <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Basic Salary:</span>
                        <span className="font-semibold text-slate-900">${s.basicSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Allowances (Housing, etc.):</span>
                        <span className="font-medium text-emerald-600">+${s.totalAllowances.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Deductions & Tax:</span>
                        <span className="font-medium text-rose-600">-${calc.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Est. Net Pay</span>
                      <span className="text-lg font-extrabold text-indigo-700">
                        ${calc.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        setStructureForm({
                          employeeId: s.employeeId,
                          basicSalary: s.basicSalary,
                          housingAllowance: s.housingAllowance,
                          transportAllowance: s.transportAllowance,
                          otherAllowances: s.otherAllowances,
                          currency: s.currency,
                          effectiveDate: s.effectiveDate,
                          active: s.active,
                          deductions: s.deductions || [],
                        });
                        setIsStructureModalOpen(true);
                      }}
                      className="text-xs"
                    >
                      Edit Structure
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 3: SALARY STRUCTURE SETUP FORM & LIVE CALCULATOR
      ======================================================================== */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Left Side (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Salary Structure Setup</h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure employee base pay, recurring allowances, and statutory or company deductions.
              </p>
            </div>

            <form onSubmit={handleSaveSalaryStructure} className="space-y-6">
              {/* Employee Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Select Employee *</label>
                <select
                  value={structureForm.employeeId}
                  onChange={(e) => setStructureForm({ ...structureForm, employeeId: Number(e.target.value) })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-indigo-600"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.email}) - {emp.department || "Staff"}
                    </option>
                  ))}
                </select>
                {structureFormErrors.employeeId && (
                  <p className="text-xs text-rose-600">{structureFormErrors.employeeId}</p>
                )}
              </div>

              {/* Earnings: Basic & Allowances */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <DollarSign className="size-4 text-emerald-600" />
                  Earnings & Allowances
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Basic Monthly Salary ($) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={structureForm.basicSalary}
                      onChange={(e) => setStructureForm({ ...structureForm, basicSalary: parseFloat(e.target.value) || 0 })}
                      className="bg-white font-semibold"
                    />
                    {structureFormErrors.basicSalary && (
                      <p className="text-xs text-rose-600">{structureFormErrors.basicSalary}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Housing Allowance ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={structureForm.housingAllowance}
                      onChange={(e) =>
                        setStructureForm({ ...structureForm, housingAllowance: parseFloat(e.target.value) || 0 })
                      }
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Transport Allowance ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={structureForm.transportAllowance}
                      onChange={(e) =>
                        setStructureForm({ ...structureForm, transportAllowance: parseFloat(e.target.value) || 0 })
                      }
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Other Allowances ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={structureForm.otherAllowances}
                      onChange={(e) =>
                        setStructureForm({ ...structureForm, otherAllowances: parseFloat(e.target.value) || 0 })
                      }
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Percent className="size-4 text-rose-600" />
                    Statutory & Voluntary Deductions
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={handleAddDeductionRow}
                    className="text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  >
                    <Plus className="size-3 mr-1" />
                    Add Deduction
                  </Button>
                </div>

                <div className="space-y-3">
                  {structureForm.deductions.map((deduction, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                      <Input
                        placeholder="Deduction Name"
                        value={deduction.name}
                        onChange={(e) => handleDeductionChange(idx, "name", e.target.value)}
                        className="text-xs flex-1 h-8"
                      />

                      <select
                        value={deduction.type}
                        onChange={(e) => handleDeductionChange(idx, "type", e.target.value as DeductionType)}
                        className="h-8 px-2 rounded-md border border-slate-200 text-xs bg-white text-slate-700"
                      >
                        <option value="FIXED">Fixed ($)</option>
                        <option value="PERCENTAGE">Percent (%)</option>
                      </select>

                      {deduction.type === "FIXED" ? (
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Amount"
                          value={deduction.amount}
                          onChange={(e) => handleDeductionChange(idx, "amount", parseFloat(e.target.value) || 0)}
                          className="w-24 text-xs h-8"
                        />
                      ) : (
                        <div className="relative w-24">
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="%"
                            value={deduction.percentage}
                            onChange={(e) => handleDeductionChange(idx, "percentage", parseFloat(e.target.value) || 0)}
                            className="text-xs h-8 pr-6"
                          />
                          <span className="absolute right-2 top-2 text-[10px] text-slate-400">%</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveDeductionRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove deduction"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Effective Date & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Effective Date</label>
                  <Input
                    type="date"
                    value={structureForm.effectiveDate}
                    onChange={(e) => setStructureForm({ ...structureForm, effectiveDate: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Currency</label>
                  <Input
                    value={structureForm.currency}
                    onChange={(e) => setStructureForm({ ...structureForm, currency: e.target.value.toUpperCase() })}
                    maxLength={5}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm shadow-indigo-300"
              >
                {loading ? <RefreshCw className="size-4 animate-spin mr-2" /> : <Check className="size-4 mr-2" />}
                Save & Apply Salary Structure
              </Button>
            </form>
          </div>

          {/* Right Side: Live Calculation Preview (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 md:p-8 rounded-2xl shadow-xl space-y-6 sticky top-6">
            <div className="flex items-center justify-between border-b border-indigo-900/60 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">Live Preview</span>
                <h3 className="text-lg font-bold text-white">Payroll Calculation v0.1</h3>
              </div>
              <div className="p-2 bg-indigo-800/50 rounded-xl text-indigo-300">
                <Sparkles className="size-5" />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center text-slate-300">
                <span>Base Salary:</span>
                <span className="font-semibold text-white">${previewCalculation.basicSalary.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Total Allowances:</span>
                <span className="font-semibold text-emerald-400">+${previewCalculation.totalAllowances.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-y border-indigo-900/60 font-semibold text-white">
                <span>Gross Monthly Pay:</span>
                <span className="text-base text-emerald-300">${previewCalculation.grossPay.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300 text-xs">
                <span>Est. Income Tax Withholding:</span>
                <span className="text-rose-300">-${previewCalculation.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300 text-xs">
                <span>Other Deductions (PF, Med):</span>
                <span className="text-rose-300">
                  -${previewCalculation.deductionsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-400 text-xs pb-1">
                <span>Total Deductions:</span>
                <span className="text-rose-400 font-medium">
                  -${previewCalculation.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Net Pay Final Card */}
            <div className="p-5 bg-indigo-900/40 rounded-xl border border-indigo-500/30 text-center space-y-1">
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-medium">Net Take-Home Pay</span>
              <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                ${previewCalculation.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-indigo-200/80 block mt-1">Disbursed via Direct Bank Deposit</span>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: CREATE PAYROLL RUN
      ======================================================================== */}
      <Dialog open={isCreateRunOpen} onOpenChange={setIsCreateRunOpen}>
        <DialogContent className="sm:max-w-[480px] bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="size-5 text-indigo-600" />
              Create New Payroll Run
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreatePayrollRun} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Period (YYYY-MM) *</label>
              <Input
                placeholder="2026-11"
                value={runForm.period}
                onChange={(e) => setRunForm({ ...runForm, period: e.target.value })}
              />
              {runFormErrors.period && <p className="text-xs text-rose-600">{runFormErrors.period}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Start Date *</label>
                <Input
                  type="date"
                  value={runForm.startDate}
                  onChange={(e) => setRunForm({ ...runForm, startDate: e.target.value })}
                />
                {runFormErrors.startDate && <p className="text-xs text-rose-600">{runFormErrors.startDate}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">End Date *</label>
                <Input
                  type="date"
                  value={runForm.endDate}
                  onChange={(e) => setRunForm({ ...runForm, endDate: e.target.value })}
                />
                {runFormErrors.endDate && <p className="text-xs text-rose-600">{runFormErrors.endDate}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Disbursement / Payment Date</label>
              <Input
                type="date"
                value={runForm.paymentDate}
                onChange={(e) => setRunForm({ ...runForm, paymentDate: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Notes (Optional)</label>
              <Input
                placeholder="e.g. End of month regular payroll batch"
                value={runForm.notes}
                onChange={(e) => setRunForm({ ...runForm, notes: e.target.value })}
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Running payroll will automatically evaluate active salary structures and calculate tax/deductions for all
                active employees.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateRunOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              >
                {loading ? <RefreshCw className="size-4 animate-spin mr-1.5" /> : <CreditCard className="size-4 mr-1.5" />}
                Execute Payroll Run
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* =======================================================================
          MODAL: QUICK SET UP SALARY STRUCTURE (Pop-up dialog)
      ======================================================================== */}
      <Dialog open={isStructureModalOpen} onOpenChange={setIsStructureModalOpen}>
        <DialogContent className="sm:max-w-[560px] bg-white p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="size-5 text-indigo-600" />
              Set Up Salary Structure
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveSalaryStructure} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Select Employee *</label>
              <select
                value={structureForm.employeeId}
                onChange={(e) => setStructureForm({ ...structureForm, employeeId: Number(e.target.value) })}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-indigo-600"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Basic Salary ($) *</label>
                <Input
                  type="number"
                  value={structureForm.basicSalary}
                  onChange={(e) => setStructureForm({ ...structureForm, basicSalary: parseFloat(e.target.value) || 0 })}
                />
                {structureFormErrors.basicSalary && (
                  <p className="text-xs text-rose-600">{structureFormErrors.basicSalary}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Housing Allowance ($)</label>
                <Input
                  type="number"
                  value={structureForm.housingAllowance}
                  onChange={(e) =>
                    setStructureForm({ ...structureForm, housingAllowance: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Transport Allowance ($)</label>
                <Input
                  type="number"
                  value={structureForm.transportAllowance}
                  onChange={(e) =>
                    setStructureForm({ ...structureForm, transportAllowance: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Other Allowances ($)</label>
                <Input
                  type="number"
                  value={structureForm.otherAllowances}
                  onChange={(e) =>
                    setStructureForm({ ...structureForm, otherAllowances: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {/* Quick Deductions List */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Deductions</label>
                <button
                  type="button"
                  onClick={handleAddDeductionRow}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  + Add Row
                </button>
              </div>

              {structureForm.deductions.map((d, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="Name"
                    value={d.name}
                    onChange={(e) => handleDeductionChange(i, "name", e.target.value)}
                    className="h-8 text-xs flex-1"
                  />
                  <select
                    value={d.type}
                    onChange={(e) => handleDeductionChange(i, "type", e.target.value as DeductionType)}
                    className="h-8 px-2 border rounded text-xs bg-white"
                  >
                    <option value="FIXED">$</option>
                    <option value="PERCENTAGE">%</option>
                  </select>
                  <Input
                    type="number"
                    value={d.type === "FIXED" ? d.amount : d.percentage}
                    onChange={(e) =>
                      handleDeductionChange(
                        i,
                        d.type === "FIXED" ? "amount" : "percentage",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-20 h-8 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveDeductionRow(i)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">Estimated Net Pay:</span>
              <span className="font-bold text-indigo-700 text-sm">
                ${previewCalculation.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsStructureModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
                Save Structure
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* =======================================================================
          MODAL: VIEW ALL PAYSLIPS FOR A PAYROLL RUN
      ======================================================================== */}
      {viewingRunPayslips && (
        <Dialog open={!!viewingRunPayslips} onOpenChange={() => setViewingRunPayslips(null)}>
          <DialogContent className="sm:max-w-[750px] bg-white p-6 rounded-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Payslips for Period: {viewingRunPayslips.period}
                </DialogTitle>
                <div className="text-xs text-slate-500 font-medium">
                  {viewingRunPayslips.payslips?.length || 0} Employees
                </div>
              </div>
            </DialogHeader>

            <div className="mt-4 border rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700">Employee</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Gross</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Deductions</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Net Pay</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingRunPayslips.payslips && viewingRunPayslips.payslips.length > 0 ? (
                    viewingRunPayslips.payslips.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-semibold text-slate-900">{p.employeeName}</div>
                          <div className="text-xs text-slate-400">{p.employeeEmail}</div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${p.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right text-rose-600 text-xs font-medium">
                          -${p.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-700">
                          ${p.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleOpenPayslip(p)}
                            className="text-indigo-600 hover:bg-indigo-50"
                          >
                            <FileText className="size-3 mr-1" />
                            View Payslip
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                        No individual payslips found for this run.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* =======================================================================
          MODAL: DETAILED SINGLE PAYSLIP VIEW (Printable & Professional)
      ======================================================================== */}
      {selectedPayslip && (
        <Dialog open={isPayslipModalOpen} onOpenChange={setIsPayslipModalOpen}>
          <DialogContent className="sm:max-w-[650px] bg-white p-6 md:p-8 rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    O
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-tight">OLGAX TECHNOLOGIES</h3>
                    <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
                      Payroll & Compensation Division
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    PERIOD: {selectedPayslip.period}
                  </span>
                </div>
              </div>
            </DialogHeader>

            {/* Payslip Body */}
            <div className="py-4 space-y-6">
              {/* Employee Information Card */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Employee Name</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedPayslip.employeeName}</p>
                  <p className="text-slate-500">{selectedPayslip.employeeEmail}</p>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Department & Role</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedPayslip.departmentName || "Engineering"}
                  </p>
                  <p className="text-slate-500">{selectedPayslip.positionTitle || "Specialist"}</p>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Disbursement Status</span>
                  <p className="font-semibold text-emerald-700 mt-0.5">{selectedPayslip.status}</p>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Currency</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedPayslip.currency} ($)</p>
                </div>
              </div>

              {/* Two Column Earnings vs Deductions Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Earnings Column */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-200 flex items-center justify-between">
                    <span>Earnings</span>
                    <span className="text-slate-400 font-normal">Amount</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Basic Salary</span>
                      <span className="font-semibold text-slate-800">
                        ${selectedPayslip.basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Housing Allowance</span>
                      <span>${selectedPayslip.housingAllowance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Transport Allowance</span>
                      <span>${selectedPayslip.transportAllowance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Other Allowances</span>
                      <span>${selectedPayslip.otherAllowances.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-900">
                    <span>Total Gross Pay</span>
                    <span className="text-emerald-700 text-sm">
                      ${selectedPayslip.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Deductions Column */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-200 flex items-center justify-between">
                    <span>Deductions</span>
                    <span className="text-slate-400 font-normal">Amount</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Income Tax Withholding</span>
                      <span className="text-rose-600 font-medium">
                        -${selectedPayslip.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Statutory / Benefits</span>
                      <span className="text-rose-600 font-medium">
                        -${selectedPayslip.deductionsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-900">
                    <span>Total Deductions</span>
                    <span className="text-rose-700 text-sm">
                      -${selectedPayslip.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Pay Callout */}
              <div className="p-5 bg-gradient-to-r from-indigo-900 to-indigo-950 text-white rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-indigo-300 block">
                    Net Take-Home Pay
                  </span>
                  <span className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    ${selectedPayslip.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                    Direct Bank Transfer
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center pt-2">
                This document is an official computer-generated payslip from the OLGAX HR System. No signature is required.
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-slate-700 border-slate-300"
              >
                <Printer className="size-3.5 mr-1.5" />
                Print / Save PDF
              </Button>

              <Button
                size="sm"
                onClick={() => setIsPayslipModalOpen(false)}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
