"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Phone, Lock, Eye, EyeOff, LogIn, AlertCircle, Key, X, UserCheck } from "lucide-react";
import Swal from "sweetalert2";
import { ENV } from "@/config/env";

const Login: React.FC = () => {
  const router = useRouter();
  const [redirectUrl, setRedirectUrl] = useState("/dashboard");
  const [animate, setAnimate] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const r = params.get("redirect");
      if (r) setRedirectUrl(r);
      setTimeout(() => setAnimate(true), 100);
    }
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ phone_number: "", password: "" });
  const [errors, setErrors] = useState<{ phone_number?: string; password?: string }>({});

  const credentials = [
    { role: "Admin", phone: "01992547202", pass: "1qazxsw2", color: "bg-red-50 text-red-700 border-red-100" },
    { role: "Manager", phone: "01111111111", pass: "123456", color: "bg-blue-50 text-blue-700 border-blue-100" },
    { role: "Agent", phone: "01222222222", pass: "123456", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { role: "Customer", phone: "01333333333", pass: "123456", color: "bg-purple-50 text-purple-700 border-purple-100" },
  ];

  const fillCredentials = (phone: string, pass: string) => {
    setFormData({ phone_number: phone, password: pass });
    setErrors({});
    setShowCredentialModal(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, phone_number: value }));
    if (errors.phone_number) setErrors((prev) => ({ ...prev, phone_number: undefined }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors: { phone_number?: string; password?: string } = {};
    if (!formData.phone_number) newErrors.phone_number = "Phone number is required";
    else if (formData.phone_number.length < 10) newErrors.phone_number = "Invalid phone number";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Minimum 6 characters";
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
        document.cookie = `access_token=${result.data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        Swal.fire({ title: "Success!", text: "Login successful!", icon: "success", timer: 1500, showConfirmButton: false });
        setTimeout(() => { router.push(redirectUrl); router.refresh(); }, 1500);
      } else {
        Swal.fire({ title: "Failed", text: result.message || "Login failed", icon: "error" });
      }
    } catch (error) {
      Swal.fire({ title: "Error", text: "Unable to connect to server!", icon: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex w-full min-h-screen overflow-hidden bg-white">
      
      {/* Credential Trigger Button */}
      <button 
        onClick={() => setShowCredentialModal(true)}
        className="absolute z-20 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-gray-900 rounded-full shadow-lg top-6 left-6 hover:bg-gray-800 active:scale-95"
      >
        <Key size={16} /> View Credentials
      </button>

      {/* LEFT SIDE: LOGIN FORM */}
      <div className="flex flex-col items-center justify-center w-full p-6 md:p-16 lg:p-24 md:w-1/2">
        <div className="w-full max-w-[400px]">
          <div className="mb-10">
            <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-gray-900">Obliq</h1>
            <h2 className="text-2xl font-bold text-gray-900">Login</h2>
            <p className="mt-1 text-gray-500">Enter your details to continue</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute w-5 h-5 text-gray-400 transition-colors -translate-y-1/2 left-4 top-1/2 group-focus-within:text-orange-600" />
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handlePhoneChange}
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  disabled={isLoading}
                  className="w-full py-3.5 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all outline-none"
                />
              </div>
              {errors.phone_number && (
                <p className="flex items-center gap-1 mt-1.5 text-xs font-medium text-red-500">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.phone_number}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Password</label>
              <div className="relative group">
                <Lock className="absolute w-5 h-5 text-gray-400 transition-colors -translate-y-1/2 left-4 top-1/2 group-focus-within:text-orange-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full py-3.5 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 -translate-y-1/2 right-4 top-1/2 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 mt-1.5 text-xs font-medium text-red-500">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.password}
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-[#F26522] hover:bg-[#D44D10] text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" /> : <>Login <LogIn size={20} /></>}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: ANIMATED PANEL */}
      <div className="relative items-center justify-center hidden w-1/2 overflow-hidden md:flex">
        <img src="/grad.png" alt="background" className="absolute inset-0 object-cover w-full h-full opacity-60" />
        <div className={`relative z-10 w-[85%] transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] 
          ${animate ? "translate-x-0 opacity-100" : "translate-x-[50%] opacity-0"}`}>
          <img src="/side.png" alt="Dashboard Preview" className="w-full h-auto border-4 border-white drop-shadow-2xl rounded-2xl" />
        </div>
      </div>

      {/* CREDENTIALS MODAL */}
      {showCredentialModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden duration-200 bg-white shadow-2xl rounded-3xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <UserCheck className="text-orange-600" /> Demo Accounts
              </h3>
              <button onClick={() => setShowCredentialModal(false)} className="p-2 transition-colors rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 p-6">
              {credentials.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => fillCredentials(item.phone, item.pass)}
                  className={`flex flex-col items-start p-4 border rounded-2xl transition-all hover:shadow-md hover:scale-[1.02] active:scale-95 ${item.color}`}
                >
                  <span className="text-lg font-bold">{item.role}</span>
                  <span className="text-sm opacity-80">Phone: {item.phone}</span>
                  <span className="text-sm opacity-80">Pass: {item.pass}</span>
                </button>
              ))}
            </div>
            <div className="p-4 text-center bg-gray-50">
              <p className="text-xs italic text-gray-500">Click any role to auto-fill the login form</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;