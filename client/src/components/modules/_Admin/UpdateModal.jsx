




"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function UpdateAdminModal({ admin, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: admin?.name || "",
    designation: admin?.designation || "",
    phone_number: admin?.phone_number || "",
    role: admin?.role || "",
    bio: admin?.bio || "",
    image: admin?.image || "",
    password: "",
  });

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const cloudinary_preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudinary_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      Swal.fire("Error", "Please select a valid image (JPEG, PNG, WebP)", "error");
      return;
    }

    if (file.size > maxSize) {
      Swal.fire("Error", "Image size must be less than 5MB", "error");
      return;
    }

    setSelectedFile(file);
    setUploading(true);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", cloudinary_preset);
      data.append("cloud_name", cloudinary_name);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinary_name}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const uploaded = await res.json();
      setForm({ ...form, image: uploaded.secure_url });
      
      Swal.fire("Success", "Image uploaded successfully!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to upload image", "error");
    } finally {
      setUploading(false);
    }
  };

  // 📌 Remove Image
  const handleRemoveImage = () => {
    setForm({ ...form, image: "" });
    setSelectedFile(null);
  };

  // 📌 Update Staff API Call
  const handleUpdate = async () => {
    // Validation
    if (!form.name.trim() || !form.phone_number.trim() || !form.role) {
      Swal.fire("Error", "Please fill in all required fields", "error");
      return;
    }

    try {
      const accessToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];

        const BASE_URL =  process.env.NEXT_PUBLIC_BASE_URL;

      const res = await fetch(
        `${BASE_URL}/admin/update-staff/${admin._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
          },
          body: JSON.stringify(form),
        }
      );

      const json = await res.json();

      if (!json.success) {
        return Swal.fire("Error", json.message, "error");
      }

      Swal.fire("Updated!", "Admin info updated successfully", "success");
      onUpdated();
      onClose();
    } catch (error) {
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Update Admin Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Profile Image Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
            <div className="flex flex-col items-center justify-center space-y-4">
              {form.image ? (
                <div className="relative">
                  <img
                    src={form.image}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-green-100 shadow-sm"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}

              <div className="flex flex-col items-center">
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                    {uploading ? "Uploading..." : form.image ? "Change Photo" : "Upload Photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  JPEG, PNG, WebP (Max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="moderator">Moderator</option>
                <option value="content_manager">Content Manager</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter new password (optional)"
                type="password"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}