




"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { ENV } from "@/config/env";

const Login: React.FC = () => {
  const router = useRouter();


  const [redirectUrl, setRedirectUrl] = useState("/dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const r = params.get("redirect");
      if (r) setRedirectUrl(r);
    }
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    phone_number: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    phone_number?: string;
    password?: string;
  }>({});

  // ONLY NUMBER
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, phone_number: value }));
    if (errors.phone_number) {
      setErrors((prev) => ({ ...prev, phone_number: undefined }));
    }
  };

  // INPUT HANDLER
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // VALIDATION
  const validateForm = () => {
    const newErrors: { phone_number?: string; password?: string } = {};

    if (!formData.phone_number)
      newErrors.phone_number = "Phone number is required";
    else if (formData.phone_number.length < 10)
      newErrors.phone_number = "Invalid phone number";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Minimum 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // LOGIN HANDLER
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await fetch(
        `${ENV.BASE_URL}/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await res.json();

      if (result.success && result.data) {

        if (result.data.access_token) {
          document.cookie = `access_token=${result.data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }

        if (result.data.refresh_token) {
          document.cookie = `refresh_token=${result.data.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        }

        Swal.fire({
          title: "Success!",
          text: "Login successful!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        setTimeout(() => {
          router.push(redirectUrl);
          router.refresh();
        }, 1500);
      } else {
        Swal.fire({
          title: "Failed",
          text: result.message || "Login failed",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        title: "Error",
        text: "Unable to connect to server!",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
        <div className="h-32 bg-gradient-to-br from-green-600 via-green-700 to-emerald-700 flex flex-col items-center justify-center text-white rounded-t-2xl">
          <LogIn className="w-12 h-12 mb-2" />
          <h2 className="text-2xl font-bold">Login</h2>
          <p className="text-green-100 text-sm">MCQ Analysis Admin</p>
        </div>

        <div className="p-8 space-y-5">
          {/* Phone Input */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handlePhoneChange}
                onKeyPress={handleKeyPress}
                placeholder="01XXXXXXXXX"
                maxLength={11}
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:border-green-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            {errors.phone_number && (
              <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                <AlertCircle className="w-4 h-4" /> {errors.phone_number}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
                disabled={isLoading}
                className="w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:border-green-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                <AlertCircle className="w-4 h-4" /> {errors.password}
              </p>
            )}
          </div>

          {/* Login Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:opacity-90 flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" /> Login
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
