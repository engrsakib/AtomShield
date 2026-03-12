



"use client";

import { ENV } from "@/config/env";
import getCookie from "@/util/GetCookie";
import { ChevronLeft, ChevronRight, ToggleRight } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import Swal from "sweetalert2";

// -----------------------------------------------------
// Toggle Component
// -----------------------------------------------------
const Toggle = ({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) => (
  <div
    onClick={() => onChange(!enabled)}
    className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition ${
      enabled ? "bg-green-500" : "bg-gray-300"
    }`}
  >
    <div
      className={`bg-white w-6 h-6 rounded-full shadow transform transition ${
        enabled ? "translate-x-7" : ""
      }`}
    />
  </div>
);

export default function ExamListPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // console.log("SearchTerm",searchTerm)

  const limit = 10;

  // Modal States
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // -----------------------------------------------------
  // Fetch Exams
  // -----------------------------------------------------
  useEffect(() => {
    fetchExams(1, "");
  }, []);

  const fetchExams = async (currentPage: number, search: string) => {
    setLoading(true);

    try {
      const url = `${ENV.BASE_URL}/exam?page=${currentPage}&limit=${limit}&searchTerm=${search}`;
      const response = await fetch(url, {
        headers: { Authorization: getCookie("access_token") || "" },
      });

      const result = await response.json();

      if (result.success) {
        setExams(result.data.data);
        setTotalPages(result.data.meta.totalPage);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
    }

    setLoading(false);
  };

  // SEARCH
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(1);
    fetchExams(1, value);
  };

  // PAGINATION
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchExams(newPage, searchTerm);
  };

  // DELETE
  const handleDelete = async (examNumber: string) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This exam will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await fetch(`${ENV.BASE_URL}/exam/${examNumber}`, {
        method: "DELETE",
        headers: { Authorization: getCookie("access_token") || "" },
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchExams(page, searchTerm);
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Delete failed" });
    }
  };

  // OPEN MODAL
  const openStatusModal = (exam: any) => {
    setSelectedExam(exam);
    setShowModal(true);
  };

  // UPDATE STATUS API
  const updateStatus = async () => {
    if (!selectedExam) return;

    const payload = {
      is_published: selectedExam.is_published,
      is_started: selectedExam.is_started,
      is_completed: selectedExam.is_completed,
    };

    try {
      const response = await fetch(
        `${ENV.BASE_URL}/exam/${selectedExam.exam_number}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: getCookie("access_token") || "",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Status Updated!",
          timer: 1500,
          showConfirmButton: false,
        });

        setShowModal(false);
        fetchExams(page, searchTerm);
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Update Failed!" });
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-full mx-auto">
        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Exam Management
              </h1>
              <p className="text-gray-600">Manage all your exams</p>
            </div>

            <Link href={"/dashboard/exam/create-exam"}>
              <button className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700">
                <FaPlus /> Create Exam
              </button>
            </Link>
          </div>

          {/* SEARCH */}
          <div className="mt-6 relative">
            <input
              type="text"
              placeholder="Search exams..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {!loading ? (
            <>
              <table className="w-full">
                <thead className="bg-green-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Exam Number</th>
                    <th className="px-6 py-4 text-left">Exam Name</th>
                    <th className="px-6 py-4 text-left">Date & Time</th>
                    <th className="px-6 py-4 text-left">Duration</th>
                    <th className="px-6 py-4 text-left">Marks</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{exam.exam_number}</td>
                      <td className="px-6 py-4 font-semibold">
                        {exam.exam_name}
                      </td>
                      <td className="px-6 py-4">
                        {formatDate(exam.exam_date_time)}
                      </td>
                      <td className="px-6 py-4">
                        {exam.duration_minutes} min
                      </td>
                      <td className="px-6 py-4">{exam.total_marks}</td>

                      {/* Status Logic */}
                      <td className="px-6 py-4">
                        {exam.is_completed ? (
                          <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                            Completed
                          </span>
                        ) : exam.is_started ? (
                          <span className="px-3 py-1 bg-yellow-500 text-white text-xs rounded-full">
                            Started
                          </span>
                        ) : exam.is_published ? (
                          <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                            Published
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                            Draft
                          </span>
                        )}
                      </td>

                      {/* ACTION BUTTONS */}
                      <td className="px-6 py-4 text-center flex gap-3 justify-center">
                        <button
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                          onClick={() =>
                            (window.location.href = `/dashboard/exam/details?exam=${exam.exam_number}`)
                          }
                        >
                          <FaEye />
                        </button>

                        <button
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                          onClick={() =>
                            (window.location.href = `/dashboard/exam/edit?exam=${exam.exam_number}`)
                          }
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          onClick={() => handleDelete(exam.exam_number)}
                        >
                          <FaTrash />
                        </button>

                        <button
                          onClick={() => openStatusModal(exam)}
                          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          <ToggleRight />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="flex justify-between p-4 bg-gray-50 border-t">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-7 text-white  bg-green-600 py-2 border rounded disabled:opacity-50"
                >
                         <ChevronLeft />
                </button>

                <span className="text-gray-700">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-7 bg-green-600 text-white py-2  border rounded disabled:opacity-50"
                >
                      <ChevronRight />
                </button>
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin border-b-2 border-green-600 h-10 w-10 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedExam && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Update Exam Status
            </h2>

            <div className="space-y-6">
              {/* FIXED INDEPENDENT TOGGLE LOGIC */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Published</span>
                <Toggle
                  enabled={selectedExam.is_published}
                  onChange={(v) =>
                    setSelectedExam({ ...selectedExam, is_published: v })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Started</span>
                <Toggle
                  enabled={selectedExam.is_started}
                  onChange={(v) =>
                    setSelectedExam({ ...selectedExam, is_started: v })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Completed</span>
                <Toggle
                  enabled={selectedExam.is_completed}
                  onChange={(v) =>
                    setSelectedExam({ ...selectedExam, is_completed: v })
                  }
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={updateStatus}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
