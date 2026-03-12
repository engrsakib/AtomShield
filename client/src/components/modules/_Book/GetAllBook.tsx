"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Lock,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { ENV } from "@/config/env";
import Link from "next/link";

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
  const [permissionError, setPermissionError] = useState(false); 

  const token = getCookie("access_token");

  // ============================
  // LOAD BOOKS
  // ============================
  const getAllBooks = useCallback(async () => {
    try {
      setLoading(true);
      setPermissionError(false);

      const res = await fetch(
        `${ENV.BASE_URL}/books?page=${page}&limit=${limit}&searchTerm=${search}`,
        {
          headers: {
            Authorization: token || "",
          },
        }
      );

      // Handle 403 Forbidden
      if (res.status === 403) {
        setPermissionError(true);
        setLoading(false);
        return;
      }

      const response = await res.json();
      
      if (response.success) {
        const safeBooks = [...(response?.data?.data || [])];
        setBooks(safeBooks);
        setTotal(response?.data?.meta?.total || safeBooks.length);
      } else if (response.statusCode === 403 || (!response.success && response.message?.toLowerCase().includes("forbidden"))) {
        setPermissionError(true);
      }
    } catch (err: any) {
      console.error("❌ ERROR:", err.message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, token]);

  useEffect(() => {
    getAllBooks();
  }, [getAllBooks]);

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
  // PLATFORM BADGE
  // ============================
  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case "rokomari":
        return <span className="px-3 py-1 text-sm text-white rounded-full bg-gradient-to-r from-teal-500 to-emerald-500">Rokomari</span>;
      case "wafi_life":
        return <span className="px-3 py-1 text-sm text-white rounded-full bg-gradient-to-r from-purple-500 to-indigo-500">Wafi Life</span>;
      default:
        return <span className="px-3 py-1 text-sm text-white rounded-full bg-gradient-to-r from-gray-500 to-gray-700">Others</span>;
    }
  };

  // ============================
  // PERMISSION DENIED UI (Admin List এর ডিজাইন অনুযায়ী)
  // ============================
  if (permissionError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] p-6 text-center">
        <div className="relative mb-8">
          {/* Background blur effect */}
          <div className="absolute inset-0 bg-pink-200 rounded-full opacity-30 blur-3xl animate-pulse"></div>
          
          <div className="relative flex items-center justify-center w-32 h-32 bg-white border border-gray-100 shadow-2xl rounded-[3rem]">
            <Lock className="w-16 h-16 text-pink-600" />
          </div>
          <ShieldAlert className="absolute w-12 h-12 -bottom-2 -right-2 text-amber-500 animate-bounce" />
        </div>

        <h2 className="mb-4 text-5xl font-black tracking-tighter text-gray-900">Access Denied!</h2>
        <p className="max-w-md mb-10 text-lg font-medium leading-relaxed text-gray-500">
          Sorry, you don't have enough permission to view this book list. Please contact your founder or system administrator.
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

  // ============================
  // MAIN UI
  // ============================
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-teal-50 to-emerald-50">
      {/* HEADER */}
      <div className="p-6 mb-6 text-white bg-teal-600 shadow-lg rounded-2xl">
        <h1 className="text-3xl font-bold">Browse and Manage Books</h1>
        <p className="mt-1 text-teal-50 opacity-90">Manage your book inventory, pricing and publication status.</p>
      </div>

      {/* SEARCH + FILTER + ADD */}
      <div className="flex flex-col gap-4 p-5 bg-white border border-teal-100 shadow-md rounded-xl">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2 px-3 transition-all border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-teal-500 bg-gray-50">
            <Search className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              className="w-full py-3 font-medium bg-transparent outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            className={`border rounded-xl py-3 font-bold transition-all ${showFilters ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters ▲" : "Show Filters ▼"}
          </button>

          <button
            className="py-3 font-bold text-white transition-all bg-teal-600 shadow-lg rounded-xl hover:bg-teal-700 shadow-teal-100 active:scale-95"
            onClick={() => router.push("/dashboard/my-book/create-book")}
          >
            + Add New Book
          </button>
        </div>

        {showFilters && (
          <div className="grid gap-4 p-4 border border-teal-100 rounded-xl bg-teal-50/30 md:grid-cols-3 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="text-sm font-bold text-gray-700 uppercase">Quick Page</label>
              <input type="number" className="w-full px-3 py-2 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500" value={page} min={1} onChange={(e) => setPage(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 uppercase">Items Per Page</label>
              <select className="w-full px-3 py-2 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500" value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}>
                {[5, 10, 20, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full py-2 font-bold text-red-600 transition-all bg-white border-2 border-red-100 rounded-lg hover:bg-red-50" onClick={() => { setPage(1); setLimit(10); setSearch(""); }}>Reset Filters</button>
            </div>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="mt-6 overflow-hidden bg-white border border-gray-100 shadow-lg rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="py-4 text-xs font-black tracking-widest text-center text-gray-400 uppercase">ID</th>
                <th className="py-4 text-xs font-black tracking-widest text-center text-gray-400 uppercase">Thumbnail</th>
                <th className="py-4 text-xs font-black tracking-widest text-left text-gray-400 uppercase">Book Details</th>
                <th className="py-4 text-xs font-black tracking-widest text-left text-gray-400 uppercase">Platform</th>
                <th className="py-4 text-xs font-black tracking-widest text-center text-gray-400 uppercase">Price</th>
                <th className="py-4 text-xs font-black tracking-widest text-center text-gray-400 uppercase">Status</th>
                <th className="py-4 text-xs font-black tracking-widest text-center text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-20 font-bold text-center text-gray-400"><div className="inline-block mb-2 animate-spin">⏳</div> Loading Books...</td></tr>
              ) : books.length === 0 ? (
                <tr><td colSpan={7} className="py-20 font-medium text-center text-gray-500">No books found in the inventory.</td></tr>
              ) : (
                books.map((book) => (
                  <tr key={book.book_number} className="transition-colors hover:bg-teal-50/30 group">
                    <td className="py-4 font-mono text-sm text-center text-gray-400">#{book.book_number}</td>
                    <td className="py-4 text-center">
                      <img src={book.thumbnail_url} className="object-cover mx-auto transition-transform shadow-sm w-14 h-14 rounded-xl group-hover:scale-105" />
                    </td>
                    <td className="px-2 py-4">
                      <p className="mb-1 font-bold leading-tight text-gray-900">{book.title}</p>
                      <div className="text-xs text-gray-500 line-clamp-1 max-w-[200px]" dangerouslySetInnerHTML={{ __html: book.description }} />
                    </td>
                    <td className="py-4">{getPlatformBadge(book.sold_platform)}</td>
                    <td className="font-black text-center text-teal-700">৳ {book.price}</td>
                    <td className="text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${book.is_published ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {book.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-2 px-2">
                        <button className="p-2 text-blue-600 transition-all bg-blue-50 rounded-xl hover:bg-blue-100" title="Edit Book" onClick={() => router.push(`/dashboard/my-book/update-book/${book.book_number}`)}><Edit size={16} /></button>
                        <button className="p-2 text-teal-600 transition-all bg-teal-50 rounded-xl hover:bg-teal-100" title="Toggle Status" onClick={() => handleToggle(book.book_number)}>{book.is_published ? <XCircle size={16} /> : <CheckCircle size={16} />}</button>
                        <button className="p-2 text-red-600 transition-all bg-red-50 rounded-xl hover:bg-red-100" title="Delete Book" onClick={() => handleDelete(book.book_number)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && books.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row bg-gray-50/50">
            <p className="text-sm font-bold text-gray-500">
              Showing <span className="text-gray-900">{(page - 1) * limit + 1} – {Math.min(page * limit, total)}</span> of <span className="text-gray-900">{total}</span> books
            </p>
            <div className="flex gap-3">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-3 transition-all border-2 border-gray-200 shadow-sm rounded-xl hover:bg-white disabled:opacity-30"><ChevronLeft size={20} /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="p-3 transition-all border-2 border-gray-200 shadow-sm rounded-xl hover:bg-white disabled:opacity-30"><ChevronRight size={20} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}