"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ChevronDown,
  Plus,
  Search,
  Filter,
  Loader2,
  MoreVertical,
  ShieldCheck,
  User,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import UpdateAdminModal from "./UpdateModal";
import ProfileModal from "./ProfileModal";
import { ENV } from "@/config/env";

// --- Types ---
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

// --- Role UI Configuration ---
const roleConfig: Record<string, { gradient: string; label: string; icon: any }> = {
  admin: { 
    gradient: "from-blue-600 to-indigo-700", 
    label: "Admin", 
    icon: ShieldCheck 
  },
  super_admin: { 
    gradient: "from-purple-600 to-fuchsia-700", 
    label: "Super Admin", 
    icon: ShieldAlert 
  },
  manager: { 
    gradient: "from-rose-500 to-pink-600", 
    label: "Manager", 
    icon: User 
  },
  moderator: { 
    gradient: "from-orange-500 to-amber-600", 
    label: "Moderator", 
    icon: User 
  },
  founder: { 
    gradient: "from-yellow-500 to-orange-600", 
    label: "Founder", 
    icon: ShieldCheck 
  },
  agent: { 
    gradient: "from-green-500 to-teal-600", 
    label: "Agent", 
    icon: User 
  },
  student: { 
    gradient: "from-slate-500 to-slate-700", 
    label: "Student", 
    icon: User 
  },
};

const RoleBadge = ({ role }: { role: string }) => {
  const normalizedRole = role?.toLowerCase() || "user";
  const config = roleConfig[normalizedRole] || {
    gradient: "from-gray-500 to-gray-600",
    label: role?.toUpperCase() || "USER",
    icon: User
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-sm bg-gradient-to-r ${config.gradient} uppercase tracking-wider`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

export default function AdminList() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [updateModal, setUpdateModal] = useState<Admin | null>(null);
  const [profileModal, setProfileModal] = useState<string | null>(null);
  
  const router = useRouter();
  const [filters, setFilters] = useState({
    search_query: "",
    limit: 10,
    strat: 1,
    role: "",
  });

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = getCookie("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const query = new URLSearchParams({
        search_query: filters.search_query,
        limit: String(filters.limit),
        strat: String(filters.strat),
        ...(filters.role && { role: filters.role }),
      }).toString();

      const res = await fetch(`${ENV.BASE_URL}/admin?${query}`, {
        headers: { Authorization: accessToken },
        cache: "no-store",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const json = await res.json();
      if (json.success) {
        setAdmins(json.data.data || json.data);
        if (json.data.meta) setPaginationMeta(json.data.meta);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters, router]);

  useEffect(() => {
    fetchAdmins();
  }, [filters.strat, filters.limit, filters.role]);

  // Helper function to get cookie (Simplified)
  function getCookie(name: string) {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50/50 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Admin Management</h1>
          <p className="font-medium text-gray-500">Manage team roles and system access permissions</p>
        </div>
        <Link href="/dashboard/team/create-admin">
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-gray-200">
            <Plus className="w-5 h-5" />
            Create New Admin
          </button>
        </Link>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="w-full py-3 pl-12 pr-4 font-medium transition-all border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-pink-500"
              value={filters.search_query}
              onChange={(e) => setFilters({ ...filters, search_query: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && fetchAdmins()}
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-3 font-bold text-gray-700 transition-all bg-white border border-gray-100 rounded-2xl hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <button 
            onClick={fetchAdmins}
            className="px-8 py-3 font-bold text-white transition-all bg-pink-600 shadow-md rounded-2xl hover:bg-pink-700 shadow-pink-100"
          >
            Apply
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-4 pt-4 mt-4 border-t md:grid-cols-3 border-gray-50">
            <div className="space-y-1">
              <label className="ml-1 text-xs font-bold text-gray-400 uppercase">Filter by Role</label>
              <select 
                className="w-full p-3 font-medium border-none outline-none bg-gray-50 rounded-xl"
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
              >
                <option value="">All Roles</option>
                {Object.keys(roleConfig).map(role => (
                  <option key={role} value={role}>{roleConfig[role].label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 mb-4 text-pink-600 animate-spin" />
            <p className="font-bold text-gray-400">Fetching Admins...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Admin Details</th>
                  <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {admins.map((admin) => (
                  <tr key={admin._id} className="transition-colors hover:bg-gray-50/50 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={admin.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                            className="object-cover w-12 h-12 transition-all rounded-2xl ring-2 ring-gray-100 group-hover:ring-pink-100"
                            alt=""
                          />
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${admin.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>
                        <div>
                          <p className="flex items-center gap-2 font-bold text-gray-900">
                            {admin.name}
                            {currentUserId === admin._id && (
                              <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded-md">YOU</span>
                            )}
                          </p>
                          <p className="w-32 font-mono text-xs font-medium tracking-tighter text-gray-400 uppercase truncate">{admin._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-600">{admin.phone_number}</td>
                    <td className="px-6 py-4"><RoleBadge role={admin.role} /></td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                        admin.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <button 
                        onClick={() => setActiveDropdown(activeDropdown === admin._id ? null : admin._id)}
                        className="p-2 text-gray-400 transition-colors hover:bg-gray-100 rounded-xl hover:text-gray-900"
                       >
                         <MoreVertical className="w-5 h-5" />
                       </button>
                       {/* Dropdown Menu (Simplified Logic) */}
                       {activeDropdown === admin._id && (
                         <div className="absolute z-50 w-48 py-2 mt-2 duration-200 bg-white border border-gray-100 shadow-xl right-12 rounded-2xl animate-in fade-in zoom-in">
                            <button onClick={() => setProfileModal(admin._id)} className="w-full px-4 py-2 text-sm font-bold text-left text-gray-700 transition-all hover:bg-pink-50 hover:text-pink-600">View Profile</button>
                            <button onClick={() => router.push(`/dashboard/team/permission?id=${admin._id}`)} className="w-full px-4 py-2 text-sm font-bold text-left text-gray-700 transition-all hover:bg-pink-50 hover:text-pink-600">Manage Permissions</button>
                            <button onClick={() => setUpdateModal(admin)} className="w-full px-4 py-2 text-sm font-bold text-left text-gray-700 transition-all hover:bg-pink-50 hover:text-pink-600">Update</button>
                            <div className="h-px my-1 bg-gray-50" />
                            <button className="w-full px-4 py-2 text-sm font-bold text-left text-red-600 transition-all hover:bg-red-50">Delete Account</button>
                         </div>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals remain same but with better styling hooks */}
      {updateModal && (
        <UpdateAdminModal admin={updateModal} onClose={() => setUpdateModal(null)} onUpdated={fetchAdmins} />
      )}
      {profileModal && (
        <ProfileModal adminId={profileModal} onClose={() => setProfileModal(null)} />
      )}
    </div>
  );
}