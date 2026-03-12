"use client";

import { ENV } from "@/config/env";
import getCookie from "@/util/GetCookie";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import { FaSearch, FaEye, FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface Exam {
  _id: string
  exam_name: string;
  exam_date_time: string;
  exam_number: number;
}

interface Result {
  student_name: string;
  student_phone: string;
  exam_number: number;
  score: number;
  totalQuestions: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  unanswered?: number;
}

export default function ViewAllResultsTemplate() {
  const [examSearch, setExamSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [selectedExamNumber, setSelectedExamNumber] = useState("");
  const [showExamDropdown, setShowExamDropdown] = useState(false);

  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);

  const [results, setResults] = useState<Result[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    totalResult: 0,
    totalPages: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAllExams = async () => {
      try {
        const response = await fetch(
          `${ENV.BASE_URL}/exam/exam-search?exam_name=`,
          {
            headers: {
              Authorization: getCookie("access_token") || "",
            },
          }
        );

        const json = await response.json();
        console.log("ALL EXAMS:", json);

        if (json.success && json.data) {
          setAllExams(json.data);
          setFilteredExams(json.data);
        }
      } catch (err) {
        console.error("Error loading all exams", err);
      }
    };

    loadAllExams();
  }, []);

  // FILTER exams when typing
  useEffect(() => {
    if (!examSearch.trim()) {
      setFilteredExams(allExams);
      return;
    }

    const filtered = allExams.filter((exam) =>
      exam.exam_name.toLowerCase().includes(examSearch.toLowerCase())
    );

    setFilteredExams(filtered);
  }, [examSearch, allExams]);

  const fetchResults = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");

      if (phoneSearch.trim()) params.append("phone", phoneSearch.trim());

      if (selectedExamNumber) {
        params.append("examNum", selectedExamNumber);
      }

      const url = `${ENV.BASE_URL}/results?${params.toString()}`;
      console.log("RESULTS API URL:", url);

      const response = await fetch(url, {
        headers: { Authorization: getCookie("access_token") || "" },
      });

      const json = await response.json();
      console.log("RESULTS API RESPONSE:", json);

      if (json.success) {
        setResults(json.data.data);
        setMeta(json.data.meta);
        setCurrentPage(page);

        if (json.data.data.length === 0) {
          setError("No results found.");
        }
      } else {
        setResults([]);
        setError(json.message || "Error fetching results");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to fetch results.");
    }

    setLoading(false);
  };

  // Handle selecting exam
  const handleExamSelect = (exam: any) => {
    setSelectedExamNumber(exam.exam_number.toString());
    setExamSearch(exam.exam_name);
    setShowExamDropdown(false);
  };

  // SEARCH BUTTON CLICK
  const handleSearch = () => {
    if (!selectedExamNumber && !phoneSearch.trim()) {
      setError("Please select an exam or enter phone number.");
      return;
    }
    fetchResults(1);
  };

  const formatDateTime = (t: any) =>
    new Date(t).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // CLOSE DROPDOWN
  useEffect(() => {
    const close = (e: any) => {
      if (!e.target.closest(".exam-search-container")) {
        setShowExamDropdown(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-full mx-auto">
        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
          <p className="text-gray-600">Search and view all student results</p>

          {/* FILTERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Exam Dropdown */}
            <div className="relative exam-search-container">
              <input
                type="text"
                placeholder="Search exam name..."
                value={examSearch}
                onFocus={() => setShowExamDropdown(true)}
                onChange={(e) => {
                  setExamSearch(e.target.value);
                  if (!e.target.value) setSelectedExamNumber("");
                }}
                className="w-full pl-10 pr-4 py-3 border rounded-lg"
              />
              <FaSearch className="absolute left-3 top-3.5 text-gray-400" />

              {showExamDropdown && filteredExams.length > 0 && (
                <div className="absolute bg-white shadow-xl border border-gray-200 rounded-xl w-full max-h-80 overflow-hidden z-20 mt-2">
                  <div className="overflow-y-auto max-h-80">
                    {filteredExams.map((exam, index) => (
                      <div
                        key={exam._id}
                        onClick={() => handleExamSelect(exam)}
                        className={`
            group relative p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 
            cursor-pointer transition-all duration-200
            ${
              index !== filteredExams.length - 1
                ? "border-b border-gray-100"
                : ""
            }
            hover:shadow-sm
          `}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Exam Name */}
                            <h3 className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors mb-2 truncate">
                              {exam.exam_name}
                            </h3>

                            {/* Date & Time */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1.5">
                              <svg
                                className="w-4 h-4 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="truncate">
                                {formatDateTime(exam.exam_date_time)}
                              </span>
                            </div>

                            {/* Exam Number */}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <svg
                                className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                                />
                              </svg>
                              <span className="font-mono truncate">
                                Exam #: {exam.exam_number}
                              </span>
                            </div>
                          </div>

                          {/* Arrow Icon */}
                          <svg
                            className="w-5 h-5 text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Phone Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by phone..."
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg"
              />
              <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            </div>

            <button
              onClick={handleSearch}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 shadow"
            >
              Search Results
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow">
          {/* Loading */}
          {loading ? (
            <div className="p-12 text-center">Loading...</div>
          ) : results.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              No results found
            </div>
          ) : (
            <>
              <table className="w-full ">
                <thead className="bg-green-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Rank</th>{" "}
                    {/* NEW COLUMN */}
                    <th className="px-6 py-4 text-left">Student Name</th>
                    <th className="px-6 py-4 text-left">Phone</th>
                    <th className="px-6 py-4 text-left">Exam Number</th>
                       <th className="px-6 py-4 text-left">Total Marks</th>
                    <th className="px-6 py-4 text-left">Achive Score</th>
                 
                    <th className="px-6 py-4 text-center">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => {
                    const rank = (currentPage - 1) * meta.limit + (index + 1);

                    const totalMarks =
                      (result.correctAnswers || 0) +
                      (result.wrongAnswers || 0) +
                      (result.unanswered || 0);

                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-purple-600">
                          {rank}
                        </td>

                        <td className="px-6 py-4 font-semibold">
                          {result.student_name}
                        </td>
                        <td className="px-6 py-4">{result.student_phone}</td>
                        <td className="px-6 py-4">{result.exam_number}</td>
                      

                             {/* Total Marks */}
                        <td className="px-6 py-4 font-bold text-blue-600">
                          {totalMarks}
                        </td>

                        
                        {/* Achive Score */}
                        <td className="px-6 py-4 font-bold text-green-600">
                          {result.score}
                        </td>

                   

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() =>
                              (window.location.href = `/dashboard/result/details?exam=${result.exam_number}&phone=${result.student_phone}`)
                            }
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
                <button
                  disabled={currentPage === 1}
                  onClick={() => fetchResults(currentPage - 1)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft />
                </button>

                <span>
                  Page {meta.page} of {meta.totalPages}
                </span>

                <button
                  disabled={currentPage === meta.totalPages}
                  onClick={() => fetchResults(currentPage + 1)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                  <ChevronRight />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
