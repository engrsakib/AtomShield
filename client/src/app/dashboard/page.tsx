"use client";

import React from "react";
import { CardItem } from "@/components/modules/user/CardItem";
import { 
  GraduationCap, 
  Trophy, 
  Book, 
  Video, 
  Link2, 
  FileText, 
  LayoutDashboard, 
  Calendar 
} from "lucide-react";

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="relative w-full min-h-screen bg-gray-50/50">
      <div className="relative z-10 p-6 mx-auto md:p-10 max-w-7xl">
        
        <header className="flex flex-col justify-between gap-4 mb-10 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="w-5 h-5 text-pink-600" />
              <span className="text-sm font-bold tracking-wider text-pink-600 uppercase">Dashboard Overview</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">
              Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Admin</span>
            </h1>
            <p className="flex items-center gap-2 mt-2 font-medium text-gray-500">
              <Calendar className="w-4 h-4" /> {currentDate}
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="px-4 py-2 text-center bg-white border border-gray-200 shadow-sm rounded-2xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Status</p>
              <div className="flex items-center gap-1.5 justify-center mt-0.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-gray-700">Live</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CardItem
            title="Total Exams"
            value={12}
            icon="GraduationCap"
            heading="Academic"
            description="Active assessment modules"
            gradientFrom="from-blue-600"
            gradientTo="to-indigo-700"
          />
          <CardItem
            title="Completed"
            value={8}
            icon="Trophy"
            heading="Performance"
            description="Successfully evaluated"
            gradientFrom="from-emerald-500"
            gradientTo="to-teal-700"
          />
          <CardItem
            title="Guidelines"
            value={6}
            icon="Book"
            heading="Resources"
            description="Preparation materials"
            gradientFrom="from-amber-500"
            gradientTo="to-orange-600"
          />
          <CardItem
            title="Video Content"
            value={10}
            icon="Video"
            heading="Learning"
            description="Tutorials and lectures"
            gradientFrom="from-rose-500"
            gradientTo="to-pink-600"
          />
          <CardItem
            title="External Links"
            value={40}
            icon="Link2"
            heading="Storefront"
            description="Affiliated book links"
            gradientFrom="from-sky-500"
            gradientTo="to-cyan-600"
          />
          <CardItem
            title="Top Rankings"
            value={3}
            icon="FileText"
            heading="Reports"
            description="Latest merit lists"
            gradientFrom="from-slate-700"
            gradientTo="to-slate-900"
          />
        </div>

        <div className="mt-12 p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Need to manage something?</h3>
              <p className="mt-1 text-gray-500">Access the system settings and admin controls from the sidebar.</p>
            </div>
            <button className="px-8 py-3 font-bold text-white transition-all bg-gray-900 shadow-xl rounded-2xl hover:bg-black hover:scale-105 shadow-gray-200">
              Quick Action
            </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 -mt-16 -mr-16 rounded-full opacity-50 bg-pink-50 blur-3xl" />
        </div>

      </div>
    </div>
  );
}