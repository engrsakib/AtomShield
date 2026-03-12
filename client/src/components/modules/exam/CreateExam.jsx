"use client";

import { ENV } from "@/config/env";
import getCookie from "@/util/GetCookie";
import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaPlus,
  FaTimes,
  FaListUl,
  FaTrash,
  FaCalendarAlt,
  FaClock,
  FaCheckDouble,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { NegativeMark } from "./negativeMark";


const negativeMarkOptions = [
  { label: "ZERO", value: 0 },
  { label: "QUARTER", value: 0.25 },
  { label: "HALF", value: 0.5 },
  { label: "FULL", value: 1 },
];



// --------------------
// Reusable Input
// --------------------
const Input = ({ label, id, icon, ...props }) => {
  const Icon = icon;
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        )}
        <input
          id={id}
          {...props}
          className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                     focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                     bg-white text-gray-900 ${Icon ? "pl-10" : ""}`}
        />
      </div>
    </div>
  );
};

// --------------------
// Question Card UI
// --------------------
const QuestionCard = ({ question, isSelected, onToggle }) => {
  const typeColors = {
    math: "bg-purple-100 text-purple-800",
    general: "bg-blue-100 text-blue-800",
    science: "bg-green-100 text-green-800",
  };

  const answerColors = {
    mcq: "bg-indigo-100 text-indigo-800",
    written: "bg-orange-100 text-orange-800",
  };

  return (
    <div
      className={`p-4 border rounded-lg transition-all cursor-pointer ${
        isSelected
          ? "bg-green-50 border-green-500 shadow-md"
          : "bg-white border-gray-200 hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-sm text-gray-800 flex-1 line-clamp-2">
          {question.title}
        </h4>
        <button
          type="button"
          onClick={() => onToggle(question)}
          className={`ml-2 p-1.5 rounded-full transition-colors ${
            isSelected
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {isSelected ? <FaTimes size={12} /> : <FaPlus size={12} />}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
        {question.description}
      </p>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span
          className={`px-2 py-0.5 text-xs rounded-full capitalize ${typeColors[question.type] || "bg-gray-100 text-gray-800"}`}
        >
          {question.type}
        </span>
        <span
          className={`px-2 py-0.5 text-xs rounded-full capitalize ${answerColors[question.answerType] || "bg-gray-100 text-gray-800"}`}
        >
          {question.answerType}
        </span>
        <span className="ml-auto text-sm font-bold text-gray-700">
          {question.marks} Marks
        </span>
      </div>
    </div>
  );
};

// --------------------
// Modal UI
// --------------------
const QuestionSelectorModal = ({
  isOpen,
  onClose,
  selectedQuestions,
  onSelectQuestions,
}) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelected, setLocalSelected] = useState([]);
  const limit = 9;

  useEffect(() => {
    if (isOpen) {
      setLocalSelected([...selectedQuestions]);
      fetchQuestions(1, "");
    }
  }, [isOpen]);

  const fetchQuestions = async (currentPage, search) => {
    setLoading(true);
    try {
      const url = `https://mcq-analysis.vercel.app/api/v1/question/?page=${currentPage}&limit=${limit}${search ? `&searchTerm=${search}` : ""}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: getCookie("access_token") || "",
        },
      });
      const result = await response.json();

      if (result.success) {
        setQuestions(result.data.data);
        setTotalPages(Math.ceil(result.data.meta.total / limit));
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(1);
    fetchQuestions(1, value);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchQuestions(newPage, searchQuery);
  };

  const handleToggleQuestion = (question) => {
    const isAlreadySelected = localSelected.some((q) => q._id === question._id);
    if (isAlreadySelected) {
      setLocalSelected(localSelected.filter((q) => q._id !== question._id));
    } else {
      setLocalSelected([...localSelected, question]);
    }
  };

  const handleDone = () => {
    onSelectQuestions(localSelected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold">Select Questions</h2>
            <p className="text-sm text-green-100 mt-1">
              {localSelected.length} questions selected
            </p>
          </div>
          <button
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            onClick={onClose}
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b bg-gray-50">
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions by title or description..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <FaSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg">No questions found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questions.map((q) => (
                <QuestionCard
                  key={q._id}
                  question={q}
                  isSelected={localSelected.some(
                    (selected) => selected._id === q._id,
                  )}
                  onToggle={handleToggleQuestion}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && questions.length > 0 && (
          <div className="px-6 py-3 border-t bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaChevronLeft size={12} /> Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next <FaChevronRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 rounded-b-xl">
          <button
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
            onClick={handleDone}
          >
            Done - Add {localSelected.length} Question
            {localSelected.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
};



// --------------------
// Main Component
// --------------------
export default function CreateExamForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [formData, setFormData] = useState({
    exam_name: "",
    exam_date_time: "",
    duration_minutes: "",
   negative_mark: NegativeMark[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const totalMarks = selectedQuestions.reduce(
    (sum, q) => sum + (q.marks || 0),
    0,
  );

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRemoveQuestion = (questionId) => {
    setSelectedQuestions(selectedQuestions.filter((q) => q._id !== questionId));
  };

  const handleSubmit = async () => {
    if (
      !formData.exam_name ||
      !formData.exam_date_time ||
      !formData.duration_minutes
    ) {
      setSubmitStatus({
        type: "error",
        message: "Please fill all required fields",
      });
      return;
    }

    if (selectedQuestions.length === 0) {
      setSubmitStatus({
        type: "error",
        message: "Please select at least one question",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {

      console.log("FormData", formData);
      console.log("Negative", formData.negative_mark);

      const payload = {
        exam_name: formData.exam_name,
        exam_date_time: formData.exam_date_time,
        duration_minutes: parseInt(formData.duration_minutes),
        total_marks: totalMarks,
        questions: selectedQuestions.map((q) => q._id),
            negative_mark: Number(formData.negative_mark),
      };

      const response = await fetch(`${ENV.BASE_URL}/exam/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getCookie("access_token") || "",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      console.log("Exam CheckData", result);

      if (result.success) {
        setSubmitStatus({
          type: "success",
          message: "Exam created successfully!",
        });
        // Reset form
        setFormData({
          exam_name: "",
          exam_date_time: "",
          duration_minutes: "",
            negative_mark: 0,
        });
        setSelectedQuestions([]);
      } else {
        setSubmitStatus({
          type: "error",
          message: result.message || "Failed to create exam",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Error creating exam. Please try again.",
      });
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div className="pb-5 border-b">
          <h1 className="text-3xl font-bold text-gray-900">Create New Exam</h1>
          <p className="text-sm text-gray-600 mt-1">
            Fill the form to schedule a new exam
          </p>
        </div>

        {/* Status Message */}
        {submitStatus && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              submitStatus.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Input
            label="Exam Name"
            id="exam_name"
            name="exam_name"
            icon={FaListUl}
            placeholder="BCS Mock Test"
            value={formData.exam_name}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Exam Date & Time"
            id="exam_date_time"
            name="exam_date_time"
            type="datetime-local"
            icon={FaCalendarAlt}
            value={formData.exam_date_time}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Duration (Minutes)"
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            icon={FaClock}
            placeholder="e.g., 60"
            value={formData.duration_minutes}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Total Marks (Auto-calculated)"
            id="total_marks"
            type="number"
            icon={FaCheckDouble}
            value={totalMarks}
            disabled
          />
        </div>

        <select
          name="negative_mark"
          value={formData.negative_mark}
          onChange={(e) =>
            setFormData({
              ...formData,
              negative_mark: Number(e.target.value),
            })
          }
          className="block w-6/12 px-3 py-2 border mt-3  border-gray-300 rounded-md shadow-sm
             focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
             bg-white text-gray-900"
        >
          {negativeMarkOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Selected Questions Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-gray-800">
              Selected Questions ({selectedQuestions.length})
              {selectedQuestions.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  • Total: {totalMarks} Marks
                </span>
              )}
            </h3>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
            >
              <FaPlus size={14} /> Add Questions
            </button>
          </div>

          <div className="mt-4">
            {selectedQuestions.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center text-gray-500">
                <p className="text-lg">No questions selected yet</p>
                <p className="text-sm mt-1">
                  Click "Add Questions" to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedQuestions.map((q, index) => (
                  <div
                    key={q._id}
                    className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{q.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full capitalize">
                          {q.type}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full capitalize">
                          {q.answerType}
                        </span>
                        <span className="text-sm font-semibold text-gray-700 ml-auto">
                          {q.marks} Marks
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q._id)}
                      className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove question"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-8 pt-5 border-t">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-4 rounded-lg text-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating Exam..." : "Create Exam"}
          </button>
        </div>
      </div>

      {/* Modal */}
      <QuestionSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedQuestions={selectedQuestions}
        onSelectQuestions={setSelectedQuestions}
      />
    </div>
  );
}
