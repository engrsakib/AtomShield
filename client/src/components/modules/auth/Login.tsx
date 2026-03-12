"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Phone, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import { ENV } from "@/config/env";

const Login: React.FC = () => {
  const router = useRouter();

  const [redirectUrl, setRedirectUrl] = useState("/dashboard");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const r = params.get("redirect");
      if (r) setRedirectUrl(r);

      // Trigger animation after mount
      setTimeout(() => setAnimate(true), 100);
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, phone_number: value }));
    if (errors.phone_number) {
      setErrors((prev) => ({ ...prev, phone_number: undefined }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await fetch(`${ENV.BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (result.success && result.data) {
        if (result.data.access_token) {
          document.cookie = `access_token=${result.data.access_token}; path=/; max-age=${
            60 * 60 * 24 * 7
          }; SameSite=Lax`;
        }

        if (result.data.refresh_token) {
          document.cookie = `refresh_token=${result.data.refresh_token}; path=/; max-age=${
            60 * 60 * 24 * 30
          }; SameSite=Lax`;
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
    <div className="flex w-full min-h-screen overflow-hidden bg-white">

      {/* LEFT SIDE LOGIN */}
      <div className="flex items-center justify-center w-full p-10 md:w-1/2">
        <div className="w-full max-w-sm">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Obliq</h1>
          <h2 className="text-2xl font-semibold text-gray-800">Login</h2>
          <p className="mb-8 text-gray-500">Enter your details to continue</p>

          {/* Phone */}
          <div className="mb-5">
            <label className="block mb-2 font-medium text-gray-700">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute text-gray-400 left-3 top-3" />
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handlePhoneChange}
                onKeyPress={handleKeyPress}
                placeholder="01XXXXXXXXX"
                maxLength={11}
                disabled={isLoading}
                className="w-full py-3 pl-12 pr-4 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            {errors.phone_number && (
              <p className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" /> {errors.phone_number}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block mb-2 font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute text-gray-400 left-3 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
                disabled={isLoading}
                className="w-full py-3 pl-12 pr-12 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <button
                type="button"
                className="absolute text-gray-400 right-3 top-3 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {errors.password && (
              <p className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" /> {errors.password}
              </p>
            )}
          </div>

          {/* Login Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" /> Login
              </>
            )}
          </button>

          <p className="mt-4 text-sm text-gray-600">
            Don’t have an account?{" "}
            <span className="font-semibold text-orange-600 cursor-pointer">
              Sign up
            </span>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE ANIMATED PANEL */}
      <div className="relative items-center justify-center hidden w-1/2 overflow-hidden md:flex">

        {/* Background Gradient */}
        <img
          src="/grad.png"
          className="absolute inset-0 object-cover h-[90%] w-[80%] opacity-70 top-1/2 left-2/4 -translate-x-1/2 -translate-y-1/2 border-4 border-white rounded-3xl shadow-lg"
        />

        {/* Sliding Image */}
        <img
          src="/side.png"
          className={`absolute w-[85%] left-3/5 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] 
            ${animate ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"}`}
        />
      </div>
    </div>
  );
};

export default Login;
