






"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Plus,
  Search,
  Filter,
  Loader2,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import UpdateAdminModal from "./UpdateModal";
import ProfileModal from "./ProfileModal";
import { ENV } from "@/config/env";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

// Type definitions
interface Admin {
  _id: string;
  name: string;
  phone_number: string;
  role: string;
  status: string;
  image?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

interface Filters {
  search_query: string;
  limit: number;
  strat: number;
  role: string;
}

type RoleType =
  | "admin"
  | "super_admin"
  | "moderator"
  | "content_manager"
  | "user"
  | "founder";

// Role-based gradient colors with proper typing
const roleGradients: Record<RoleType, string> = {
  admin: "bg-gradient-to-r from-blue-500 to-purple-600",
  super_admin: "bg-gradient-to-r from-red-500 to-pink-600",
  moderator: "bg-gradient-to-r from-green-500 to-teal-600",
  content_manager: "bg-gradient-to-r from-orange-500 to-red-500",
  user: "bg-gradient-to-r from-gray-500 to-gray-700",
  founder: "bg-gradient-to-r from-yellow-500 to-orange-500",
};

// Role-based text colors
const roleTextColors: Record<RoleType, string> = {
  admin: "text-white",
  super_admin: "text-white",
  moderator: "text-white",
  content_manager: "text-white",
  user: "text-white",
  founder: "text-white",
};

// Role display names
const roleDisplayNames: Record<RoleType, string> = {
  admin: "Admin",
  super_admin: "Super Admin",
  moderator: "Moderator",
  content_manager: "Content Manager",
  user: "User",
  founder: "Founder",
};

// Role badge component with proper typing
interface RoleBadgeProps {
  role: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  // Type guard to check if role is valid
  const isValidRole = (r: string): r is RoleType => {
    return r in roleGradients;
  };

  const gradientClass = isValidRole(role)
    ? roleGradients[role]
    : "bg-gradient-to-r from-gray-500 to-gray-700";

  const textColorClass = isValidRole(role)
    ? roleTextColors[role]
    : "text-white";

  const displayName = isValidRole(role) ? roleDisplayNames[role] : role;

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${gradientClass} ${textColorClass} shadow-sm`}
    >
      {displayName}
    </span>
  );
};

export default function AdminList() {
  const [updateModal, setUpdateModal] = useState<Admin | null>(null);
  const [profileModal, setProfileModal] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    search_query: "",
    limit: 10,
    strat: 1,
    role: "",
  });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const accessToken = getCookie("access_token");

      if (!accessToken) {
        Swal.fire({
          title: "Unauthorized",
          text: "Please login first",
          icon: "warning",
        });
        router.push("/login");
        return;
      }

      const BASE_URL =  process.env.NEXT_PUBLIC_BASE_URL ;

      // Fetch current logged-in user info
      try {
        const currentUserRes = await fetch(
          `${BASE_URL}/admin/auth`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: accessToken,
            },
            credentials: "include",
            cache:"force-cache",
          }
          
        );

        if (currentUserRes.ok) {
          const currentUserJson = await currentUserRes.json();
          console.log("Current User Response:", currentUserJson);
          if (currentUserJson.success && currentUserJson.data) {
            setCurrentUserId(currentUserJson.data._id);
          }
        }
      } catch (error) {
        console.log("Failed to fetch current user:", error);
      }

      const query = new URLSearchParams({
        search_query: filters.search_query,
        limit: String(filters.limit),
        strat: String(filters.strat),
        ...(filters.role && { role: filters.role }),
      }).toString();

      const res = await fetch(
        `${ENV.BASE_URL}/admin?${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
          // credentials: "include",
          cache:"force-cache",
        }
      );

      console.log("From Admin List", res)

      if (res.status === 401) {
        Swal.fire({
          title: "Session Expired",
          text: "Please login again",
          icon: "warning",
        });
        router.push("/login");
        return;
      }

      const json = await res.json();
      console.log("API Response:", json);

      if (!json.success) {
        console.error(json);
        return;
      }

      // Set pagination metadata
      if (json.data.meta) {
        setPaginationMeta(json.data.meta);
      }

      setAdmins(json.data.data || json.data);
    } catch (e) {
      console.log(e);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch admins",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [filters.strat]);

  const handleManagePermission = (adminId: string) => {
    router.push(`/dashboard/team/permission?id=${adminId}`);
  };

  const handleUpdate = (adminData: Admin) => {
    setUpdateModal(adminData);
  };

  const handleViewProfile = (adminId: string) => {
    setProfileModal(adminId);
  };

  const handleDelete = async (adminId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#166534",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const accessToken = getCookie("access_token");

      if (!accessToken) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Please login again.",
          confirmButtonColor: "#166534",
        });
        router.push("/login");
        return;
      }

      const res = await fetch(
        `${ENV.BASE_URL}/admin/${adminId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
          credentials: "include",
        }
      );

      if (res.status === 401) {
        Swal.fire({
          icon: "warning",
          title: "Session Expired",
          text: "Please login again",
        });
        router.push("/login");
        return;
      }

      const json = await res.json();
      console.log("Delete response:", json);

      if (json.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Admin has been deleted successfully.",
          confirmButtonColor: "#166534",
        });
        fetchAdmins();
      } else {
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: json.message || "Failed to delete admin",
          confirmButtonColor: "#166534",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while deleting the admin",
        confirmButtonColor: "#166534",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Admin Management
        </h1>
        <p className="text-gray-600">
          Manage your admin users and their permissions
        </p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none transition-all"
                value={filters.search_query}
                onChange={(e) =>
                  setFilters({ ...filters, search_query: e.target.value })
                }
                onKeyPress={(e) => e.key === "Enter" && fetchAdmins()}
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Search Button */}
            <button
              onClick={fetchAdmins}
              disabled={loading}
              className="px-6 py-2.5 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {/* Create Admin Button */}
          <Link href={"/dashboard/team/create-admin"}>
            <button className="px-6 py-2.5 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors flex items-center justify-center gap-2 font-medium">
              <Plus className="w-5 h-5" />
              Create Admin
            </button>
          </Link>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start From
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none"
                value={filters.strat}
                onChange={(e) =>
                  setFilters({ ...filters, strat: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limit
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none"
                value={filters.limit}
                onChange={(e) =>
                  setFilters({ ...filters, limit: Number(e.target.value) })
                }
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none"
                value={filters.role}
                onChange={(e) =>
                  setFilters({ ...filters, role: e.target.value })
                }
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="moderator">Moderator</option>
                <option value="content_manager">Content Manager</option>
                <option value="founder">Founder</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white min-h-screen rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-green-800 animate-spin mb-4" />
            <p className="text-gray-600">Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">No admins found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden min-h-screen md:block overflow-x-auto rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr
                      key={admin._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              admin.image ||
                              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            }
                            alt={admin.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {admin.name}
                            </span>
                            {currentUserId === admin._id && (
                              <span className="px-2.5 py-1 text-xs font-semibold bg-green-800 text-white rounded-full shadow-sm">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {admin.phone_number}
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={admin.role} />
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            admin.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {admin.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setActiveDropdown(
                                  activeDropdown === admin._id ? null : admin._id
                                )
                              }
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-600" />
                            </button>
                            {activeDropdown === admin._id && (
                              <>
                                <div
                                  className="fixed inset-0 z-[100]"
                                  onClick={() => setActiveDropdown(null)}
                                ></div>
                                <div className="absolute right-1/2 transform translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[200]">
                                  <button
                                    onClick={() => {
                                      handleViewProfile(admin._id);
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    View Profile
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleManagePermission(admin._id);
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    Manage Permission
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleUpdate(admin);
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    Update
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDelete(admin._id);
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {admins.map((admin) => (
                <div key={admin._id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          admin.image ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt={admin.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {admin.name}
                          </p>
                          {currentUserId === admin._id && (
                            <span className="px-2.5 py-0.5 text-xs font-semibold bg-green-800 text-white rounded-full shadow-sm">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {admin.phone_number}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === admin._id ? null : admin._id
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      {activeDropdown === admin._id && (
                        <>
                          <div
                            className="fixed inset-0 z-[100]"
                            onClick={() => setActiveDropdown(null)}
                          ></div>
                          <div className="absolute right-1/2 transform translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[200]">
                            <button
                              onClick={() => {
                                handleViewProfile(admin._id);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={() => {
                                handleManagePermission(admin._id);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Manage Permission
                            </button>
                            <button
                              onClick={() => {
                                handleUpdate(admin);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(admin._id);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <RoleBadge role={admin.role} />
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {admin.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination Info */}
      {!loading && admins.length > 0 && paginationMeta && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {/* Info Section */}
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium text-gray-900">
              {(paginationMeta.page - 1) * paginationMeta.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-gray-900">
              {Math.min(paginationMeta.page * paginationMeta.limit, paginationMeta.total)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-900">
              {paginationMeta.total}
            </span>{" "}
            results
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters({ ...filters, strat: Math.max(1, filters.strat - filters.limit) })}
              disabled={paginationMeta.page <= 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(paginationMeta.total / paginationMeta.limit) }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  const currentPage = paginationMeta.page;
                  return (
                    page === 1 ||
                    page === Math.ceil(paginationMeta.total / paginationMeta.limit) ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                  
                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsisBefore && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => setFilters({ ...filters, strat: (page - 1) * filters.limit + 1 })}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          paginationMeta.page === page
                            ? "bg-green-800 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
            </div>

            <button
              onClick={() => setFilters({ ...filters, strat: filters.strat + filters.limit })}
              disabled={paginationMeta.page >= Math.ceil(paginationMeta.total / paginationMeta.limit)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {updateModal && (
        <UpdateAdminModal
          admin={updateModal}
          onClose={() => setUpdateModal(null)}
          onUpdated={fetchAdmins}
        />
      )}

      {profileModal && (
        <ProfileModal
          adminId={profileModal}
          onClose={() => setProfileModal(null)}
        />
      )}
    </div>
  );
}































