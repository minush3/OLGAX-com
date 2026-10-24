"use client";

import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Search, Eye } from "lucide-react";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal & Form State
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "" });

  // Profile View State
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8080/api/v1/employees");
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `http://127.0.0.1:8080/api/v1/employees/${editingId}`
        : "http://127.0.0.1:8080/api/v1/employees";
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setIsOpen(false); 
        setEditingId(null);
        setFormData({ firstName: "", lastName: "", email: "" }); 
        fetchEmployees(); 
      }
    } catch (error) {
      console.error("Failed to save employee:", error);
    }
  };

  const handleEditClick = (employee: Employee) => {
    setEditingId(employee.id);
    setFormData({ firstName: employee.firstName, lastName: employee.lastName, email: employee.email });
    setIsOpen(true);
  };

  const handleViewClick = (employee: Employee) => {
    setViewEmployee(employee);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8080/api/v1/employees/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchEmployees();
      }
    } catch (error) {
      console.error("Failed to delete employee:", error);
    }
  };

  const filteredEmployees = employees.filter((emp) => 
    emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
          <p className="mt-2 text-slate-600">Manage your team members and their records.</p>
        </div>
        
        {/* Add Employee Modal */}
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setEditingId(null);
            setFormData({ firstName: "", lastName: "", email: "" });
          }
        }}>
          <DialogTrigger className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            + Add Employee
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Employee" : "Add New Employee"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input 
                  required 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input 
                  required 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 mt-4">
                {editingId ? "Update Employee" : "Save Employee"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar Filter */}
      <div className="flex items-center mb-6 relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 text-slate-400" />
        <Input 
          placeholder="Search employees by name or email..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {/* Data Table */}
      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading employees...</TableCell></TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No matching employees found.</TableCell></TableRow>
            ) : (
              filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.id}</TableCell>
                  <TableCell>{emp.firstName}</TableCell>
                  <TableCell>{emp.lastName}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <button 
                      onClick={() => handleViewClick(emp)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-blue-600 transition-colors"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                    <button 
                      onClick={() => handleEditClick(emp)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-indigo-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 inline" />
                    </button>
                    <button 
                      onClick={() => handleDelete(emp.id)}
                      className="p-1 hover:bg-red-50 rounded text-slate-600 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Employee Profile Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Employee Profile Details</DialogTitle>
          </DialogHeader>
          {viewEmployee && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-slate-50 rounded-lg border space-y-3">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Employee ID</span>
                  <p className="text-lg font-medium text-slate-900">#{viewEmployee.id}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Full Name</span>
                  <p className="text-base font-medium text-slate-900">{viewEmployee.firstName} {viewEmployee.lastName}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Email Address</span>
                  <p className="text-base text-slate-700">{viewEmployee.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsViewOpen(false)}
                className="w-full bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors"
              >
                Close Profile
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
