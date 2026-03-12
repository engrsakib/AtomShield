"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Tag,
  AlignLeft,
  Type,
  Bold,
  Italic,
  Underline,
  Upload,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import { ENV } from "@/config/env";
import getCookie from "@/util/GetCookie";

import dynamic from "next/dynamic";

const QuillEditor = dynamic(() => import("@/editor/QuilEditor"), {
  ssr: false,
});

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export default function UpdateGuideline() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // FORM DATA
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    status: "",
    description: "",
    thumbnail_url: "",
  });

  // -----------------------------------
  // FETCH SINGLE DATA AND PREFILL FORM
  // -----------------------------------
  const fetchData = async () => {
    try {
      const res = await fetch(`${ENV.BASE_URL}/guideline/${id}`, {
        headers: { Authorization: getCookie("access_token") || "" },
      });

      const json = await res.json();

      if (res.ok) {
        setFormData({
          title: json.data.title,
          category: json.data.category,
          status: json.data.status,
          description: json.data.description,
          thumbnail_url: json.data.thumbnail_url,
        });
      } else {
        Swal.fire("Error", json.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to load guideline", "error");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // -----------------------------------
  // IMAGE UPLOADER (CLOUDINARY)
  // -----------------------------------
  const handleImageUpload = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: fd },
      );

      const data = await res.json();

      if (data.secure_url) {
        setFormData((prev) => ({
          ...prev,
          thumbnail_url: data.secure_url,
        }));

        Swal.fire("Success", "Thumbnail uploaded!", "success");
      } else {
        Swal.fire("Upload Failed", "Invalid Cloudinary response", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Upload failed", "error");
    }

    setUploading(false);
  };

  // -----------------------------------
  // UPDATE SUBMIT
  // -----------------------------------
  const handleUpdate = async () => {
    if (!formData.title.trim()) {
      return Swal.fire("Missing Title", "Enter guideline title", "warning");
    }
    if (!formData.category) {
      return Swal.fire("Missing Category", "Select category", "warning");
    }
    if (!formData.description.trim()) {
      return Swal.fire("Missing Description", "Write description", "warning");
    }

    setUpdating(true);

    try {
      const res = await fetch(`${ENV.BASE_URL}/guideline/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: getCookie("access_token") || "",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Success", "Guideline updated!", "success");
        router.push(`/dashboard/guideline/view-guideline`);
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Update failed", "error");
    }

    setUpdating(false);
  };

  // LOADING UI -----------------------------
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600 text-lg">
        Loading guideline...
      </div>
    );
  }

  // --------------------------------------------
  // MAIN UI
  // --------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 rounded-t-2xl mb-6">
          <h1 className="text-3xl font-bold text-white">Update Guideline</h1>
          <p className="text-teal-100">Modify the selected guideline</p>
        </div>

        <div className="bg-white p-8 rounded-b-2xl shadow-xl space-y-6">
          {/* TITLE */}
          <div>
            <label className="flex gap-2 text-gray-700 font-semibold">
              <Type className="text-teal-600" /> Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full mt-2 px-4 py-3 border rounded-xl"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="flex gap-2 text-gray-700 font-semibold">
              <Tag className="text-teal-600" /> Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full mt-2 px-4 py-3 border rounded-xl"
            >
              <option value="">Select category</option>
              <option value="general">General</option>
              <option value="technical">Technical</option>
              <option value="exam">Exam</option>
              <option value="bcs_preparation">BCS Preparation</option>
              <option value="primary_teacher_preparation">
                Primary Teacher
              </option>
              <option value="teacher_nibondhon_preparation">
                Teacher Nibondhon
              </option>
            </select>
          </div>

          <div>
            <label className="flex gap-2 text-gray-700 font-semibold">
              <FileText className="text-teal-600" /> Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full mt-2 px-4 py-3 border rounded-xl"
            >
              <option value="active">Published</option>
              <option value="inactive">Unpublished</option>
            </select>
          </div>

          {/* THUMBNAIL */}
          <div>
            <label className="flex gap-2 text-gray-700 font-semibold">
              <ImageIcon className="text-teal-600" /> Thumbnail Image
            </label>

            <div className="mt-2 flex items-center gap-4">
              <label className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2">
                <Upload size={18} /> Upload New
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {uploading && (
                <span className="text-teal-600 font-medium flex items-center gap-2">
                  <Loader2 className="animate-spin" /> Uploading...
                </span>
              )}
            </div>

            {formData.thumbnail_url && (
              <div className="mt-4">
                <img
                  src={formData.thumbnail_url}
                  className="w-48 h-32 object-cover rounded-xl shadow-md border"
                />
              </div>
            )}
          </div>

          {/* DESCRIPTION */}

          {/* DESCRIPTION */}
          <div>
            <label className="flex gap-2 text-gray-700 font-semibold">
              <AlignLeft className="text-teal-600" /> Description
            </label>

            <div className="mt-2">
              <QuillEditor
                value={formData.description}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, description: html }))
                }
              />
            </div>
          </div>

          <button
            onClick={handleUpdate}
            disabled={updating}
            className={`w-full py-3 rounded-xl text-white font-semibold
              ${updating ? "bg-teal-400" : "bg-teal-600 hover:bg-teal-700"}
            `}
          >
            {updating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" /> Updating...
              </span>
            ) : (
              "Update Guideline"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
