




"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  FileText,
  Tag,
  AlignLeft,
  Type,

  Image as ImageIcon,

} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import getCookie from "@/util/GetCookie";

import dynamic from "next/dynamic";

const QuillEditor = dynamic(() => import("@/editor/QuilEditor"), {
  ssr: false,
});


const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/books`;

export default function UpdateBookTemplate() {
  const { id } = useParams();
  const router = useRouter();
 
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    thumbnail_url: "",
    buy_url: "",
    sold_platform: "",
    price: "",
    is_published: true,
    description: "",
  });

  // ===========================
  // FETCH EXISTING BOOK DATA
  // ===========================
  const fetchBookDetails = async () => {
    try {
      const res = await fetch(`${BASE_URL}/${id}`);
      const data = await res.json();
      const book = data?.data;

      setFormData({
        title: book?.title,
        thumbnail_url: book?.thumbnail_url,
        buy_url: book?.buy_url,
        sold_platform: book?.sold_platform,        // 🔥 enum exact value
        price: book?.price,
        is_published: book?.is_published,
        description: book?.description,
      });


    } catch (err) {
      console.log("❌ Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBookDetails();
  }, [id]);


  // ===========================
  // UPDATE BOOK API CALL
  // ===========================
  const handleUpdate = async () => {
    Swal.fire({
      title: "Updating Book...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const token = getCookie("access_token");

      const payload = {
        title: formData.title,
        thumbnail_url: formData.thumbnail_url,    // must be hosted URL
        buy_url: formData.buy_url,
        sold_platform: formData.sold_platform,    // 🔥 correct enum
        price: Number(formData.price),
        is_published: Boolean(formData.is_published),
        description: formData.description,
      };

      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      Swal.close();

      if (!res.ok) {
        return Swal.fire("Error", result?.message || "Failed to update!", "error");
      }

      Swal.fire("Success!", "Book updated successfully!", "success").then(() =>
        router.push("/dashboard/my-book/view-book")
      );
    } catch (error) {
      Swal.close();
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

 if (loading)
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-12 h-12 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-green-600">
        Loading...
      </p>
    </div>
  );


  // ===========================
  // FULL UI TEMPLATE
  // ===========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 rounded-t-2xl shadow-lg">
          <h1 className="text-white text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8" /> Update Book
          </h1>
        </div>

        {/* BODY */}
        <div className="bg-white p-6 rounded-b-2xl shadow-xl space-y-6">

          {/* TITLE */}
          <div>
            <label className="font-semibold text-gray-700 flex gap-2">
              <Type className="w-5 h-5 text-teal-600" /> Book Title
            </label>
            <input
              className="w-full px-4 py-3 border rounded-xl mt-2"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* THUMBNAIL URL */}
          <div>
            <label className="font-semibold text-gray-700 flex gap-2">
              <ImageIcon className="w-5 h-5 text-teal-600" /> Thumbnail Upload (URL Only)
            </label>

            <input
              className="w-full px-4 py-3 border rounded-xl mt-2"
              placeholder="https://image-url.com"
              value={formData.thumbnail_url}
              onChange={(e) =>
                setFormData({ ...formData, thumbnail_url: e.target.value })
              }
            />

            {/* PREVIEW */}
            <div className="w-40 h-28 bg-gray-200 mt-3 rounded-xl shadow overflow-hidden">
              {formData.thumbnail_url ? (
                <img src={formData.thumbnail_url} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No Image
                </div>
              )}
            </div>
          </div>

          {/* SOLD PLATFORM */}
          <div>
            <label className="font-semibold text-gray-700 flex gap-2">
              <Tag className="w-5 h-5 text-teal-600" /> Sold Platform
            </label>

            <select
              className="w-full px-4 py-3 border rounded-xl mt-2"
              value={formData.sold_platform}
              onChange={(e) =>
                setFormData({ ...formData, sold_platform: e.target.value })
              }
            >
              <option value="">Select Platform</option>
              <option value="rokomari">Rokomari</option>
              <option value="wafi_life">Wafi Life</option>
              <option value="others">Others</option>
            </select>
          </div>

          {/* BUY URL */}
          <div>
            <label className="font-semibold text-gray-700">Buy URL</label>
            <input
              className="w-full px-4 py-3 border rounded-xl mt-2"
              value={formData.buy_url}
              onChange={(e) => setFormData({ ...formData, buy_url: e.target.value })}
            />
          </div>

          {/* PRICE */}
          <div>
            <label className="font-semibold text-gray-700">Price (৳)</label>
            <input
              type="number"
              className="w-full px-4 py-3 border rounded-xl mt-2"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="font-semibold text-gray-700">Status</label>
            <select
              className="w-full px-4 py-3 border rounded-xl mt-2"
              value={formData.is_published ? "published" : "unpublished"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_published: e.target.value === "published",
                })
              }
            >
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>



          {/* DESCRIPTION */}
<div>
  <label className="font-semibold text-gray-700 flex gap-2 mb-2">
    <AlignLeft className="w-5 h-5 text-teal-600" /> Description
  </label>

  <QuillEditor
    value={formData.description}
    onChange={(html) =>
      setFormData((prev) => ({ ...prev, description: html }))
    }
  />
</div>


    

          {/* SUBMIT */}
          <button
            className="w-full py-3 bg-teal-600 text-white rounded-xl mt-4 shadow hover:bg-teal-700 transition"
            onClick={handleUpdate}
          >
            Update Book
          </button>

        </div>
      </div>
    </div>
  );
}
