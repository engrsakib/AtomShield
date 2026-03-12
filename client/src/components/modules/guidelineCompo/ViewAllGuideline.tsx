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
} from "lucide-react";

import Swal from "sweetalert2";
import { ENV } from "@/config/env";
import getCookie from "@/util/GetCookie";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";

export default function ViewAllGuideline() {
  const router = useRouter();

  const [guidelines, setGuidelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Filter
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // NEW
  const [totalPage, setTotalPage] = useState(1);

  // Collapse filter section
  const [showFilters, setShowFilters] = useState(false);

  const fetchGuidelines = async () => {
    setLoading(true);

    const url = `${ENV.BASE_URL}/guideline?page=${page}&limit=${limit}&searchTerm=${searchTerm}`;

    console.log("API CALL URL:", url);

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: getCookie("access_token") || "",
        },
      });

      const data = await res.json();
      console.log("SEARCH FILTER RESULT:", data);

      if (res.ok) {
        setGuidelines(data.data.data);
        setTotalPage(data.data.meta.totalPage);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // Auto fetch on page change
  useEffect(() => {
    fetchGuidelines();
  }, [page, limit]);

  // Search button click
  const handleSearchClick = () => {
    setPage(1);
    fetchGuidelines();
  };

  // Press enter to search
  const handleSearchEnter = (e: any) => {
    if (e.key === "Enter") {
      setPage(1);
      fetchGuidelines();
    }
  };

  // DELETE GUIDELINE
  const deleteGuideline = async (guidelineNumber: number) => {
    Swal.fire({
      title: "Delete?",
      text: "Do you want to delete this guideline?",
      icon: "warning",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await fetch(`${ENV.BASE_URL}/guideline/${guidelineNumber}`, {
          method: "DELETE",
          headers: { Authorization: getCookie("access_token") || "" },
        });

        Swal.fire("Deleted!", "", "success");
        fetchGuidelines();
      }
    });
  };

  // UPDATE STATUS
  const toggleStatus = async (guidelineNumber: number) => {
    await fetch(`${ENV.BASE_URL}/guideline/${guidelineNumber}`, {
      method: "PATCH",
      headers: { Authorization: getCookie("access_token") || "" },
    });

    Swal.fire("Updated!", "Status updated", "success");
    fetchGuidelines();
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-6 rounded-2xl shadow-lg mb-6">
        <h1 className="text-3xl font-bold">All Guidelines</h1>
        <p className="text-teal-100">Browse and manage guidelines</p>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white rounded-xl shadow-md p-5 space-y-4">
        {/* Search Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* SEARCH INPUT */}
          <div className="flex items-center gap-2 border rounded-xl px-3">
            <Search />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchEnter}
              className="py-3 outline-none w-full"
            />
          </div>

          {/* SEARCH BUTTON */}
          <button
            onClick={handleSearchClick}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-4 py-3 font-semibold"
          >
            Search
          </button>

          {/* FILTER COLLAPSE BUTTON */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 border rounded-xl px-4 py-3 text-teal-700 font-semibold"
          >
            <Filter size={18} />
            Pagination
            {showFilters ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        {/* COLLAPSIBLE FILTER SECTION */}
        {showFilters && (
          <div className="border rounded-xl p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PAGE Selector */}
            <div>
              <label className="font-semibold">Page</label>
              <input
                type="number"
                min={1}
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                className="w-full border rounded-xl p-3 mt-1"
              />
            </div>

            {/* LIMIT Selector */}
            <div>
              <label className="font-semibold">Limit</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full border rounded-xl p-3 mt-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* APPLY BUTTON */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setPage(1);
                  fetchGuidelines();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-3 font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6">
        <table className="w-full">
          <thead className="bg-teal-600 text-white">
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
                <td className="text-center py-6 text-gray-500" colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : guidelines.length === 0 ? (
              <tr>
                <td className="text-center py-6 text-gray-500" colSpan={6}>
                  No guidelines found
                </td>
              </tr>
            ) : (
              guidelines.map((item) => (
                <tr key={item.guideline_number} className="border-b">
                  <td className="text-center py-4 font-semibold">
                    #{item.guideline_number}
                  </td>

                  <td className="py-4">
                    <div className="font-bold">{item.title}</div>
                    <div
                      className="text-gray-500 text-sm prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(item.description),
                      }}
                    />
                  </td>

                  <td className="text-center">
                    <span className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-600">
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
                          router.push(
                            `/dashboard/guideline/view-guideline/${item.guideline_number}`,
                          )
                        }
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/guideline/edit/${item.guideline_number}`,
                          )
                        }
                        className="p-2 bg-green-100 text-green-600 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => toggleStatus(item.guideline_number)}
                        className="p-2 bg-teal-100 text-teal-600 rounded-lg"
                      >
                        ✓
                      </button>

                      <button
                        onClick={() => deleteGuideline(item.guideline_number)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg"
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
        <div className="flex justify-between items-center p-4">
          <span className="text-gray-600 text-sm">
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

            <span className="px-4 py-2 bg-teal-600 text-white rounded-lg">
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
