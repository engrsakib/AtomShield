



"use client";

import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { User, Phone, Lock } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ENV } from "@/config/env";


const StudentSchema = z.object({
  name: z
    .string()
    .min(3, "Name কমপক্ষে 3 অক্ষর হতে হবে")
    .nonempty("Name প্রয়োজন"),

  phone_number: z
    .string()
    .length(11, "Phone number অবশ্যই 11 digit হতে হবে")
    .regex(/^01[0-9]{9}$/, "সঠিক বাংলাদেশি মোবাইল নাম্বার দিন"),

  password: z
    .string()
    .min(6, "Password কমপক্ষে 6 অক্ষর হতে হবে")
    .nonempty("Password প্রয়োজন"),
});


type FormType = z.infer<typeof StudentSchema>;



export default function CreateStudent() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormType>({
    resolver: zodResolver(StudentSchema),
  });

  const onSubmit = async (data: FormType) => {
    try {
      const payload = { ...data, role: "customer" };

      const res = await fetch(`${ENV.BASE_URL}/user/create-user-by-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        Swal.fire({
          icon: "success",
          title: "Student Created",
          text: json.message,
          confirmButtonColor: "#065f46",
        });

        reset();
        router.push("/dashboard/team/view-student");
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: json.message || "Something went wrong!",
          confirmButtonColor: "#065f46",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Unexpected Error",
        text: "Please try again later",
        confirmButtonColor: "#065f46",
      });
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-2">
          Create Student
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Fill the form below to create a new student account.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                {...register("name")}
                className="w-full border rounded-lg pl-10 p-3"
                placeholder="Enter full name"
              />
            </div>
            {errors.name && (
              <p className="text-red-600 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block mb-1 font-medium">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                {...register("phone_number")}
                className="w-full border rounded-lg pl-10 p-3"
                placeholder="01XXXXXXXXX"
              />
            </div>
            {errors.phone_number && (
              <p className="text-red-600 text-sm">
                {errors.phone_number.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                {...register("password")}
                className="w-full border rounded-lg pl-10 p-3"
                placeholder="Enter password"
              />
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-800 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-900 transition"
          >
            {isSubmitting ? "Creating..." : "Create Student"}
          </button>
        </form>
      </div>
    </div>
  );
}
