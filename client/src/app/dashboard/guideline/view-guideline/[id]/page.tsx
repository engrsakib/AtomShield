"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Tag,
  Calendar,
  CheckCircle,
  Eye,
} from "lucide-react";
import Swal from "sweetalert2";
import { ENV } from "@/config/env";
import getCookie from "@/util/GetCookie";

// FORMATTERS ----------------------
const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function ViewGuideline() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // FETCH SINGLE GUIDELINE ------------------------
  const fetchData = async () => {
    try {
      const res = await fetch(`${ENV.BASE_URL}/guideline/${id}`, {
        headers: {
          Authorization: getCookie("access_token") || "",
        },
      });

      const json = await res.json();

      if (res.ok) {
        setData(json.data);
      } else {
        Swal.fire("Error", json.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to load data", "error");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-lg text-gray-600">
        Loading guideline...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 text-center text-lg text-red-600">
        Guideline not found!
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">

      {/* BACK BUTTON */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-teal-700 font-semibold mb-4"
      >
        <ArrowLeft /> Back
      </button>

      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 rounded-2xl shadow-lg text-white mb-6">
        <h1 className="text-3xl font-bold">{data.title}</h1>
        <p className="text-teal-100">Guideline #{data.guideline_number}</p>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">

        {/* THUMBNAIL */}
        <div className="flex justify-center">
          <img
            src={data.thumbnail_url}
            alt="Thumbnail"
            className="w-72 h-48 object-cover rounded-xl shadow-md border"
          />
        </div>

        {/* CATEGORY + STATUS */}
        <div className="flex flex-wrap gap-4 justify-center">

          {/* Category Badge */}
          <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm">
            {data.category.replace(/_/g, " ").toUpperCase()}
          </span>

          {/* Status Badge */}
          <span
            className={`px-4 py-2 rounded-full font-semibold text-sm ${
              data.status === "active"
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {data.status === "active" ? "PUBLISHED" : "UNPUBLISHED"}
          </span>

        </div>

        {/* DESCRIPTION */}
        <div>
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <FileText className="text-teal-600" /> Description
          </h2>
          <p className="text-gray-700 leading-relaxed">{data.description}</p>
        </div>

  

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-4 pt-4">

          {/* EDIT BUTTON */}
          <button
            onClick={() =>
              router.push(`/dashboard/guideline/edit/${data.guideline_number}`)
            }
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-md"
          >
            Edit Guideline
          </button>
        </div>
      </div>
    </div>
  );
}
