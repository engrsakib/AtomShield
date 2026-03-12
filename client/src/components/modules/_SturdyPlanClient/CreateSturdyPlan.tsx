"use client";

import React from "react";
import {
  FileText,
  Tag,
  AlignLeft,
  Type,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import dynamic from "next/dynamic";

const QuillEditor = dynamic(() => import("@/editor/QuilEditor"), {
  ssr: false,
});

const categoryOptions = [
  "general",
  "technical",
  "exam",
  "bcs_preparation",
  "primary_teacher_preparation",
  "teacher_nibondhon_preparation",
];

const statusOptions = ["inactive", "active", "admin_approval"];

const GuidelineFormTemplate = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-white/20">
              <FileText className="w-8 h-8 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">Create Guideline</h1>
              <p className="text-teal-100">MCQ Application Guidelines Setup</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white p-8 rounded-b-2xl shadow-xl space-y-6">
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold">
              <Type className="text-teal-600" size={18} />
              Title
            </label>

            <input
              type="text"
              placeholder="Enter guideline title"
              className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold">
              <Tag className="text-teal-600" size={18} />
              Category
            </label>

            <select className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Select category</option>
              {categoryOptions.map((item) => (
                <option key={item} value={item}>
                  {item.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold">
              <FileText className="text-teal-600" size={18} />
              Status
            </label>

            <select className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500">
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {item.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold">
              <ImageIcon className="text-teal-600" size={18} />
              Thumbnail Image
            </label>

            <div className="mt-2 flex items-center gap-4">
              <label className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition">
                <Upload size={18} />
                Upload Image
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>

            <div className="mt-4">
              <div className="w-48 h-32 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-sm text-gray-400">
                Image Preview
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold">
              <AlignLeft className="text-teal-600" size={18} />
              Description
            </label>

            <div className="mt-2">
              <QuillEditor value="" onChange={() => {}} />
            </div>
          </div>

          {/* Button */}
          <button className="w-full py-3 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 transition">
            Create Guideline
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidelineFormTemplate;