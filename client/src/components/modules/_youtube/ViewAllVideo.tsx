


"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Play,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { ENV } from "@/config/env";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}



export default function ViewAllYouTubeVideos() {
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination + Limit Filter
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Search Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Collapse Filter Panel
  const [showFilter, setShowFilter] = useState(false);

  // ==============================
  // Fetch Videos
  // ==============================
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const token = getCookie("access_token");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(searchTerm && { searchTerm }),
      });

      const res = await fetch(`${ENV.BASE_URL}/youtube?${params}`, {
        headers: { Authorization: token || "" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setVideos(data.data.data);
      setTotalPages(data.data.totalPage);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [page, limit, searchTerm]);

  // ==============================
  // Search Handler
  // ==============================
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1);
  };

  // ==============================
  // Publish / Unpublish
  // ==============================
  const updatePublishStatus = async (video_number: number, newValue: string) => {
    try {
      const token = getCookie("access_token");

      const res = await fetch(`${ENV.BASE_URL}/youtube/${video_number}`, {
        method: "PATCH",
        headers: {
          Authorization: token || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_published: newValue === "true" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Swal.fire({
        icon: "success",
        title: "Success",
        text:
          newValue === "true"
            ? "Video published successfully"
            : "Video unpublished successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchVideos();
    } catch (err) {
      Swal.fire("Error", "Failed to update publish status", "error");
    }
  };

  // ==============================
  // Delete Video
  // ==============================
  const deleteVideo = async (video_number: number, title: string) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: `Delete "${title}"?`,
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = getCookie("access_token");

      const res = await fetch(`${ENV.BASE_URL}/youtube/${video_number}`, {
        method: "DELETE",
        headers: { Authorization: token || "" },
      });

      if (!res.ok) throw new Error("Delete failed");

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Video deleted successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchVideos();
    } catch (err) {
      Swal.fire("Error", "Failed to delete video", "error");
    }
  };

  // ==============================
  // Loading Screen
  // ==============================
  if (loading && videos.length === 0)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-6">
      <div className="max-w-full mx-auto">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 rounded-2xl text-white mb-6 shadow-lg flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <FileText className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold">All YouTube Videos</h1>
              <p className="opacity-90">Manage all uploaded videos</p>
            </div>
          </div>
        </div>

        {/* COLLAPSIBLE FILTER PANEL */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-700"
          >
            <span>Advanced Filters</span>
            <ChevronDown
              className={`transition-transform ${
                showFilter ? "rotate-180" : ""
              }`}
            />
          </button>

          {showFilter && (
            <div className="p-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Page Selector */}
              <div>
                <label className="font-semibold text-gray-600">Page</label>
                <input
                  type="number"
                  min={1}
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value))}
                  className="w-full mt-1 border p-2 rounded-xl"
                />
              </div>

              {/* Limit Selector */}
              <div>
                <label className="font-semibold text-gray-600">Limit</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full mt-1 border p-2 rounded-xl"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Search Input */}
              <div>
                <label className="font-semibold text-gray-600">Search</label>
                <input
                  type="text"
                  className="w-full mt-1 border p-2 rounded-xl"
                  placeholder="Search videos..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button
                  onClick={handleSearch}
                  className="mt-2 w-full bg-teal-600 text-white p-2 rounded-xl"
                >
                  Apply
                </button>
              </div>

            </div>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 border border-red-300 p-4 rounded-xl mb-6 flex gap-2 items-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full hidden lg:table">
            <thead className="bg-teal-600 text-white">
              <tr>
                <th className="p-4">Thumbnail</th>
                <th className="p-4">Title</th>
                <th className="p-4">Play</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {videos.map((v: any) => (
                <tr key={v.video_number} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <img
                      src={v.thumbnail_url}
                      className="w-24 h-16 rounded-lg object-cover"
                    />
                  </td>

                  <td className="p-4">
                    <p className="font-semibold">{v.title}</p>
                    <p
                      className="text-gray-600 text-sm line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: v.description }}
                    ></p>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => window.open(v.video_url, "_blank")}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg"
                    >
                      <Play className="w-4 h-4 inline" /> Play
                    </button>
                  </td>

                  <td className="p-4">
                    <select
                      value={v.is_published ? "true" : "false"}
                      onChange={(e) =>
                        updatePublishStatus(v.video_number, e.target.value)
                      }
                      className="border p-2 rounded-lg bg-white"
                    >
                      <option value="true">Published</option>
                      <option value="false">Unpublished</option>
                    </select>
                  </td>

                  <td className="p-4 text-center flex justify-center gap-3">
                    {/* EDIT BUTTON */}
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/youtube/update?video=${v.video_number}`
                        )
                      }
                      className="p-2 bg-green-100 text-green-600 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      onClick={() => deleteVideo(v.video_number, v.title)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="flex justify-between items-center p-4 bg-gray-50">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 bg-white border rounded-lg disabled:opacity-50"
            >
              <ChevronLeft />
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 bg-white border rounded-lg disabled:opacity-50"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
