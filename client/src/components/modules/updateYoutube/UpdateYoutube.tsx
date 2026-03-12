

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import {
  AlignLeft,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Type,
  FileText,
  Upload,
  X,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import getCookie from "@/util/GetCookie";
import { ENV } from "@/config/env";

import dynamic from "next/dynamic";

const QuillEditor = dynamic(() => import("@/editor/QuilEditor"), {
  ssr: false,
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export default function UpdateYouTube() {
  const params = useSearchParams();
  const router = useRouter();
  const video_number = params.get("video");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    video_url: "",
    thumbnail_url: "",
    description: "",
    is_published: true,
  });

  // ==============================
  // LOAD VIDEO DETAILS
  // ==============================
  useEffect(() => {
    if (!video_number) return;

    fetch(`${BASE_URL}/youtube/${video_number}`, {
      headers: {
        authorization: getCookie("access_token") || "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          title: data.data.title,
          video_url: data.data.video_url,
          thumbnail_url: data.data.thumbnail_url,
          description: data.data.description,
          is_published: data.data.is_published,
        });

        setThumbnailPreview(data.data.thumbnail_url);

        setLoading(false);
      });
  }, [video_number]);

  // ==============================
  // INPUT HANDLER
  // ==============================
  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==============================
  // RICH TEXT EDITOR HEADER BUTTONS
  // ==============================

  // ==============================
  // THUMBNAIL UPLOAD
  // ==============================
  const handleThumbnailUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        },
      );

      const data = await res.json();

      setFormData((prev) => ({ ...prev, thumbnail_url: data.secure_url }));
      setThumbnailPreview(data.secure_url);
    } catch {
      Swal.fire("Error", "Thumbnail upload failed", "error");
    }

    setUploading(false);
  };

  const removeThumbnail = () => {
    setThumbnailPreview("");
    setFormData((prev) => ({ ...prev, thumbnail_url: "" }));
  };

  // ==============================
  // SUBMIT UPDATE
  // ==============================
  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const res = await fetch(`${ENV.BASE_URL}/youtube/${video_number}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: getCookie("access_token") || "",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      const isEmptyDescription =
        !formData.description ||
        formData.description === "<p><br></p>" ||
        formData.description.trim() === "";

      if (isEmptyDescription) {
        return Swal.fire(
          "Missing Description",
          "Please enter description",
          "warning",
        );
      }

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "YouTube video updated successfully",
        confirmButtonColor: "#0d9488",
      });

      router.push("/dashboard/youtube/view-video");
    } catch (err) {
      Swal.fire("Error", "Failed to update video", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-teal-600 text-xl">
        Loading video...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FileText className="w-8 h-8 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">
                Update YouTube Video
              </h1>
              <p className="text-teal-50 text-base mt-1">
                Modify video information
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="bg-white rounded-b-2xl shadow-xl p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="font-semibold flex items-center gap-2 mb-1">
              <Type className="w-5 h-5 text-teal-600" /> Title
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border px-4 py-3 rounded-xl"
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="font-semibold flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-teal-600" /> Video URL
            </label>
            <input
              name="video_url"
              value={formData.video_url}
              onChange={handleInputChange}
              className="w-full border px-4 py-3 rounded-xl"
            />
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="font-semibold flex items-center gap-2 mb-1">
              <Upload className="w-5 h-5 text-teal-600" /> Thumbnail
            </label>

            {!thumbnailPreview ? (
              <div>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleThumbnailUpload}
                  id="upload-thumb"
                />

                <label
                  htmlFor="upload-thumb"
                  className="border-2 border-dashed border-gray-300 w-full h-32 flex flex-col justify-center items-center rounded-xl cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-500" />
                      <span className="text-gray-600 text-sm mt-2">
                        Click to upload
                      </span>
                    </>
                  )}
                </label>
              </div>
            ) : (
              <div className="relative inline-block">
                <img
                  src={thumbnailPreview}
                  className="w-full max-w-md rounded-xl"
                />
                <button
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Description Editor */}

          {/* Description Editor */}
          <div>
            <label className="font-semibold flex items-center gap-2 mb-2">
              <AlignLeft className="w-5 h-5 text-teal-600" /> Description
            </label>

            <QuillEditor
              value={formData.description}
              onChange={(html) =>
                setFormData((prev) => ({ ...prev, description: html }))
              }
            />
          </div>

          {/* Publish */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  is_published: !prev.is_published,
                }))
              }
            />
            <span className="font-semibold">Published</span>
          </label>

          {/* BUTTONS */}
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold"
            >
              {submitting ? "Updating..." : "Update Video"}
            </button>

            <button
              onClick={() => router.back()}
              className="bg-gray-300 px-6 py-3 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
