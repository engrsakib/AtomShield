"use client";

import React, { useState, useEffect } from "react";
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
  Lock,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";

import Swal from "sweetalert2";
import { ENV } from "@/config/env";
import getCookie from "@/util/GetCookie";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import Link from "next/link";

export default function ViewAllGuideline() {
  const router = useRouter();

  const [guidelines, setGuidelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true); // পারমিশন স্টেট

  // Search Filter
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPage, setTotalPage] = useState(1);

  // Collapse filter section
  const [showFilters, setShowFilters] = useState(false);

  const fetchGuidelines = async () => {
    setLoading(true);
    const url = `${ENV.BASE_URL}/guideline?page=${page}&limit=${limit}&searchTerm=${searchTerm}`;

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: getCookie("access_token") || "",
        },
      });

      const data = await res.json();

      // ৪0৩ চেক (Forbidden)
      if (res.status === 403 || data.statusCode === 403) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      if (res.ok) {
        setGuidelines(data.data.data);
        setTotalPage(data.data.meta.totalPage);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchGuidelines();
  }, [page, limit]);

  const handleSearchClick = () => {
    setPage(1);
    fetchGuidelines();
  };

  const handleSearchEnter = (e: any) => {
    if (e.key === "Enter") {
      setPage(1);
      fetchGuidelines();
    }
  };

  const deleteGuideline = async (guidelineNumber: number) => {
    Swal.fire({
      title: "Delete?",
      text: "Do you want to delete this guideline?",
      icon: "warning",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`${ENV.BASE_URL}/guideline/${guidelineNumber}`, {
          method: "DELETE",
          headers: { Authorization: getCookie("access_token") || "" },
        });

        if (res.status === 403) {
          Swal.fire("Forbidden", "You don't have permission to delete", "error");
          return;
        }

        Swal.fire("Deleted!", "", "success");
        fetchGuidelines();
      }
    });
  };

  const toggleStatus = async (guidelineNumber: number) => {
    const res = await fetch(`${ENV.BASE_URL}/guideline/${guidelineNumber}`, {
      method: "PATCH",
      headers: { Authorization: getCookie("access_token") || "" },
    });

    if (res.status === 403) {
      Swal.fire("Forbidden", "You don't have permission to update status", "error");
      return;
    }

    Swal.fire("Updated!", "Status updated", "success");
    fetchGuidelines();
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
          Sorry, you don't have enough permission to view this guideline list. Please contact your founder or system administrator.
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
      <div className="p-6 mb-6 text-white shadow-lg bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl">
        <h1 className="text-3xl font-bold">All Guidelines</h1>
        <p className="text-teal-100">Browse and manage guidelines</p>
      </div>

      {/* SEARCH BAR */}
      <div className="p-5 space-y-4 bg-white shadow-md rounded-xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2 px-3 border rounded-xl">
            <Search />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchEnter}
              className="w-full py-3 outline-none"
            />
          </div>

          <button
            onClick={handleSearchClick}
            className="px-4 py-3 font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
          >
            Search
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-3 font-semibold text-teal-700 border rounded-xl"
          >
            <Filter size={18} />
            Pagination
            {showFilters ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-4 p-4 border rounded-xl bg-gray-50 md:grid-cols-3">
            <div>
              <label className="font-semibold">Page</label>
              <input
                type="number"
                min={1}
                value={page}
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
                onClick={() => {
                  setPage(1);
                  fetchGuidelines();
                }}
                className="w-full px-4 py-3 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="mt-6 overflow-hidden bg-white shadow-lg rounded-xl">
        <table className="w-full">
          <thead className="text-white bg-teal-600">
            <tr>
              <th className="py-3">ID</th>
              <th className="py-3 text-left">Title</th>
              <th className="py-3">Category</th>
              <th className="py-3">Status</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="py-6 text-center text-gray-500" colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : guidelines.length === 0 ? (
              <tr>
                <td className="py-6 text-center text-gray-500" colSpan={6}>
                  No guidelines found
                </td>
              </tr>
            ) : (
              guidelines.map((item) => (
                <tr key={item.guideline_number} className="border-b">
                  <td className="py-4 font-semibold text-center">
                    #{item.guideline_number}
                  </td>

                  <td className="py-4">
                    <div className="font-bold">{item.title}</div>
                    <div
                      className="text-sm prose text-gray-500 max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(item.description),
                      }}
                    />
                  </td>

                  <td className="text-center">
                    <span className="px-3 py-1 text-sm text-purple-600 bg-purple-100 rounded-full">
                      {item.category.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </td>

                  <td className="text-center">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        item.status === "active"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {item.status === "active" ? "PUBLISHED" : "UNPUBLISHED"}
                    </span>
                  </td>

                  <td className="text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/guideline/view-guideline/${item.guideline_number}`)
                        }
                        className="p-2 text-blue-600 bg-blue-100 rounded-lg"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() =>
                          router.push(`/dashboard/guideline/edit/${item.guideline_number}`)
                        }
                        className="p-2 text-green-600 bg-green-100 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => toggleStatus(item.guideline_number)}
                        className="p-2 text-teal-600 bg-teal-100 rounded-lg"
                      >
                        ✓
                      </button>

                      <button
                        onClick={() => deleteGuideline(item.guideline_number)}
                        className="p-2 text-red-600 bg-red-100 rounded-lg"
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

        {/* PAGINATION */}
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-gray-600">
            Showing {guidelines.length} results
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 border rounded-lg disabled:opacity-40"
            >
              <ChevronLeft />
            </button>

            <span className="px-4 py-2 text-white bg-teal-600 rounded-lg">
              {page}
            </span>

            <button
              disabled={page === totalPage}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 border rounded-lg disabled:opacity-40"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}