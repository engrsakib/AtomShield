



"use client";
import { 
  Bell, LogOut, User, Menu, Award, BookOpen, FileText, TrendingUp 
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { ENV } from "@/config/env";


const notificationsData = [
  {
    id: 1,
    icon: Award,
    title: "New Achievement Unlocked!",
    description: "You've completed 50 MCQ questions.",
    time: "5 minutes ago",
    read: false
  },
  {
    id: 2,
    icon: BookOpen,
    title: "New Exam Available",
    description: "Physics Chapter 5 exam is now available",
    time: "1 hour ago",
    read: false
  }
];

// Get Cookie
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export const Navbar = ({ onMenuClick }: any) => {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const unreadCount = notificationsData.filter(n => !n.read).length;

  // ----------------------------
  // ADMIN DATA STATES
  // ----------------------------
  const [admin, setAdmin] = useState<any>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  // ----------------------------
  // FETCH ADMIN DATA
  // ----------------------------
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = getCookie("access_token");

        const res = await fetch(`${ENV.BASE_URL}/admin/auth`, {
          headers: {
            Authorization: token || "",
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await res.json();
        // console.log("ADMIN PROFILE:", data);

        if (data.success) {
          setAdmin(data.data);
        }
      } catch (err) {
        console.error("Admin fetch error:", err);
      } finally {
        setLoadingAdmin(false);
      }
    };

    fetchAdminData();
  }, []);

  // ----------------------------
  // CLICK OUTSIDE CLOSE DROPDOWN
  // ----------------------------
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ----------------------------
  // LOGOUT
  // ----------------------------
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      try {
        const accessToken = getCookie("access_token");

        if (accessToken) {
          await fetch(`${ENV.BASE_URL}/admin/logout`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": accessToken,
            },
            credentials: "include",
          });
        }

        // Clear cookies
        document.cookie = "access_token=; path=/; max-age=0";
        document.cookie = "refresh_token=; path=/; max-age=0";

        Swal.fire({
          title: "Logged Out",
          text: "You have been logged out successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        setTimeout(() => {
          router.push("/login");
          router.refresh();
        }, 1200);

      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  return (
    <header className="h-16 border-b border-green-800/30 bg-[#2B6A5B] flex items-center justify-between px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-green-100 hover:text-white p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="hidden md:block font-semibold text-lg text-white">
          Smart Learning – MCQ Analysis Dashboard
        </h2>
      </div>

      {/* RIGHT SIDE ICONS */}
      <div className="flex items-center gap-4 relative text-white">

        {/* ---------------------- NOTIFICATIONS ---------------------- */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-green-100 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-50 text-black"
              >
                <div className="px-4 py-3 border-b bg-gray-50">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <p className="text-xs text-gray-500">You have {unreadCount} unread notifications</p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notificationsData.map((n) => {
                    const IconComp = n.icon;
                    return (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b hover:bg-gray-100 transition cursor-pointer ${
                          !n.read ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <IconComp className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">{n.title}</h4>
                            <p className="text-xs text-gray-600">{n.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---------------------- USER DROPDOWN ---------------------- */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="w-9 h-9 flex items-center justify-center bg-white/10 text-green-100 rounded-full hover:bg-white/20 transition-colors"
          >
            <User className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl overflow-hidden z-50 text-black"
              >
                {/* USER INFO */}
                <div className="flex items-center gap-3 px-4 py-3 border-b bg-gray-50">
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                    {/* <User className="w-5 h-5 text-gray-600" /> */}
                    <img src={admin?.image || "/default-profile.png"} alt={admin?.name || "User"} width={36} height={36} className="rounded-full" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {loadingAdmin ? "Loading..." : admin?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {loadingAdmin ? "..." : admin?.phone_number || "No Number"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {loadingAdmin ? "..." : admin?.role || "Role Not Found"}
                    </p>
                  </div>
                </div>

                {/* MENU */}
                <ul className="text-sm text-gray-700 py-2">
                  <li>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      My Profile
                    </Link>
                  </li>

                  <li className="border-t my-1"></li>

                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 w-full hover:bg-gray-100 text-left text-red-600"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </li>
                </ul>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
