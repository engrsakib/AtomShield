


"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { ENV } from "@/config/env";

const ROLES = ["founder", "super_admin", "admin", "moderator"];

const Register: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    password: "",
    bio: "",
    role: "",
    image: ""
  });

  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name) newErrors.name = "Name is required";

    if (!formData.phone_number) newErrors.phone_number = "Phone number is required";
    else if (formData.phone_number.length < 8) newErrors.phone_number = "Invalid phone number";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!formData.role) newErrors.role = "Please select a role";

    if (!formData.image) newErrors.image = "Image upload required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImageToCloudinary = async (file: File) => {
    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    return result.secure_url;
  };

  const handleImageChange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await uploadImageToCloudinary(file);

    setFormData((prev) => ({ ...prev, image: url }));
  };


  const handleSubmit = async () => {
    if (!validateForm()) return;

    
    
    const payload = {
      name: formData.name,
      phone_number: formData.phone_number,
      password: formData.password,
      bio: formData.bio,
      role: formData.role,
      image: formData.image,
    };

    try {
     
      const res = await fetch(`${ENV.BASE_URL}/admin/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Register Response:", data);

      if (data.success) {
        alert("Admin created successfully!");
        router.push("/dashboard/login");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      alert("Failed to create admin. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-green-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        
        <h2 className="text-2xl font-bold text-center mb-6">Create Admin Account</h2>

        {/* Name */}
        <InputField
          icon={<User />}
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={errors.name}
        />

        {/* Phone Number */}
        <InputField
          icon={<Phone />}
          label="Phone Number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleInputChange}
          error={errors.phone_number}
        />

        {/* Bio */}
        <div className="mt-4">
          <label className="text-sm font-semibold">Bio (optional)</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="w-full border rounded-xl p-3 mt-1"
            placeholder="Short bio..."
          />
        </div>

        {/* Role Select */}
        <div className="mt-4">
          <label className="text-sm font-semibold">Select Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full border rounded-xl p-3 mt-1"
          >
            <option value="">Choose Role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r.toUpperCase()}</option>
            ))}
          </select>
          {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
        </div>

        {/* Password */}
        <PasswordField
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
        />

        {/* Image Upload */}
        <div className="mt-4">
          <label className="text-sm font-semibold">Profile Image</label>
          <input type="file" onChange={handleImageChange} className="mt-2" />
          {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
          {formData.image && (
            <img src={formData.image} alt="preview" className="mt-3 w-24 h-24 rounded-lg object-cover" />
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white py-3 mt-6 rounded-xl font-semibold hover:bg-green-700 transition"
        >
          Create Admin
        </button>
      </div>
    </div>
  );
};

export default Register;

/* ——————————— Helper Components ——————————— */

const InputField = ({ icon, label, name, value, onChange, error }: any) => (
  <div className="mt-4">
    <label className="text-sm font-semibold">{label}</label>
    <div className="relative mt-1">
      <span className="absolute left-3 top-3 text-gray-400">{icon}</span>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded-xl pl-10 p-3"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

const PasswordField = ({ showPassword, setShowPassword, value, onChange, error }: any) => (
  <div className="mt-4">
    <label className="text-sm font-semibold">Password</label>
    <div className="relative mt-1">
      <span className="absolute left-3 top-3 text-gray-400">
        <Lock />
      </span>
      <input
        type={showPassword ? "text" : "password"}
        name="password"
        value={value}
        onChange={onChange}
        className="w-full border rounded-xl pl-10 p-3 pr-10"
      />
      <button
        type="button"
        className="absolute right-3 top-2 text-gray-500"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff /> : <Eye />}
      </button>
    </div>
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);





















