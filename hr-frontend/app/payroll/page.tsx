import PayrollDashboard from "@/components/payroll/PayrollDashboard";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Payroll Dashboard | OLGAX HR",
  description: "Manage employee compensation, salary structures, payroll runs, and itemized payslips.",
};

export default function PayrollPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Loading Payroll Dashboard...</div>}>
      <PayrollDashboard />
    </Suspense>
  );
}
