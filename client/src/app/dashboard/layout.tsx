


import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">

      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Navbar */}
        <div className="sticky top-0 z-50">
          <Navbar />
        </div>

        {/* Main Body */}
        <main className="flex-1 ">{children}</main>
      </div>
    </div>
  );
}






