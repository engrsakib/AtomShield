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
  Lock, // আগের ডিজাইনের জন্য Lock আইকন
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
  const [hasPermission, setHasPermission] = useState(true); // পারমিশন স্টেট

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

      // ৪0৩ চেক (Forbidden)
      if (res.status === 403 || data.statusCode === 403) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

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

      if (res.status === 403) {
        Swal.fire("Forbidden", "You don't have permission to update status", "error");
        return;
      }

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

      if (res.status === 403) {
        Swal.fire("Forbidden", "You don't have permission to delete", "error");
        return;
      }

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

  // Permission Denied View (হুবহু আগের ডিজাইনে)
  if (!hasPermission) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center p-4">
        <div className="max-w-lg p-10 text-center border-2 border-red-200 shadow-xl bg-red-50 rounded-3xl">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
            <Lock className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-red-700">
            Permission Denied
          </h1>
          <p className="mb-8 text-lg text-red-600">
            You do not have permission to view this content. Please contact your
            administrator for access.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-3 font-bold text-white transition-all bg-red-600 shadow-lg rounded-xl hover:bg-red-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (loading && videos.length === 0)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-teal-50 to-emerald-50">
      <div className="max-w-full mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 mb-6 text-white shadow-lg bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl">
          <div className="flex items-center gap-4">
            <FileText className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold">All YouTube Videos</h1>
              <p className="opacity-90">Manage all uploaded videos</p>
            </div>
          </div>
        </div>

        {/* COLLAPSIBLE FILTER PANEL */}
        <div className="mb-6 bg-white shadow-md rounded-xl">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center justify-between w-full p-4 font-semibold text-left text-gray-700"
          >
            <span>Advanced Filters</span>
            <ChevronDown
              className={`transition-transform ${
                showFilter ? "rotate-180" : ""
              }`}
            />
          </button>

          {showFilter && (
            <div className="grid grid-cols-1 gap-4 p-4 border-t md:grid-cols-3">

              {/* Page Selector */}
              <div>
                <label className="font-semibold text-gray-600">Page</label>
                <input
                  type="number"
                  min={1}
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value))}
                  className="w-full p-2 mt-1 border rounded-xl"
                />
              </div>

              {/* Limit Selector */}
              <div>
                <label className="font-semibold text-gray-600">Limit</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full p-2 mt-1 border rounded-xl"
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
                  className="w-full p-2 mt-1 border rounded-xl"
                  placeholder="Search videos..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button
                  onClick={handleSearch}
                  className="w-full p-2 mt-2 text-white bg-teal-600 rounded-xl"
                >
                  Apply
                </button>
              </div>

            </div>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-red-100 border border-red-300 rounded-xl">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-hidden bg-white shadow rounded-2xl">
          <table className="hidden w-full lg:table">
            <thead className="text-white bg-teal-600">
              <tr>
                <th className="p-4 text-left">Thumbnail</th>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Play</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {videos.map((v: any) => (
                <tr key={v.video_number} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <img
                      src={v.thumbnail_url}
                      alt={v.title}
                      className="object-cover w-24 h-16 rounded-lg"
                    />
                  </td>

                  <td className="p-4">
                    <p className="font-semibold">{v.title}</p>
                    <div
                      className="text-sm text-gray-600 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: v.description }}
                    ></div>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => window.open(v.video_url, "_blank")}
                      className="px-4 py-2 text-red-600 bg-red-100 rounded-lg whitespace-nowrap"
                    >
                      <Play className="inline w-4 h-4 mr-1" /> Play
                    </button>
                  </td>

                  <td className="p-4">
                    <select
                      value={v.is_published ? "true" : "false"}
                      onChange={(e) =>
                        updatePublishStatus(v.video_number, e.target.value)
                      }
                      className="p-2 bg-white border rounded-lg"
                    >
                      <option value="true">Published</option>
                      <option value="false">Unpublished</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/youtube/update?video=${v.video_number}`
                            )
                          }
                          className="p-2 text-green-600 bg-green-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteVideo(v.video_number, v.title)}
                          className="p-2 text-red-600 bg-red-100 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="flex items-center justify-between p-4 bg-gray-50">
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