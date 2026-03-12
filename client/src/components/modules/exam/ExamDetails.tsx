



"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  FaArrowLeft, FaEdit, FaTrash, FaCalendarAlt, FaClock,
  FaCheckDouble, FaBook, FaToggleOn, FaToggleOff
} from "react-icons/fa";

// 🔥 Math Formula Rendering (KaTeX)
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

export default function ExamDetailsClient() {
  const params = useSearchParams();
  const examNumber = params.get("exam");

  const [exam, setExam] = useState<any>(null);

  console.log("Exam Check Data", exam)
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (examNumber) fetchExam();
  }, [examNumber]);

  async function fetchExam() {
    setLoading(true);
    try {
      const res = await fetch(
        `https://mcq-analysis.vercel.app/api/v1/exam/${examNumber}`
      );
      const json = await res.json();
      if (json.success) setExam(json.data);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }





    


  if (!examNumber)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100">
        <div className="text-center p-10 bg-white rounded-2xl shadow-2xl">
          <p className="text-xl text-gray-700 font-semibold">Invalid Exam Number</p>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100">
        <div className="relative">
          <div className="h-20 w-20 border-4 border-green-200 rounded-full"></div>
          <div className="h-20 w-20 border-t-4 border-green-600 rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => (window.location.href = "/dashboard/exam/list")}
            className="p-3 bg-white hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 hover:text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <FaArrowLeft size={20} className="text-gray-700 group-hover:text-white transition-colors" />
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Exam Details
          </h1>
        </div>

        {/* EXAM HEADER CARD */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 rounded-2xl shadow-2xl mb-8 text-white">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">{exam.exam_name}</h2>
              <p className="font-mono text-green-100 text-lg">#{exam.exam_number}</p>
            </div>

          
          </div>

          {/* INFO GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="flex gap-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <FaCalendarAlt className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Exam Date & Time</p>
                  <p className="font-bold text-white text-base">
                    {new Date(exam.exam_date_time).toLocaleDateString()}
                  </p>
                  <p className="text-green-100 text-sm">
                    {new Date(exam.exam_date_time).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="flex gap-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <FaClock className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Duration</p>
                  <p className="font-bold text-white text-xl">{exam.duration_minutes}</p>
                  <p className="text-green-100 text-sm">minutes</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="flex gap-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <FaCheckDouble className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Total Marks</p>
                  <p className="font-bold text-white text-xl">{exam.total_marks}</p>
                  <p className="text-green-100 text-sm">points</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <div className="flex gap-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <FaBook className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Total Questions</p>
                  <p className="font-bold text-white text-xl">{exam.questions.length}</p>
                  <p className="text-green-100 text-sm">questions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUESTIONS LIST */}
        <div className="bg-white/80 backdrop-blur-lg p-8 shadow-2xl rounded-2xl mb-8 border border-white/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Questions
            </h3>
          </div>

          {exam.questions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

              {exam.questions.map((q: any, index: number) => (
                <div
                  key={q._id}
                  className="bg-gradient-to-br from-white to-emerald-50/50 p-6 border border-green-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* TOP HEADER */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm rounded-full font-bold shadow-md">
                      Q{index + 1}
                    </span>

                    <span className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 text-white text-sm font-bold shadow-md">
                      {q.marks} Marks
                    </span>
                  </div>

                  {/* TITLE */}
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    {q.title}
                  </h4>

                  {/* DESCRIPTION */}
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {q.description}
                  </p>

                  {/* 🔥 MATH FORMULA (if exists) */}
                  {q.mathFormula && (
                    <div className="my-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                      <h5 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        Math Formula
                      </h5>

                      {/* Centered KaTeX */}
                      <div className="text-center">
                        <BlockMath math={q.mathFormula} />
                      </div>
                    </div>
                  )}

                  {/* BASIC DETAILS */}
                  <div className="space-y-2 text-sm text-gray-700 mb-4 bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
                    <p className="flex justify-between">
                      <span className="font-semibold text-green-700">Question ID:</span>
                      <span className="text-gray-600">{q.questionId}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-green-700">Type:</span>
                      <span className="text-gray-600">{q.type}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-green-700">Answer Type:</span>
                      <span className="text-gray-600">{q.answerType}</span>
                    </p>
                  </div>

                  {/* ANSWER DETAILS */}
                  <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                    <h5 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                      Answer Details
                    </h5>

                    {q.answer?.options?.length > 0 ? (
                      <ul className="space-y-1 text-sm text-gray-700 mb-3">
                        {q.answer.options.map((opt: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{opt}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm italic mb-3">No options available</p>
                    )}

                    <div className="pt-2 border-t border-emerald-200">
                      <p className="text-sm flex items-center gap-2">
                        <span className="font-semibold text-emerald-800">Correct Answer:</span>
                        <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg font-bold text-xs">
                          {q.answer?.correctAnswer}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* BLANKS */}
                  {q.blanks && q.blanks.length > 0 && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <h5 className="text-sm font-bold text-purple-800 mb-2">Blanks</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {q.blanks.map((b: any, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-purple-600 font-bold">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              ))}

            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-block p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-inner">
                <FaBook className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500 text-lg font-medium">No questions found</p>
              </div>
            </div>
          )}
        </div>



      </div>
    </div>
  );
}
