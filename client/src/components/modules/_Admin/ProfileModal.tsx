








// "use client";

// import { useEffect, useState } from "react";
// import { X, Loader2, Phone, Briefcase, Calendar, FileText } from "lucide-react";
// import Swal from "sweetalert2";
// import { useRouter } from "next/navigation";
// import { ENV } from "@/config/env";

// function getCookie(name: string): string | null {
//   if (typeof document === "undefined") return null;
  
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);

//   if (parts.length === 2) {
//     return parts.pop()?.split(";").shift() || null;
//   }
//   return null;
// }

// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// interface AdminProfile {
//   _id: string;
//   name: string;
//   phone_number: string;
//   role: string;
//   status: string;
//   image?: string;
//   designation?: string;
//   biography?: string;
//   createdAt?: string;
//   permissions?: string[];
// }

// interface ProfileModalProps {
//   adminId: string;
//   onClose: () => void;
// }

// export default function ProfileModal({ adminId, onClose }: ProfileModalProps) {
//   const [admin, setAdmin] = useState<AdminProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const fetchAdminProfile = async () => {
//     try {
//       setLoading(true);
//       const accessToken = getCookie("access_token");

//       if (!accessToken) {
//         Swal.fire({
//           title: "Unauthorized",
//           text: "Please login first",
//           icon: "warning",
//         });
//         router.push("/login");
//         return;
//       }

//       const res = await fetch(`${ENV.BASE_URL}/admin/${adminId}`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": accessToken,
//         },
//         credentials: "include",
//       });

//       if (res.status === 401) {
//         Swal.fire({
//           title: "Session Expired",
//           text: "Please login again",
//           icon: "warning",
//         });
//         router.push("/login");
//         return;
//       }

//       const json = await res.json();

//       if (!json.success) {
//         Swal.fire({
//           title: "Error",
//           text: json.message || "Failed to fetch profile",
//           icon: "error",
//         });
//         onClose();
//         return;
//       }

//       setAdmin(json.data);
//     } catch (e) {
//       Swal.fire({
//         title: "Error",
//         text: "Failed to fetch admin profile",
//         icon: "error",
//       });
//       onClose();
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (adminId) {
//       fetchAdminProfile();
//     }
//   }, [adminId]);

//   const formatDate = (dateString?: string) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
//       {/* Backdrop with blur and dark overlay */}
//       <div
//         className="fixed inset-0 backdrop-blur-sm bg-white transition-opacity"
//         onClick={onClose}
//       ></div>

//       {/* Modal */}
//       <div className="flex min-h-full items-center justify-center p-4">
//         <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//           {/* Close Button */}
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
//           >
//             <X className="w-5 h-5 text-gray-600" />
//           </button>

//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-20">
//               <Loader2 className="w-12 h-12 text-green-800 animate-spin mb-4" />
//               <p className="text-gray-600">Loading profile...</p>
//             </div>
//           ) : admin ? (
//             <>
//               {/* Header */}
//               <div className="h-32 bg-gradient-to-r from-green-700 to-green-900"></div>

//               {/* Profile Content */}
//               <div className="px-6 pb-6">
//                 <div className="flex flex-col sm:flex-row translate-y-7 items-center sm:items-end gap-4 -mt-16 mb-6">
//                   <div className="relative">
//                     <img
//                       src={
//                         admin.image ||
//                         "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                       }
//                       alt={admin.name}
//                       className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
//                     />
//                     <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
//                   </div>
//                   <div className="text-center sm:text-left">
//                     <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
//                       {admin.name}
//                     </h1>
//                     <p className="text-green-700 font-medium capitalize">
//                       {admin.role.replace(/_/g, " ")}
//                     </p>
//                     <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
//                       {admin.status}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   {/* Contact Info */}
//                   <div>
//                     <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                       Contact Information
//                     </h2>
//                     <div className="space-y-4">
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 bg-green-50 rounded-lg">
//                           <Phone className="w-5 h-5 text-green-700" />
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500">Phone Number</p>
//                           <p className="text-gray-900 font-medium">
//                             {admin.phone_number}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="flex items-start gap-3">
//                         <div className="p-2 bg-green-50 rounded-lg">
//                           <Briefcase className="w-5 h-5 text-green-700" />
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500">Designation</p>
//                           <p className="text-gray-900 font-medium">
//                             {admin.designation || "normal_man"}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="flex items-start gap-3">
//                         <div className="p-2 bg-green-50 rounded-lg">
//                           <Calendar className="w-5 h-5 text-green-700" />
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500">Joined</p>
//                           <p className="text-gray-900 font-medium">
//                             {formatDate(admin?.createdAt)}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Biography */}
//                   <div>
//                     <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                       Biography
//                     </h2>
//                     <div className="flex items-start gap-3">
//                       <div className="p-2 bg-green-50 rounded-lg">
//                         <FileText className="w-5 h-5 text-green-700" />
//                       </div>
//                       <div>
//                         <p className="text-gray-700">
//                           {admin.biography || "my biograph"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Conditionally Render Permissions */}
//                 {admin.permissions && admin.permissions.length > 0 && (
//                   <div className="mt-8">
//                     <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                       Permissions
//                     </h2>
//                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//                       {admin.permissions.map((permission, index) => (
//                         <div
//                           key={index}
//                           className="px-4 py-2 bg-green-50 text-green-800 text-sm text-center rounded-lg border border-green-100"
//                         >
//                           {permission.replace(/_/g, " ")}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </>
//           ) : (
//             <div className="flex flex-col items-center justify-center py-20">
//               <p className="text-gray-600 text-lg">Profile not found</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }













"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Phone, Briefcase, Calendar, FileText, Mail, Shield } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
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

interface AdminProfile {
  _id: string;
  name: string;
  phone_number: string;
  role: string;
  status: string;
  image?: string;
  designation?: string;
  biography?: string;
  createdAt?: string;
  permissions?: string[];
}

interface ProfileModalProps {
  adminId: string;
  onClose: () => void;
}

export default function ProfileModal({ adminId, onClose }: ProfileModalProps) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAdminProfile = async () => {
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

      const res = await fetch(`${ENV.BASE_URL}/admin/${adminId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": accessToken,
        },
        credentials: "include",
      });

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

      if (!json.success) {
        Swal.fire({
          title: "Error",
          text: json.message || "Failed to fetch profile",
          icon: "error",
        });
        onClose();
        return;
      }

      setAdmin(json.data);
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: "Failed to fetch admin profile",
        icon: "error",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminId) {
      fetchAdminProfile();
    }
  }, [adminId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 group"
        >
          <X className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-colors" />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-green-100 rounded-full"></div>
            </div>
            <p className="text-gray-600 mt-6 text-lg font-medium">Loading profile...</p>
          </div>
        ) : admin ? (
          <div className="overflow-y-auto max-h-[95vh]">
            <div className="relative h-48 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            </div>

            <div className="px-6 sm:px-10 pb-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20 mb-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <img
                    src={admin.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt={admin.name}
                    className="relative w-36 h-36 rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-green-100"
                  />
                  <div className="absolute bottom-3 right-3 w-7 h-7 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
                </div>
                
                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {admin.name}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-semibold text-sm rounded-full border border-green-200">
                      <Shield className="w-4 h-4" />
                      {admin.role.replace(/_/g, " ")}
                    </span>
                    <span className="inline-flex items-center px-4 py-1.5 bg-green-600 text-white font-medium text-sm rounded-full shadow-md">
                      {admin.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                      Contact Information
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone Number</p>
                          <p className="text-gray-900 font-semibold text-lg">
                            {admin.phone_number}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Designation</p>
                          <p className="text-gray-900 font-semibold text-lg capitalize">
                            {admin.designation || "Staff Member"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Member Since</p>
                          <p className="text-gray-900 font-semibold text-lg">
                            {formatDate(admin?.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                      Biography
                    </h2>
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200">
                      <div className="flex gap-4">
                        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-md h-fit">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 leading-relaxed text-base">
                            {admin.biography || "No biography provided yet."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {admin.permissions && admin.permissions.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                    Permissions & Access
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {admin.permissions.map((permission, index) => (
                      <div
                        key={index}
                        className="group px-4 py-3 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-800 text-sm font-medium text-center rounded-xl border border-green-200 hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-default"
                      >
                        <span className="capitalize">
                          {permission.replace(/_/g, " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <X className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-xl font-semibold">Profile not found</p>
            <p className="text-gray-500 text-sm mt-2">The requested profile could not be loaded</p>
          </div>
        )}
      </div>
    </div>
  );
}