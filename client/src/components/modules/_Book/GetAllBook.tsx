



"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { ENV } from "@/config/env";

// COOKIE FUNCTION
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}



export default function ViewAllBooks() {
  const router = useRouter();

  const [books, setBooks] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = getCookie("access_token");

  // ============================
  // PLATFORM BADGE (ENUM)
  // ============================
  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case "rokomari":
        return (
          <span className="px-3 py-1 rounded-full text-white text-sm bg-gradient-to-r from-teal-500 to-emerald-500">
            Rokomari
          </span>
        );

      case "wafi_life":
        return (
          <span className="px-3 py-1 rounded-full text-white text-sm bg-gradient-to-r from-purple-500 to-indigo-500">
            Wafi Life
          </span>
        );

      default:
        return (
          <span className="px-3 py-1 rounded-full text-white text-sm bg-gradient-to-r from-gray-500 to-gray-700">
            Others
          </span>
        );
    }
  };

  // ============================
  // LOAD BOOKS
  // ============================
  const getAllBooks = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${ENV.BASE_URL}/books?page=${page}&limit=${limit}&searchTerm=${search}`,
        {
          headers: {
            Authorization: token || "",
          },
        }
      );

      const response = await res.json();
      console.log("📌 API Response:", response);

      const safeBooks = [...(response?.data?.data || [])];

      setBooks(safeBooks);
      setTotal(response?.data?.meta?.total || safeBooks.length);
    } catch (err: any) {
      console.error("❌ ERROR:", err.message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllBooks();
  }, [page, limit, search]);

  // ============================
  // DELETE BOOK
  // ============================
  const handleDelete = async (book_number: number) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This book will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${ENV.BASE_URL}/books/${book_number}`, {
        method: "DELETE",
        headers: { Authorization: token || "" },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      Swal.fire("Deleted!", "Book deleted successfully!", "success");
      getAllBooks();
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // ============================
  // TOGGLE PUBLISH
  // ============================
  const handleToggle = async (book_number: number) => {
    Swal.fire({
      title: "Updating...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await fetch(`${ENV.BASE_URL}/books/${book_number}`, {
        method: "PATCH",
        headers: { Authorization: token || "" },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      Swal.close();
      Swal.fire("Updated!", "Publish status changed.", "success");
      getAllBooks();
    } catch (err: any) {
      Swal.close();
      Swal.fire("Error", err.message, "error");
    }
  };

  const totalPages = Math.ceil(total / limit);

  // ============================
  // UI START
  // ============================
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">

      {/* HEADER */}
      <div className="bg-teal-600 text-white p-6 rounded-2xl shadow-lg mb-6">
        <h1 className="text-3xl font-bold">Browse and Manage Books</h1>
      </div>

      {/* SEARCH + FILTER + ADD */}
      <div className="bg-white rounded-xl shadow-md p-5 flex flex-col gap-4">

        {/* TOP ROW */}
        <div className="grid md:grid-cols-4 gap-4">

          {/* SEARCH */}
          <div className="flex items-center gap-2 border rounded-xl px-3">
            <Search />
            <input
              type="text"
              placeholder="Search books..."
              className="py-3 outline-none w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* FILTER BUTTON */}
          <button
            className="border rounded-xl py-3 font-medium hover:bg-gray-100 transition"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters ▲" : "Show Filters ▼"}
          </button>

          {/* ADD NEW */}
          <button
            className="bg-teal-600 text-white rounded-xl py-3 font-semibold hover:bg-teal-700"
            onClick={() => router.push("/dashboard/my-book/create-book")}
          >
            + Add New Book
          </button>
        </div>

        {/* COLLAPSIBLE FILTERS */}
        {showFilters && (
          <div className="border rounded-xl p-4 bg-gray-50 grid md:grid-cols-3 gap-4">

            {/* PAGE */}
            <div>
              <label className="text-gray-700 font-semibold">Page</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg mt-1"
                value={page}
                min={1}
                onChange={(e) => setPage(Number(e.target.value))}
              />
            </div>

            {/* LIMIT */}
            <div>
              <label className="text-gray-700 font-semibold">Items Per Page</label>
              <select
                className="w-full px-3 py-2 border rounded-lg mt-1"
                value={limit}
                onChange={(e) => {
                  setPage(1);
                  setLimit(Number(e.target.value));
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* RESET */}
            <div className="flex items-end">
              <button
                className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                onClick={() => {
                  setPage(1);
                  setLimit(10);
                  setSearch("");
                }}
              >
                Reset Filters
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
              <th className="py-3">Thumbnail</th>
              <th className="py-3 text-left">Title</th>
              <th className="py-3 text-left">Description</th>
              <th className="py-3 text-left">Sold Platform</th>
              <th className="py-3">Price</th>
              <th className="py-3">Status</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-6">Loading...</td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No books found
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.book_number} className="border-b hover:bg-gray-50">

                  {/* ID */}
                  <td className="text-center py-4 font-semibold">
                    {book.book_number}
                  </td>

                  {/* THUMB */}
                  <td className="text-center py-4">
                    <img
                      src={book.thumbnail_url}
                      className="w-16 h-16 rounded-lg object-cover shadow"
                    />
                  </td>

                  {/* TITLE */}
                  <td className="py-4 font-medium">{book.title}</td>

                  {/* DESCRIPTION */}
                  <td className="py-4 text-gray-600 max-w-[260px]">
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          book.description?.length > 90
                            ? book.description.slice(0, 90) + "..."
                            : book.description,
                      }}
                    />
                  </td>

                  {/* PLATFORM */}
                  <td className="py-4">{getPlatformBadge(book.sold_platform)}</td>

                  {/* PRICE */}
                  <td className="text-center">৳ {book.price}</td>

                  {/* STATUS */}
                  <td className="text-center">
                    {book.is_published ? (
                      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                        Published
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm">
                        Unpublished
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="text-center">
                    <div className="flex gap-2 justify-center">

                      {/* EDIT */}
                      <button
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg"
                        onClick={() =>
                          router.push(`/dashboard/my-book/update-book/${book.book_number}`)
                        }
                      >
                        <Edit size={18} />
                      </button>

                      {/* TOGGLE */}
                      <button
                        className="p-2 bg-teal-100 text-teal-600 rounded-lg"
                        onClick={() => handleToggle(book.book_number)}
                      >
                        {book.is_published ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>

                      {/* DELETE */}
                      <button
                        className="p-2 bg-red-100 text-red-600 rounded-lg"
                        onClick={() => handleDelete(book.book_number)}
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
        {books.length > 0 && (
          <div className="flex justify-between items-center p-4 border-t">

            <div>
              Showing {(page - 1) * limit + 1} – {Math.min(page * limit, total)} of {total}
            </div>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border rounded-lg"
              >
                <ChevronLeft />
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 border rounded-lg"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
