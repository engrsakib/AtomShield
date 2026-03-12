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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">No admin ID provided</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 mb-4 text-green-800 animate-spin" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">Profile not found</p>
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
    <div className="min-h-screen p-4 bg-gray-50 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Card */}
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Header with Green Background */}
          <div className="h-48 bg-gradient-to-r from-green-700 to-green-900"></div>

          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Profile Picture and Name */}
            <div className="flex flex-col items-start justify-between mb-6 -mt-16 sm:flex-row sm:items-end">
              <div className="flex flex-col items-center gap-4 mb-4 sm:flex-row sm:items-end sm:mb-0">
                <div className="relative">
                  <img
                    src={
                      admin.image ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt={admin.name}
                    className="object-cover w-32 h-32 border-4 border-white rounded-full shadow-lg"
                  />
                  <div className="absolute w-6 h-6 bg-green-500 border-2 border-white rounded-full bottom-2 right-2"></div>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                    {admin.name}
                  </h1>
                  <p className="font-medium text-green-700 capitalize">
                    {admin.role.replace(/_/g, " ")}
                  </p>
                  <span className="inline-block px-3 py-1 mt-1 text-sm text-green-800 bg-green-100 rounded-full">
                    {admin.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Contact Information */}
              <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-50">
                      <Phone className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900">
                        {admin.phone_number}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-50">
                      <Briefcase className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Designation</p>
                      <p className="font-medium text-gray-900">
                        {admin.designation || "normal_man"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-50">
                      <Calendar className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(admin.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Biography
                </h2>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-50">
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
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Permissions
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {(admin.permissions || defaultPermissions).map((permission, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 text-sm text-center text-green-800 border border-green-100 rounded-lg bg-green-50"
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