"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Tag,
  Type,
  Image as ImageIcon,
  Upload,
  Loader2,
  Link as LinkIcon,
  ArrowLeft,
} from "lucide-react";
import Swal from "sweetalert2";
import { useParams, useRouter } from "next/navigation";
import { ENV } from "@/config/env";
import getCookie from "@/util/GetCookie";
import ReusableQuillEditor from "@/editor/ReactQuilEditor";

type StudyPlanDetails = {
  _id: string;
  id: string;
  study_plan_number: number;
  title: string;
  description: string;
  status: "active" | "inactive" | "admin_approval";
  thumbnail_url: string;
  study_plan_url: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

type StudyPlanDetailsResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: StudyPlanDetails;
};

const categoryOptions = [
  "general",
  "technical",
  "exam",
  "bcs_preparation",
  "primary_teacher_preparation",
  "teacher_nibondhon_preparation",
];

const statusOptions = ["inactive", "active", "admin_approval"];

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

const inputClassName =
  "w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition";

const labelClassName =
  "flex items-center gap-2 text-sm font-semibold text-gray-700";

export default function EditStudyPlanPage() {
  const router = useRouter();
  const params = useParams();
  const studyPlanNumber = params?.studyPlanNumber as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "inactive",
    thumbnail_url: "",
    study_plan_url: "",
    category: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchStudyPlanDetails = async () => {
    try {
      setLoading(true);

      const token = getCookie("access_token");

      const res = await fetch(
        `${ENV.BASE_URL}/study-plan/${studyPlanNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token || "",
          },
        }
      );

      const result: StudyPlanDetailsResponse = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "Failed to fetch study plan");
      }

      setFormData({
        title: result.data.title || "",
        description: result.data.description || "",
        status: result.data.status || "inactive",
        thumbnail_url: result.data.thumbnail_url || "",
        study_plan_url: result.data.study_plan_url || "",
        category: result.data.category || "",
      });
    } catch (error: any) {
      Swal.fire("Error", error?.message || "Failed to load study plan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studyPlanNumber) {
      fetchStudyPlanDetails();
    }
  }, [studyPlanNumber]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formDataUpload,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        setFormData((prev) => ({
          ...prev,
          thumbnail_url: data.secure_url,
        }));

        Swal.fire({
          icon: "success",
          title: "Image Uploaded",
          text: "Thumbnail uploaded successfully",
          confirmButtonColor: "#0f766e",
        });
      } else {
        throw new Error("Cloudinary did not return image URL");
      }
    } catch (error: any) {
      Swal.fire("Error", error?.message || "Image upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.title.trim()) {
      return Swal.fire("Missing Title", "Please enter title", "warning");
    }

    if (!formData.category.trim()) {
      return Swal.fire("Missing Category", "Please select category", "warning");
    }

    if (!formData.thumbnail_url.trim()) {
      return Swal.fire("Missing Thumbnail", "Please upload thumbnail image", "warning");
    }

    if (!formData.study_plan_url.trim()) {
      return Swal.fire("Missing Study Plan URL", "Please enter study plan URL", "warning");
    }

    if (!formData.description.trim()) {
      return Swal.fire("Missing Description", "Please write description", "warning");
    }

    const confirm = await Swal.fire({
      title: "Update Study Plan?",
      text: "Do you want to save these changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f766e",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, Update",
    });

    if (!confirm.isConfirmed) return;

    try {
      setSubmitting(true);

      const token = getCookie("access_token");

      const payload = {
        title: formData.title,
        description: formData.description,
        thumbnail_url: formData.thumbnail_url,
        study_plan_url: formData.study_plan_url,
        category: formData.category,
      };

      const res = await fetch(
        `${ENV.BASE_URL}/study-plan/${studyPlanNumber}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token || "",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "Failed to update study plan");
      }

      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        text: result?.message || "Study plan updated successfully",
        confirmButtonColor: "#0f766e",
      });

      router.push(`/dashboard/sturdy-plan/view-plan`);
    } catch (error: any) {
      Swal.fire("Error", error?.message || "Update failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-lg text-teal-700">
          <Loader2 className="animate-spin" size={22} />
          <span className="font-semibold">Loading study plan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-white/20">
              <FileText className="w-8 h-8 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">Edit Study Plan</h1>
              <p className="text-teal-100">
                Update and manage study plan information
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-b-2xl shadow-xl space-y-6">
          <div>
            <label className={labelClassName}>
              <Type className="text-teal-600" size={18} />
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter study plan title"
              className={inputClassName}
            />
          </div>

          <div>
            <label className={labelClassName}>
              <Tag className="text-teal-600" size={18} />
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={inputClassName}
            >
              <option value="">Select category</option>
              {categoryOptions.map((item) => (
                <option key={item} value={item}>
                  {item.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

    

          <div>
            <label className={labelClassName}>
              <ImageIcon className="text-teal-600" size={18} />
              Thumbnail Image
            </label>

            <div className="mt-2 flex items-center gap-4 flex-wrap">
              <label className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition">
                <Upload size={18} />
                Upload Image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {uploading && (
                <span className="flex items-center gap-2 text-teal-600 font-medium">
                  <Loader2 className="animate-spin" size={18} />
                  Uploading...
                </span>
              )}
            </div>

            {formData.thumbnail_url && (
              <div className="mt-4">
                <img
                  src={formData.thumbnail_url}
                  alt="Thumbnail Preview"
                  className="w-56 h-36 object-cover rounded-xl shadow-md border"
                />
              </div>
            )}
          </div>

          <div>
            <label className={labelClassName}>
              <LinkIcon className="text-teal-600" size={18} />
              Study Plan URL
            </label>
            <input
              type="text"
              name="study_plan_url"
              value={formData.study_plan_url}
              onChange={handleChange}
              placeholder="Enter study plan URL"
              className={inputClassName}
            />
          </div>

          <div>
            <label className={labelClassName}>
              <FileText className="text-teal-600" size={18} />
              Description
            </label>

            <div className="mt-2">
              <ReusableQuillEditor
                value={formData.description}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: value,
                  }))
                }
                placeholder="Write study plan description..."
                height={280}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={submitting}
            className={`w-full py-3 rounded-xl font-semibold text-white transition ${
              submitting
                ? "bg-teal-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Updating...
              </span>
            ) : (
              "Update Study Plan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}