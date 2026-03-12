"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  ExternalLink,
  ImageOff,
  Lock,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import { ENV } from "@/config/env";
import getCookie from "@/util/GetCookie";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";

type StudyPlanItem = {
  _id: string;
  id: string;
  study_plan_number: number;
  title: string;
  description: string;
  status: "active" | "inactive" | "admin_approval";
  thumbnail_url: string;
  study_plan_url: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

type StudyPlanApiResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPage: number;
    };
    data: StudyPlanItem[];
  };
};

// ... (Helper functions keep the same)
const categoryBadgeClass = (category: string) => {
  switch (category) {
    case "general": return "bg-slate-100 text-slate-700";
    case "technical": return "bg-cyan-100 text-cyan-700";
    case "exam": return "bg-rose-100 text-rose-700";
    case "bcs_preparation": return "bg-blue-100 text-blue-700";
    case "primary_teacher_preparation": return "bg-violet-100 text-violet-700";
    case "teacher_nibondhon_preparation": return "bg-emerald-100 text-emerald-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

const decodeHtml = (text: string) => {
  return text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
};

function stripHtml(html: string): string {
  if (typeof document === 'undefined') return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

const formatCategory = (value: string) => value.replace(/_/g, " ");
const formatStatus = (status: string) => {
  if (status === "active") return "ACTIVE";
  if (status === "admin_approval") return "ADMIN APPROVAL";
  return "INACTIVE";
};
const statusClass = (status: string) => {
  if (status === "active") return "bg-green-100 text-green-700";
  if (status === "admin_approval") return "bg-blue-100 text-blue-700";
  return "bg-yellow-100 text-yellow-700";
};

export default function ViewAllStudyPlanTemplate() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(true); // পারমিশন স্টেট
  const [studyPlans, setStudyPlans] = useState<StudyPlanItem[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 1,
  });

  const fetchStudyPlans = async () => {
    try {
      setLoading(true);
      const token = getCookie("access_token");
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        searchTerm,
      });

      const res = await fetch(`${ENV.BASE_URL}/study-plan?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
      });

      const result = await res.json();

      // ৪0৩ চেক (Forbidden)
      if (res.status === 403 || result.statusCode === 403) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch study plans");
      }

      setStudyPlans(result.data.data);
      setMeta(result.data.meta);
    } catch (error) {
      console.error("Fetch study plan error:", error);
      setStudyPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyPlans();
  }, [page, limit, searchTerm]);

  // Actions (Delete, Toggle Status) keep same logic, adding 403 alert inside them
  const handleDelete = async (studyPlanNumber: number) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This item will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${ENV.BASE_URL}/study-plan/${studyPlanNumber}`, {
        method: "DELETE",
        headers: { Authorization: getCookie("access_token") || "" },
      });

      if (res.status === 403) {
        Swal.fire("Forbidden", "You don't have permission to delete", "error");
        return;
      }
      
      Swal.fire("Deleted!", "Item deleted successfully", "success");
      fetchStudyPlans();
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleToggleStatus = async (item: StudyPlanItem) => {
    const confirm = await Swal.fire({
      title: "Change Status?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f766e",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${ENV.BASE_URL}/study-plan/${item.study_plan_number}`, {
        method: "PATCH",
        headers: { Authorization: getCookie("access_token") || "" },
      });

      if (res.status === 403) {
        Swal.fire("Forbidden", "You don't have permission to update status", "error");
        return;
      }

      Swal.fire("Updated!", "Status updated successfully", "success");
      fetchStudyPlans();
    } catch (error: any) {
      Swal.fire("Failed", error.message, "error");
    }
  };

  // ============================
  // PERMISSION DENIED UI
  // ============================
  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] p-6 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-pink-200 rounded-full opacity-30 blur-3xl animate-pulse"></div>
          <div className="relative flex items-center justify-center w-32 h-32 bg-white border border-gray-100 shadow-2xl rounded-[3rem]">
            <Lock className="w-16 h-16 text-pink-600" />
          </div>
          <ShieldAlert className="absolute w-12 h-12 -bottom-2 -right-2 text-amber-500 animate-bounce" />
        </div>

        <h2 className="mb-4 text-5xl font-black tracking-tighter text-gray-900">Access Denied!</h2>
        <p className="max-w-md mb-10 text-lg font-medium leading-relaxed text-gray-500">
          Sorry, you don't have enough permission to view the Study Plans. Please contact your administrator.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-10 py-4 font-bold text-gray-700 transition-all bg-white border-2 border-gray-100 shadow-sm rounded-2xl hover:bg-gray-50 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" /> Go Back
          </button>
          
          <Link href="/dashboard">
            <button className="px-12 py-4 font-bold text-white transition-all bg-gray-900 shadow-xl rounded-2xl hover:bg-black active:scale-95">
              Return Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-teal-50 to-emerald-50">
      {/* HEADER */}
      <div className="p-6 mb-6 text-white shadow-lg rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600">
        <h1 className="text-3xl font-bold">All Study Plans</h1>
        <p className="text-teal-100">Browse and manage study plans</p>
      </div>

      {/* FILTERS AND TABLE RENDER (Existing Logic) */}
      <div className="p-5 space-y-4 bg-white shadow-md rounded-xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2 px-3 border rounded-xl md:col-span-2">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search by title"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full py-3 outline-none"
            />
          </div>

          <button
            onClick={() => { setPage(1); setSearchTerm(searchInput); }}
            className="px-4 py-3 font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700"
          >
            Search
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-3 font-semibold text-teal-700 border rounded-xl"
          >
            <Filter size={18} />
            Pagination
            {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-4 p-4 border rounded-xl bg-gray-50 md:grid-cols-3">
            <div>
              <label className="font-semibold">Page</label>
              <input
                type="number" min={1} value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                className="w-full p-3 mt-1 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold">Limit</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full p-3 mt-1 border rounded-xl"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setPage(1)}
                className="w-full px-4 py-3 font-semibold text-white rounded-xl bg-emerald-600 hover:bg-emerald-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden bg-white shadow-lg rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="text-white bg-teal-600">
              <tr>
                <th className="px-4 py-3 text-center">Plan No</th>
                <th className="px-4 py-3 text-left">Study Plan</th>
                <th className="px-4 py-3 text-center">Category</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">File</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10">
                    <div className="flex items-center justify-center gap-2 text-teal-600">
                      <Loader2 className="animate-spin" size={20} />
                      Loading study plans...
                    </div>
                  </td>
                </tr>
              ) : studyPlans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No study plans found
                  </td>
                </tr>
              ) : (
                studyPlans.map((item) => (
                  <tr key={item._id} className="align-top border-b">
                    <td className="px-4 py-4 font-semibold text-center text-gray-700">
                      #{item.study_plan_number}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-4">
                        <div className="w-24 h-16 overflow-hidden bg-gray-100 border rounded-lg shrink-0">
                          {item.thumbnail_url?.trim() && !brokenImages[item._id] ? (
                            <img
                              src={item.thumbnail_url}
                              alt={item.title}
                              className="object-cover w-full h-full"
                              onError={() => setBrokenImages(prev => ({ ...prev, [item._id]: true }))}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                              <ImageOff size={18} />
                              <span className="mt-1 text-[10px] font-medium">No Image</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 leading-snug">
                          <h3 className="text-sm font-semibold text-gray-800 truncate">{item.title}</h3>
                          <p className="text-xs text-gray-500 line-clamp-3">
                            {decodeHtml(stripHtml(item.description))}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium ${categoryBadgeClass(item.category)}`}>
                        {formatCategory(item.category)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusClass(item.status)}`}>
                        {formatStatus(item.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <a href={item.study_plan_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200">
                        <ExternalLink size={16} /> Open
                      </a>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/sturdy-plan/${item.study_plan_number}`)}
                          className="p-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
                        >
                          <Eye size={18} />
                        </button>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={item.status === "active"} onChange={() => handleToggleStatus(item)} className="sr-only peer" />
                          <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-teal-600 peer-checked:after:translate-x-full"></div>
                        </label>

                        <button
                          onClick={() => router.push(`/dashboard/sturdy-plan/edit/${item.study_plan_number}`)}
                          className="p-2 text-green-600 bg-green-100 rounded-lg hover:bg-green-200"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(item.study_plan_number)}
                          className="p-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <span className="text-sm text-gray-600">Showing {studyPlans.length} of {meta.total} results</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="p-2 border rounded-lg disabled:opacity-40">
              <ChevronLeft size={18} />
            </button>
            <span className="px-4 py-2 text-white bg-teal-600 rounded-lg">{meta.page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPage} className="p-2 border rounded-lg disabled:opacity-40">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}