import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OLGAX HR System",
  description: "Module 1: Employee Records & Onboarding",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen flex`}>
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex border-r border-slate-800">
          <div>
            {/* App Branding */}
            <div className="p-6 border-b border-slate-800">
              <span className="text-xl font-bold tracking-wider text-white">
                OLGAX <span className="text-indigo-400">HR</span>
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-2">
              <Link
                href="/"
                className="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
              >
                Employees
              </Link>
              <Link
                href="/departments"
                className="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
              >
                Departments
              </Link>
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                N
              </div>
              <div className="text-xs">
                <p className="font-medium text-white">Minushanth</p>
                <p className="text-slate-400">HR Module Lead</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
