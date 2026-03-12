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
} from "lucide-react";
import { ENV } from "@/config/env";
import getCookie from "@/util/GetCookie";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

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

type ToggleTarget = {
  study_plan_number: number;
  title: string;
  status: "active" | "inactive";
} | null;

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

const categoryBadgeClass = (category: string) => {
  switch (category) {
    case "general":
      return "bg-slate-100 text-slate-700";
    case "technical":
      return "bg-cyan-100 text-cyan-700";
    case "exam":
      return "bg-rose-100 text-rose-700";
    case "bcs_preparation":
      return "bg-blue-100 text-blue-700";
    case "primary_teacher_preparation":
      return "bg-violet-100 text-violet-700";
    case "teacher_nibondhon_preparation":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const decodeHtml = (text: string) => {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

function stripHtml(html: string): string {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

const formatCategory = (value: string) => {
  return value.replace(/_/g, " ");
};

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
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(false);
  const [studyPlans, setStudyPlans] = useState<StudyPlanItem[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 1,
  });

  const handleDelete = async (studyPlanNumber: number) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This item will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = getCookie("access_token");

      const res = await fetch(`${ENV.BASE_URL}/guideline/${studyPlanNumber}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
      });

      const result = await res.json();
      console.log(result);

      if (!res.ok) {
        throw new Error(result?.message || "Failed to delete item");
      }

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: result?.message || "Item deleted successfully",
        confirmButtonColor: "#0f766e",
      });

      fetchStudyPlans();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error?.message || "Something went wrong",
      });
    }
  };

  const handleToggleStatus = async (item: StudyPlanItem) => {
    const confirm = await Swal.fire({
      title: "Change Status?",
      text: `This will toggle the status of "${item.title}".`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f766e",
      cancelButtonColor: "#6b7280",
      confirmButtonText:
        item.status === "active" ? "Make Inactive" : "Make Active",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = getCookie("access_token");

      const res = await fetch(
        `${ENV.BASE_URL}/study-plan/${item.study_plan_number}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token || "",
          },
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "Failed to toggle status");
      }

      Swal.fire({
        icon: "success",
        title: "Updated",
        text: result?.message || "Status updated successfully",
        confirmButtonColor: "#0f766e",
      });

      setStudyPlans((prev) =>
        prev.map((p) =>
          p.study_plan_number === item.study_plan_number
            ? { ...p, status: result.data.status }
            : p,
        ),
      );
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error?.message || "Something went wrong",
      });
    }
  };

  const fetchStudyPlans = async () => {
    try {
      setLoading(true);

      const token = getCookie("access_token");
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        searchTerm,
      });

      const res = await fetch(
        `${ENV.BASE_URL}/study-plan?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token || "",
          },
        },
      );

      const result: StudyPlanApiResponse = await res.json();

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

  const handleSearch = () => {
    setPage(1);
    setSearchTerm(searchInput);
  };

  const handleApplyFilters = () => {
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < meta.totalPage) setPage((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-6">
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">All Study Plans</h1>
        <p className="text-teal-100">Browse and manage study plans</p>
      </div>

      <div className="space-y-4 rounded-xl bg-white p-5 shadow-md">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2 rounded-xl border px-3 md:col-span-2">
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
            onClick={handleSearch}
            className="rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700"
          >
            Search
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold text-teal-700"
          >
            <Filter size={18} />
            Pagination
            {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-4 rounded-xl border bg-gray-50 p-4 md:grid-cols-3">
            <div>
              <label className="font-semibold">Page</label>
              <input
                type="number"
                min={1}
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border p-3"
              />
            </div>

            <div>
              <label className="font-semibold">Limit</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border p-3"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleApplyFilters}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-teal-600 text-white">
              <tr>
                <th className="py-3 px-4 text-center">Plan No</th>
                <th className="py-3 px-4 text-left">Study Plan</th>
                <th className="py-3 px-4 text-center">Category</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">File</th>
                <th className="py-3 px-4 text-center">Actions</th>
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
                  <tr key={item._id} className="border-b align-top">
                    <td className="py-4 px-4 text-center font-semibold text-gray-700">
                      #{item.study_plan_number}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex gap-4">
                        <div className="h-16 w-24 overflow-hidden rounded-lg border bg-gray-100 shrink-0">
                          {item.thumbnail_url?.trim() &&
                          !brokenImages[item._id] ? (
                            <img
                              src={item.thumbnail_url}
                              alt={item.title}
                              className="h-full w-full object-cover"
                              onError={() =>
                                setBrokenImages((prev) => ({
                                  ...prev,
                                  [item._id]: true,
                                }))
                              }
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                              <ImageOff size={18} />
                              <span className="mt-1 text-[10px] font-medium">
                                No Image
                              </span>
                            </div>
                          )}
                        </div>

                   <div className="min-w-0 flex-1 leading-snug">
  <h3 className="truncate text-sm font-semibold text-gray-800">
    {item.title}
  </h3>

  <p className="line-clamp-3 text-xs text-gray-500">
    {decodeHtml(stripHtml(item.description))}
  </p>
</div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex max-w-[180px] items-center justify-center rounded-full px-3 py-1 text-sm font-medium break-words ${categoryBadgeClass(
                          item.category,
                        )}`}
                      >
                        {formatCategory(item.category)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${statusClass(
                          item.status,
                        )}`}
                      >
                        {formatStatus(item.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <a
                        href={item.study_plan_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-sky-100 px-3 py-2 text-sky-700 hover:bg-sky-200"
                      >
                        <ExternalLink size={16} />
                        Open
                      </a>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/sturdy-plan/${item.study_plan_number}`,
                            )
                          }
                          className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                        >
                          <Eye size={18} />
                        </button>

                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={item.status === "active"}
                            onChange={() => handleToggleStatus(item)}
                            className="peer sr-only"
                          />

                          <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-teal-600 peer-checked:after:translate-x-full"></div>
                        </label>

                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/sturdy-plan/edit/${item.study_plan_number}`,
                            )
                          }
                          className="rounded-lg bg-green-100 p-2 text-green-600 hover:bg-green-200"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(item.study_plan_number)}
                          className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
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

        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <span className="text-sm text-gray-600">
            Showing {studyPlans.length} of {meta.total} results
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page <= 1}
              className="rounded-lg border p-2 disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="rounded-lg bg-teal-600 px-4 py-2 text-white">
              {meta.page}
            </span>

            <button
              onClick={handleNextPage}
              disabled={page >= meta.totalPage}
              className="rounded-lg border p-2 disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
