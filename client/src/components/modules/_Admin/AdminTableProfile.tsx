// "use client";

// import { useEffect, useState } from "react";
// import { Loader2, Phone, Briefcase, Calendar, FileText } from "lucide-react";
// import { useRouter } from "next/navigation";
// import Swal from "sweetalert2";

// function getCookie(name: string): string | null {
//   if (typeof document === "undefined") return null;
  
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
  
//   if (parts.length === 2) {
//     return parts.pop()?.split(";").shift() || null;
//   }
//   return null;
// }

// interface AdminProfile {
//   _id: string;
//   name: string;
//   phone_number: string;
//   role: string;
//   status: string;
//   image?: string;
//   designation?: string;
//   biography?: string;
//   created_at?: string;
//   permissions?: string[];
// }

// interface AdminProfileProps {
//   adminId: string;
// }

// export default function AdminProfile({ adminId }: AdminProfileProps) {
//   const [admin, setAdmin] = useState<AdminProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   // Default permissions if not provided by API
//   const defaultPermissions = [
//     "create student",
//     "view student", 
//     "update student",
//     "delete student",
//     "view question",
//     "update question",
//     "delete question",
//     "create book",
//     "view book",
//     "update book",
//     "delete book",
//     "create guideline",
//     "view guideline",
//     "update guideline",
//     "delete guideline",
//     "view staff",
//     "update staff",
//     "delete staff",
//     "manage permissions",
//     "create question",
//     "create staff",
//     "create exam",
//     "view exam",
//     "update exam",
//     "delete exam"
//   ];

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

//       const res = await fetch(
//         `https://mcq-analysis.vercel.app/api/v1/admin/${adminId}`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": accessToken,
//           },
//           credentials: "include",
//         }
//       );

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
//       console.log("Profile Response:", json);

//       if (!json.success) {
//         console.error(json);
//         Swal.fire({
//           title: "Error",
//           text: json.message || "Failed to fetch profile",
//           icon: "error",
//         });
//         return;
//       }

//       setAdmin(json.data);
//     } catch (e) {
//       console.log(e);
//       Swal.fire({
//         title: "Error",
//         text: "Failed to fetch admin profile",
//         icon: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (adminId) {
//       fetchAdminProfile();
//     }
//   }, [adminId]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="flex flex-col items-center">
//           <Loader2 className="w-12 h-12 text-green-800 animate-spin mb-4" />
//           <p className="text-gray-600">Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!admin) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600 text-lg">Profile not found</p>
//         </div>
//       </div>
//     );
//   }

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
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
//       <div className="max-w-5xl mx-auto">
//         {/* Profile Card */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//           {/* Header with Green Background */}
//           <div className="h-48 bg-gradient-to-r from-green-700 to-green-900"></div>

//           {/* Profile Content */}
//           <div className="px-6 pb-6">
//             {/* Profile Picture and Name */}
//             <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 mb-6">
//               <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-4 sm:mb-0">
//                 <div className="relative">
//                   <img
//                     src={
//                       admin.image ||
//                       "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                     }
//                     alt={admin.name}
//                     className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
//                   />
//                   <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
//                 </div>
//                 <div className="text-center sm:text-left">
//                   <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
//                     {admin.name}
//                   </h1>
//                   <p className="text-green-700 font-medium capitalize">
//                     {admin.role.replace(/_/g, " ")}
//                   </p>
//                   <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
//                     {admin.status}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Contact Information */}
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                   Contact Information
//                 </h2>
//                 <div className="space-y-4">
//                   <div className="flex items-start gap-3">
//                     <div className="p-2 bg-green-50 rounded-lg">
//                       <Phone className="w-5 h-5 text-green-700" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Phone Number</p>
//                       <p className="text-gray-900 font-medium">
//                         {admin.phone_number}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <div className="p-2 bg-green-50 rounded-lg">
//                       <Briefcase className="w-5 h-5 text-green-700" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Designation</p>
//                       <p className="text-gray-900 font-medium">
//                         {admin.designation || "normal_man"}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <div className="p-2 bg-green-50 rounded-lg">
//                       <Calendar className="w-5 h-5 text-green-700" />
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-500">Joined</p>
//                       <p className="text-gray-900 font-medium">
//                         {formatDate(admin.created_at)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Biography */}
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                   Biography
//                 </h2>
//                 <div className="flex items-start gap-3">
//                   <div className="p-2 bg-green-50 rounded-lg">
//                     <FileText className="w-5 h-5 text-green-700" />
//                   </div>
//                   <div>
//                     <p className="text-gray-700">
//                       {admin.biography || "my biograph"}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Permissions Section */}
//             <div className="mt-8">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Permissions
//               </h2>
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//                 {(admin.permissions || defaultPermissions).map((permission, index) => (
//                   <div
//                     key={index}
//                     className="px-4 py-2 bg-green-50 text-green-800 text-sm text-center rounded-lg border border-green-100"
//                   >
//                     {permission.replace(/_/g, " ")}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }











"use client";

import { useEffect, useState } from "react";
import { Loader2, Phone, Briefcase, Calendar, FileText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";

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
  created_at?: string;
  permissions?: string[];
}

export default function AdminProfile() {
  const searchParams = useSearchParams();
  const adminId = searchParams.get("id");
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Default permissions if not provided by API
  const defaultPermissions = [
    "create student",
    "view student", 
    "update student",
    "delete student",
    "view question",
    "update question",
    "delete question",
    "create book",
    "view book",
    "update book",
    "delete book",
    "create guideline",
    "view guideline",
    "update guideline",
    "delete guideline",
    "view staff",
    "update staff",
    "delete staff",
    "manage permissions",
    "create question",
    "create staff",
    "create exam",
    "view exam",
    "update exam",
    "delete exam"
  ];

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

      const res = await fetch(
        `https://mcq-analysis.vercel.app/api/v1/admin/${adminId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": accessToken,
          },
          credentials: "include",
        }
      );

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
      console.log("Profile Response:", json);

      if (!json.success) {
        console.error(json);
        Swal.fire({
          title: "Error",
          text: json.message || "Failed to fetch profile",
          icon: "error",
        });
        return;
      }

      setAdmin(json.data);
    } catch (e) {
      console.log(e);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch admin profile",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminId) {
      fetchAdminProfile();
    }
  }, [adminId]);

  if (!adminId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No admin ID provided</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-green-800 animate-spin mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Profile not found</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header with Green Background */}
          <div className="h-48 bg-gradient-to-r from-green-700 to-green-900"></div>

          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Profile Picture and Name */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-4 sm:mb-0">
                <div className="relative">
                  <img
                    src={
                      admin.image ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt={admin.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {admin.name}
                  </h1>
                  <p className="text-green-700 font-medium capitalize">
                    {admin.role.replace(/_/g, " ")}
                  </p>
                  <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {admin.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Phone className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-gray-900 font-medium">
                        {admin.phone_number}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Briefcase className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Designation</p>
                      <p className="text-gray-900 font-medium">
                        {admin.designation || "normal_man"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="text-gray-900 font-medium">
                        {formatDate(admin.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Biography
                </h2>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <FileText className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-gray-700">
                      {admin.biography || "my biograph"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions Section */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Permissions
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(admin.permissions || defaultPermissions).map((permission, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-green-50 text-green-800 text-sm text-center rounded-lg border border-green-100"
                  >
                    {permission.replace(/_/g, " ")}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}