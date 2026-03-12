



"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Loader2,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  X,
  ArrowLeft,
  Upload,
  Mail,
  Phone,
  Calendar,
  User,
  Shield,
  UserCheck,
} from "lucide-react";

import Swal from "sweetalert2";
import Link from "next/link";
import { ENV } from "@/config/env";

interface User {
  _id: string;
  name: string;
  phone_number: string;
  email: string;
  role: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;

  return null;
}

export default function UserManagementTable() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: "",
    search_query: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Pages instead of modals
  const [currentView, setCurrentView] = useState<"table" | "view" | "update">("table");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [updateFormData, setUpdateFormData] = useState({
    name: "",
    phone_number: "",
    email: "",
    image: "",
  });

  const accessToken = getCookie("access_token");

  // Cloudinary ENV
  const cloudinary_preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudinary_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // Upload function
  async function uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinary_preset as string);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinary_name}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    return data.secure_url;
  }

  // FETCH ADMINS
  const fetchAdmins = async () => {
    try {
      setLoading(true);

      const url = `${ENV.BASE_URL}/user?page=${filters.page}&limit=${filters.limit}&search_query=${filters.search_query}`;

      const res = await fetch(url, {
        headers: {
          Authorization: accessToken || "",
        },
      });

      const result = await res.json();
      console.log("Pagination FETCH RESULT:", result);

      if (result.success) {
        setAdmins(result.data.data);
        setMeta(result.data.meta);
      }
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [filters.page, filters.limit, filters.role]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // VIEW USER - Navigate to page
  const handleView = (u: User) => {
    setSelectedUser(u);
    setCurrentView("view");
    setOpenDropdown(null);
  };

  // UPDATE USER - Navigate to page
  const handleUpdate = (u: User) => {
    setSelectedUser(u);
    setUpdateFormData({
      name: u.name,
      phone_number: u.phone_number,
      email: u.email,
      image: u.image || "",
    });
    setCurrentView("update");
    setOpenDropdown(null);
  };

  const handleUpdateSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedUser) return;

    const res = await fetch(`${ENV.BASE_URL}/user/${selectedUser._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken || "",
      },
      body: JSON.stringify(updateFormData),
    });

    const result = await res.json();

    if (result.success) {
      Swal.fire("Updated!", "Student Updated Successfully", "success");

      setAdmins((prev) =>
        prev.map((x) =>
          x._id === selectedUser._id ? { ...x, ...updateFormData } : x
        )
      );

      setCurrentView("table");
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (!selectedUser) return;

    const res = await fetch(`${ENV.BASE_URL}/user/${selectedUser._id}`, {
      method: "DELETE",
      headers: { Authorization: accessToken || "" },
    });

    if (res.ok) {
      Swal.fire("Deleted!", "User Deleted Successfully", "success");

      setAdmins((prev) => prev.filter((u) => u._id !== selectedUser._id));
      setShowDeleteModal(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // VIEW PAGE
  if (currentView === "view" && selectedUser) {
    return (
      <div className="min-h-screen bg-gray-50 ">
        <div className="max-w-full mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setCurrentView("table")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Table</span>
          </button>

          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Cover Section */}
            <div className="h-32 bg-gradient-to-r from-green-500 to-emerald-600"></div>

            {/* Profile Section */}
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
                <img
                  src={selectedUser.image ? selectedUser.image : "N/A" } 
                  className="w-32 h-32 rounded-xl border-4 border-white shadow-lg object-cover"
                  alt={selectedUser.name}
                />

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedUser.name}
                  </h1>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold text-white ${
                        selectedUser.role.toLowerCase() === "customer"
                          ? "bg-gradient-to-r from-green-400 to-green-600"
                          : selectedUser.role.toLowerCase() === "admin"
                          ? "bg-gradient-to-r from-red-400 to-red-600"
                          : "bg-gradient-to-r from-blue-400 to-blue-600"
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleUpdate(selectedUser)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  Edit Profile
                </button>
              </div>

              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {/* Email */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Email Address</p>
                    <p className="text-gray-900 font-semibold mt-1">{selectedUser.email || "N/A"}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                    <p className="text-gray-900 font-semibold mt-1">{selectedUser.phone_number}</p>
                  </div>
                </div>

                {/* Join Date */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Join Date</p>
                    <p className="text-gray-900 font-semibold mt-1">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">User ID</p>
                    <p className="text-gray-900 font-semibold mt-1 text-sm break-all">{selectedUser._id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // UPDATE PAGE
  if (currentView === "update" && selectedUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setCurrentView("table")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Table</span>
          </button>

          {/* Update Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-green-100 rounded-lg">
                <Edit className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Update Student</h1>
                <p className="text-gray-500">Edit student information below</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Profile Image
                </label>
                <div className="flex items-center gap-6">
                  <img
                    src={updateFormData.image || "/"}
                    className="w-24 h-24 rounded-xl border-2 border-gray-200 object-cover shadow-sm"
                    alt="Profile"
                  />
                  <div className="flex-1">
                    <input
                      type="file"
                      id="imageUpload"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const uploadedUrl = await uploadToCloudinary(file);

                        setUpdateFormData({
                          ...updateFormData,
                          image: uploadedUrl,
                        });

                        Swal.fire({
                          icon: "success",
                          title: "Image Uploaded",
                          timer: 1500,
                          showConfirmButton: false,
                        });
                      }}
                    />
                    <label
                      htmlFor="imageUpload"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium cursor-pointer transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      Upload New Image
                    </label>
                    <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF (Max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  value={updateFormData.name}
                  onChange={(e) =>
                    setUpdateFormData({
                      ...updateFormData,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  value={updateFormData.email}
                  onChange={(e) =>
                    setUpdateFormData({
                      ...updateFormData,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  value={updateFormData.phone_number}
                  onChange={(e) =>
                    setUpdateFormData({
                      ...updateFormData,
                      phone_number: e.target.value,
                    })
                  }
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentView("table")}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-800 transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TABLE VIEW (DEFAULT)
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[95%] mx-auto">
        {/* PAGE HEADER */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            👨‍🎓 Student Management Table
          </h1>
          <p className="text-gray-600">
            Easily view, update and manage all student information.
          </p>
        </div>

        {/* FILTER HEADER */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5" />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
                  value={filters.search_query}
                  onChange={(e) =>
                    setFilters({ ...filters, search_query: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && fetchAdmins()}
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 border rounded-lg"
              >
                <Filter className="w-5" />
                Filters
                <ChevronDown
                  className={`w-4 transition ${showFilters ? "rotate-180" : ""}`}
                />
              </button>

              {/* Search Button */}
              <button
                onClick={() => fetchAdmins()}
                className="px-6 py-2.5 bg-green-800 text-white rounded-lg flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5" />
                )}
                Search
              </button>
            </div>

            <Link href="/dashboard/team/create-student">
              <button className="px-6 py-2.5 bg-green-800 text-white rounded-lg flex items-center gap-2">
                <Plus className="w-5" /> Create Student
              </button>
            </Link>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div>
                <label>Page</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={filters.page}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      page: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label>Limit</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={filters.limit}
                  onChange={(e) =>
                    setFilters({ ...filters, limit: Number(e.target.value) })
                  }
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-10 h-10 animate-spin text-green-800" />
            </div>
          ) : (
            <div className="overflow-x-auto min-h-screen">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Join Date</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {admins.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* <img
                            src={u.image || "/avatar.png"}
                            className="h-10 w-10 rounded-full object-cover"
                            alt={u.name}
                          /> */}

                          {u.image && u.image.trim() !== "" ? (
  <img
    src={u.image}
    className="h-10 w-10 rounded-full object-cover"
    alt={u.name}
  />
) : (
  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
    <User className="w-5 h-5 text-gray-500" />
  </div>
)}

                          <div>
                            <p className="font-semibold text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-500">{u._id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-700">{u.phone_number}</td>
                      <td className="px-6 py-4 text-gray-700">{u.email && u.email ? u.email : "N/A"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-white font-medium text-sm ${
                            u.role.toLowerCase() === "customer"
                              ? "bg-gradient-to-r from-green-400 to-green-600"
                              : u.role.toLowerCase() === "admin"
                              ? "bg-gradient-to-r from-red-400 to-red-600"
                              : "bg-gradient-to-r from-blue-400 to-blue-600"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{formatDate(u.createdAt)}</td>

                      <td className="px-6 py-4 text-right">
                        <div className="relative dropdown-container inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === u._id ? null : u._id);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </button>

                          {openDropdown === u._id && (
                            <div className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-lg w-40 z-20 overflow-hidden">
                              <button
                                onClick={() => handleView(u)}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                              >
                                <Eye size={18} className="text-blue-600" />
                                <span className="font-medium text-gray-700">View</span>
                              </button>

                              <button
                                onClick={() => handleUpdate(u)}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                              >
                                <Edit size={18} className="text-green-600" />
                                <span className="font-medium text-gray-700">Update</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setShowDeleteModal(true);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-3 text-red-600 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
                              >
                                <Trash2 size={18} />
                                <span className="font-medium">Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={filters.page === 1}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: prev.page - 1,
              }))
            }
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg font-semibold shadow-md hover:from-green-600 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <p className="font-bold text-lg text-gray-700">
            Page {meta.page} of {Math.ceil(meta.total / meta.limit)}
          </p>

          <button
            disabled={filters.page >= Math.ceil(meta.total / meta.limit)}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: prev.page + 1,
              }))
            }
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg font-semibold shadow-md hover:from-green-600 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        {/* DELETE MODAL - Only modal that remains */}
        {showDeleteModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDeleteModal(false);
              }
            }}
          >
            <div 
              className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Delete Student?
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">{selectedUser?.name}</span>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-800 transition-all shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



