"use client";

import { useForm } from "react-hook-form";
import { Phone, User2, Lock, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ENV } from "@/config/env";

// Roles Enum (Values should match your backend expectations)
export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  AGENT: "AGENT",
  CUSTOMER: "CUSTOMER",
};

// Role Labels for UI Display
const ROLE_LABELS: Record<string, string> = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.MANAGER]: "Manager",
  [ROLES.AGENT]: "Agent",
  [ROLES.CUSTOMER]: "Customer",
};

// 🌿 ZOD VALIDATION SCHEMA
const AdminSchema = z.object({
  name: z
    .string()
    .min(3, "নামের কমপক্ষে ৩ অক্ষর হতে হবে")
    .nonempty("নাম প্রয়োজন"),

  phone_number: z
    .string()
    .length(11, "ফোন নম্বর অবশ্যই ১১ ডিজিট হতে হবে")
    .regex(/^01[0-9]{9}$/, "সঠিক বাংলাদেশি ফোন নম্বর লিখুন"),

  password: z
    .string()
    .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে")
    .nonempty("পাসওয়ার্ড প্রয়োজন"),

  role: z.string().nonempty("অবশ্যই একটি রোল নির্বাচন করুন"),
});

type AdminFormType = z.infer<typeof AdminSchema>;

// COOKIE GETTER
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export default function CreateAdminForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminFormType>({
    resolver: zodResolver(AdminSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: AdminFormType) => {
    try {
      const accessToken = getCookie("access_token");

      if (!accessToken) {
        Swal.fire({
          title: "অননুমোদিত অ্যাক্সেস",
          text: "আপনাকে আগে লগইন করতে হবে",
          icon: "warning",
        });
        router.push("/login");
        return;
      }

      const res = await fetch(`${ENV.BASE_URL}/admin/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      
      if (result.success) {
        Swal.fire({
          title: "Success!",
          text: "Admin Created Successfully",
          icon: "success",
        });
        reset();
      } else {
        Swal.fire({
          title: "ত্রুটি",
          text: result.message || "অ্যাডমিন তৈরি করা যায়নি!",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "সার্ভার ত্রুটি",
        text: "কিছু সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-4 py-10">
      {/* Title Section */}
      <div className="w-full max-w-4xl mb-8">
        <h1 className="text-3xl font-bold text-green-800">Create Admin</h1>
        <p className="text-gray-600">
          Smart Learning – MCQ Analysis সিস্টেমে নতুন অ্যাডমিন যোগ করুন।
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-4xl p-8 bg-white border border-green-200 shadow-xl rounded-2xl">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {/* NAME */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Full Name</label>
            <div className="relative">
              <User2 className="absolute text-gray-400 left-3 top-3" />
              <input
                type="text"
                placeholder="পূর্ণ নাম লিখুন"
                {...register("name")}
                className={`w-full pl-10 p-3 rounded-xl border-2 transition-all ${
                  errors.name ? "border-red-400" : "border-gray-200 focus:border-green-500 outline-none"
                }`}
              />
            </div>
            {errors.name && <span className="mt-1 text-sm text-red-500">{errors.name.message}</span>}
          </div>

          {/* PHONE NUMBER */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Phone Number</label>
            <div className="relative">
              <Phone className="absolute text-gray-400 left-3 top-3" />
              <input
                type="text"
                maxLength={11}
                placeholder="01XXXXXXXXX"
                {...register("phone_number")}
                className={`w-full pl-10 p-3 rounded-xl border-2 transition-all ${
                  errors.phone_number ? "border-red-400" : "border-gray-200 focus:border-green-500 outline-none"
                }`}
              />
            </div>
            {errors.phone_number && <span className="mt-1 text-sm text-red-500">{errors.phone_number.message}</span>}
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute text-gray-400 left-3 top-3" />
              <input
                type="password"
                placeholder="পাসওয়ার্ড লিখুন"
                {...register("password")}
                className={`w-full pl-10 p-3 rounded-xl border-2 transition-all ${
                  errors.password ? "border-red-400" : "border-gray-200 focus:border-green-500 outline-none"
                }`}
              />
            </div>
            {errors.password && <span className="mt-1 text-sm text-red-500">{errors.password.message}</span>}
          </div>

          {/* ROLE (MAPPED DYNAMICALLY) */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Select Role</label>
            <div className="relative">
              <ShieldCheck className="absolute text-gray-400 left-3 top-3" />
              <select
                {...register("role")}
                className={`w-full pl-10 p-3 rounded-xl border-2 bg-white transition-all appearance-none ${
                  errors.role ? "border-red-400" : "border-gray-200 focus:border-green-500 outline-none"
                }`}
              >
                <option value="">রোল নির্বাচন করুন</option>
                {Object.entries(ROLES).map(([key, value]) => (
                  <option key={value} value={value}>
                    {ROLE_LABELS[value] || key}
                  </option>
                ))}
              </select>
            </div>
            {errors.role && <span className="mt-1 text-sm text-red-500">{errors.role.message}</span>}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="mt-4 md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-3.5 rounded-xl shadow-lg hover:bg-green-700 transition-all disabled:bg-gray-400 flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  তৈরি হচ্ছে...
                </>
              ) : (
                "Create Admin"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}