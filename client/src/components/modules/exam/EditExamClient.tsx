


"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import getCookie from "@/util/GetCookie";

import {
  FaSearch,
  FaPlus,
  FaTimes,
  FaListUl,
  FaCalendarAlt,
  FaClock,
  FaCheckDouble,
  FaChevronLeft,
  FaChevronRight,
  FaTrash
} from "react-icons/fa";
import { ENV } from "@/config/env";

/* =====================================================
    TYPES
===================================================== */
interface Question {
  _id: string;
  title: string;
  description: string;
  type: string;
  answerType: string;
  marks: number;
}

interface ExamData {
  exam_name: string;
  exam_date_time: string;
  duration_minutes: number;
  total_marks: number;
  questions: Question[];
}

/* =====================================================
    INPUT COMPONENT
===================================================== */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  icon?: React.ElementType;
}

const Input: React.FC<InputProps> = ({ label, id, icon: Icon, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      )}
      <input
        id={id}
        {...props}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-green-500 focus:border-green-500
          bg-white text-gray-900 ${Icon ? "pl-10" : ""}`}
      />
    </div>
  </div>
);

/* =====================================================
    QUESTION CARD
===================================================== */
interface QuestionCardProps {
  question: Question;
  isSelected: boolean;
  onToggle: (question: Question) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isSelected,
  onToggle,
}) => (
  <div
    className={`p-4 border rounded-lg cursor-pointer transition-all ${
      isSelected
        ? "bg-green-50 border-teal-500 shadow"
        : "bg-white border-gray-300 hover:shadow"
    }`}
  >
    <div className="flex justify-between items-start">
      <h4 className="font-semibold text-gray-800 line-clamp-2">{question.title}</h4>
      <button
        type="button"
        onClick={() => onToggle(question)}
        className={`p-1.5 rounded-full ${
          isSelected ? "bg-red-600 text-white" : "bg-teal-600 text-white"
        }`}
      >
        {isSelected ? <FaTimes size={12} /> : <FaPlus size={12} />}
      </button>
    </div>

    <p className="text-xs text-gray-500 mt-2">{question.description}</p>

    <div className="flex gap-2 items-center mt-3 text-xs">
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full capitalize">
        {question.type}
      </span>
      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full capitalize">
        {question.answerType}
      </span>
      <span className="ml-auto font-semibold">{question.marks} Marks</span>
    </div>
  </div>
);

/* =====================================================
    MODAL COMPONENT
===================================================== */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQuestions: Question[];
  onSelectQuestions: (q: Question[]) => void;
}

const QuestionSelectorModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  selectedQuestions,
  onSelectQuestions,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [localSelected, setLocalSelected] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 9;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setLocalSelected([...selectedQuestions]);
      fetchQuestions(1, "");
    }
  }, [isOpen]);

  const fetchQuestions = async (page: number, search: string) => {
    setLoading(true);

    try {
      const res = await fetch(
        `${ENV.BASE_URL}/question?page=${page}&limit=${limit}&searchTerm=${search}`,
        {
          headers: { Authorization: getCookie("access_token") || "" },
        }
      );

      const json = await res.json();

      if (json.success) {
        setQuestions(json.data.data);
        setTotalPages(Math.ceil(json.data.meta.total / limit));
      }
    } catch (err) {
      console.error("Failed to load questions", err);
    }

    setLoading(false);
  };

  const toggleSelect = (q: Question) => {
    const exists = localSelected.some((x) => x._id === q._id);
    if (exists) {
      setLocalSelected(localSelected.filter((x) => x._id !== q._id));
    } else {
      setLocalSelected([...localSelected, q]);
    }
  };

  const finalizeSelection = () => {
    onSelectQuestions(localSelected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl shadow-xl max-h-[90vh] flex flex-col">

        {/* HEADER */}
        <div className="bg-teal-600 text-white p-5 rounded-t-xl flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Select Questions</h2>
            <p className="text-sm opacity-80">{localSelected.length} selected</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-green-700 rounded-lg">
            <FaTimes size={20} />
          </button>
        </div>

        {/* SEARCH */}
        <div className="p-4 border-b">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchQuestions(1, e.target.value);
              }}
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-xl py-10 text-gray-500">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questions.map((q) => (
                <QuestionCard
                  key={q._id}
                  question={q}
                  isSelected={localSelected.some((x) => x._id === q._id)}
                  onToggle={toggleSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={finalizeSelection}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg"
          >
            Add {localSelected.length} Question(s)
          </button>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
    UPDATE EXAM PAGE
===================================================== */
export default function UpdateExamClient() {
  const params = useSearchParams();
  const examNumber = params.get("exam");

  const [examData, setExamData] = useState<ExamData | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalMarks = selectedQuestions.reduce((sum, q) => sum + q.marks, 0);

  useEffect(() => {
    fetchExam();
  }, []);

  const fetchExam = async () => {
    try {
      const res = await fetch(
        `${ENV.BASE_URL}/exam/${examNumber}`,
        {
          headers: { Authorization: getCookie("access_token") || "" },
        }
      );

      const json = await res.json();

      if (json.success) {
        setExamData(json.data);
        setSelectedQuestions(json.data.questions);
      }
    } catch (err) {
      console.error("Error loading exam", err);
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!examData) return;

    setIsUpdating(true);

    const payload = {
      exam_name: examData.exam_name,
      exam_date_time: examData.exam_date_time,
      duration_minutes: examData.duration_minutes,
      total_marks: totalMarks,
      questions: selectedQuestions.map((q) => q._id),
    };

    try {
      const res = await fetch(
        `${ENV.BASE_URL}/exam/${examNumber}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: getCookie("access_token") || "",
          },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (json.success) {
        Swal.fire({
          icon: "success",
          title: "Updated Successfully!",
          text: "The exam has been updated.",
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: json.message,
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Could not update exam.",
      });
    }

    setIsUpdating(false);
  };

  if (loading || !examData) return <p className="p-10 text-center">Loading...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold mb-4">Update Exam</h1>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Exam Name"
          id="examName"
          icon={FaListUl}
          value={examData.exam_name}
          onChange={(e) =>
            setExamData({ ...examData, exam_name: e.target.value })
          }
        />

        <Input
          label="Exam Date & Time"
          id="examDate"
          type="datetime-local"
          icon={FaCalendarAlt}
          value={examData.exam_date_time.slice(0, 16)}
          onChange={(e) =>
            setExamData({ ...examData, exam_date_time: e.target.value })
          }
        />

        <Input
          label="Duration (Minutes)"
          id="duration"
          type="number"
          icon={FaClock}
          value={examData.duration_minutes}
          onChange={(e) =>
            setExamData({
              ...examData,
              duration_minutes: Number(e.target.value),
            })
          }
        />

        <Input
          label="Total Marks (Auto)"
          id="totalMarks"
          type="number"
          icon={FaCheckDouble}
          value={totalMarks}
          disabled
        />
      </div>

      {/* SELECTED QUESTIONS */}
      <div className="mt-8">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">
            Selected Questions ({selectedQuestions.length})
          </h3>

          <button
            className="bg-teal-600 text-white px-4 py-2 rounded-lg"
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlus className="inline mr-2" /> Add Questions
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {selectedQuestions.map((q, i) => (
            <div
              key={q._id}
              className="p-4 bg-gray-50 border rounded-lg flex items-center justify-between"
            >
              <div>
                <h4 className="font-semibold">{i + 1}. {q.title}</h4>
                <span className="text-sm text-gray-600">{q.marks} Marks</span>
              </div>

              <button
                onClick={() =>
                  setSelectedQuestions(selectedQuestions.filter((x) => x._id !== q._id))
                }
                className="text-red-600 hover:text-red-800"
              >
                <FaTrash size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* UPDATE BUTTON */}
      <button
        onClick={handleUpdate}
        className="mt-6 w-full bg-teal-600 text-white py-3 rounded-lg flex justify-center items-center gap-2 disabled:opacity-50"
        disabled={isUpdating}
      >
        {isUpdating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Updating...
          </>
        ) : (
          "Update Exam"
        )}
      </button>

      {/* MODAL */}
      <QuestionSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedQuestions={selectedQuestions}
        onSelectQuestions={setSelectedQuestions}
      />
    </div>
  );
}
