

'use client';

import { ENV } from '@/config/env';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

// Fixed MathEditor Component
const MathEditor = ({ value, onChange, readOnly = false }) => {
  const mathEditorRef = React.useRef(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const scriptId = 'mathlive-script';
    
    if (window.MathfieldElement) {
      setIsLoaded(true);
      return;
    }

    if (document.getElementById(scriptId)) {
      const checkInterval = setInterval(() => {
        if (window.MathfieldElement) {
          setIsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://unpkg.com/mathlive';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ MathLive loaded');
      setIsLoaded(true);
    };
    
    document.head.appendChild(script);
  }, []);

  React.useEffect(() => {
    if (!isLoaded || !mathEditorRef.current) return;

    const mathField = mathEditorRef.current;

    if (value && mathField.setValue) {
      mathField.setValue(value);
    }

    if (mathField.setOptions) {
      mathField.setOptions({
        virtualKeyboardMode: 'manual',
        smartMode: true,
      });
    }

    const handleInput = () => {
      if (mathField.getValue && !readOnly) {
        onChange(mathField.getValue());
      }
    };

    mathField.addEventListener('input', handleInput);
    mathField.addEventListener('change', handleInput);

    return () => {
      mathField.removeEventListener('input', handleInput);
      mathField.removeEventListener('change', handleInput);
    };
  }, [isLoaded, onChange, readOnly]);

  React.useEffect(() => {
    if (!isLoaded || !mathEditorRef.current) return;
    
    const mathField = mathEditorRef.current;
    if (mathField.getValue && mathField.setValue) {
      const currentVal = mathField.getValue();
      if (currentVal !== value && value !== undefined) {
        mathField.setValue(value || '');
      }
    }
  }, [value, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="w-full p-4 border border-gray-300 rounded-md bg-gray-50 text-center text-gray-500">
        Loading Math Editor...
      </div>
    );
  }

  return (
    <>
      <math-field 
        ref={mathEditorRef}
        read-only={readOnly ? 'true' : undefined}
        style={{
          display: 'block',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          padding: '0.5rem 0.75rem',
          fontSize: '1.125rem',
          background: '#ffffff',
          width: '100%',
          minHeight: '3rem'
        }}
      >
        {value || ''}
      </math-field>
    </>
  );
};

const QUESTIONS_STORAGE_KEY = 'allQuestions';
const API_URL = `${ENV.BASE_URL}/question/`;

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      {...props}
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      {...props}
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    >
      {children}
    </select>
  </div>
);


function getCookie(name) {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;

  return null;
}

export default function CreateQuestionForm() { 
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [mark, setMark] = useState('');
  const [answerType, setAnswerType] = useState('mcq');
  const [questionType, setQuestionType] = useState('general');
  const [description, setDescription] = useState(''); 
  const [mathFormula, setMathFormula] = useState(''); 
  const [blanks, setBlanks] = useState([
    { id: 1, options: ['', '', '', ''], correctAnswer: '' },
  ]);



  const handleBlankOptionChange = (blankIndex, optionIndex, value) => {
    const newBlanks = [...blanks];
    newBlanks[blankIndex].options[optionIndex] = value;
    setBlanks(newBlanks);
  };

  const handleCorrectAnswerChange = (blankIndex, value) => {
    const newBlanks = [...blanks];
    newBlanks[blankIndex].correctAnswer = value;
    setBlanks(newBlanks);
  };

  const addBlank = () => {
    setBlanks([
      ...blanks,
      { id: Date.now(), options: ['', '', '', ''], correctAnswer: '' },
    ]);
  };

  const removeBlank = (index) => {
    if (blanks.length <= 1) return;
    const newBlanks = blanks.filter((_, i) => i !== index);
    setBlanks(newBlanks);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const apiPayload = {
  //       title,
  //       description: description || undefined,
  //       type: questionType.toLowerCase(),
  //       mathFormula: questionType === 'math' ? mathFormula : undefined,
  //       answerType: answerType.toLowerCase(),
  //       marks: parseInt(mark),
  //       answer: answerType === 'mcq' 
  //         ? {
  //             options: blanks.flatMap(blank => 
  //               blank.options.filter(opt => opt.trim() !== '')
  //             ),
  //             correctAnswer: blanks[0].correctAnswer
  //           }
  //         : {}
  //     };

  //     Object.keys(apiPayload).forEach(key => 
  //       apiPayload[key] === undefined && delete apiPayload[key]
  //     );

  //     console.log('📤 Sending to API:', JSON.stringify(apiPayload, null, 2));


  //      const accessToken = getCookie("access_token");


  //     const response = await fetch(API_URL, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //          Authorization: accessToken || "",

  //       },
  //       credentials:"include",
  //       body: JSON.stringify(apiPayload)
  //     });

  //     const result = await response.json();

  //     if (!response.ok) {
  //       throw new Error(result.message || 'Failed to create question');
  //     }

  //     console.log('📥 API Response:', result);

  //     const newQuestion = {
  //       id: result.data.questionId || Date.now(),
  //       title: result.data.title,
  //       mark: result.data.marks,
  //       answerType: result.data.answerType,
  //       questionType: result.data.type,
  //       description: result.data.description || '',
  //       mathFormula: result.data.mathFormula || '',
  //       blanks: answerType === 'mcq' ? blanks : [],
  //       createdAt: result.data.createdAt,
  //       apiData: result.data
  //     };

  //     const updatedQuestions = [...allQuestions, newQuestion];
  //     localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(updatedQuestions));
  //     setAllQuestions(updatedQuestions);

  //     setTitle('');
  //     setMark('');
  //     setAnswerType('mcq');
  //     setQuestionType('general');
  //     setDescription(''); 
  //     setMathFormula(''); 
  //     setBlanks([{ id: 1, options: ['', '', '', ''], correctAnswer: '' }]);

  //     alert('✅ প্রশ্ন সফলভাবে API-তে সেভ করা হয়েছে!');
  //   } catch (error) {
  //     console.error('❌ API Error:', error);
  //     alert(`❌ Error: ${error.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


      const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const apiPayload = {
      title,
      description: description || undefined,
      type: questionType.toLowerCase(),
      mathFormula: questionType === 'math' ? mathFormula : undefined,
      answerType: answerType.toLowerCase(),
      marks: parseInt(mark),
      answer: answerType === 'mcq'
        ? {
            options: blanks.flatMap(blank =>
              blank.options.filter(opt => opt.trim() !== '')
            ),
            correctAnswer: blanks[0].correctAnswer
          }
        : {}
    };

    Object.keys(apiPayload).forEach(key =>
      apiPayload[key] === undefined && delete apiPayload[key]
    );

    const accessToken = getCookie("access_token");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken || "",
      },
      credentials: "include",
      body: JSON.stringify(apiPayload),
    });

    const result = await response.json();

    console.log("CreateQuestionForm", result)

    if (!response.ok) {
      Swal.fire({
        icon: "error",
        title: "❌ Failed!",
        text: result.message || "Question create failed!",
      });
      throw new Error(result.message);
    }

    // SUCCESS SWEETALERT
    await Swal.fire({
      icon: "success",
      title: "✅ Question Created!",
      text: "Your question is successfully saved to the API.",
      confirmButtonColor: "#2B6A5B",
    });

    // LocalStorage update
    const newQuestion = {
      id: result.data.questionId || Date.now(),
      title: result.data.title,
      mark: result.data.marks,
      answerType: result.data.answerType,
      questionType: result.data.type,
      description: result.data.description || "",
      mathFormula: result.data.mathFormula || "",
      blanks: answerType === "mcq" ? blanks : [],
      createdAt: result.data.createdAt,
      apiData: result.data,
    };

    const updatedQuestions = [...allQuestions, newQuestion];
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(updatedQuestions));
    setAllQuestions(updatedQuestions);

    // Reset form
    setTitle("");
    setMark("");
    setAnswerType("mcq");
    setQuestionType("general");
    setDescription("");
    setMathFormula("");
    setBlanks([{ id: 1, options: ["", "", "", ""], correctAnswer: "" }]);

  } catch (error) {
    console.error("❌ API Error:", error);

    Swal.fire({
      icon: "error",
      title: "Error!",
      text: error.message || "Something went wrong",
    });

  } finally {
    setLoading(false);
  }
};




  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Create New Question</h1>
          <span className="text-sm text-gray-500 bg-green-50 px-3 py-1 rounded-full">
            🟢  Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Question Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter question title..."
            required
          />
          <Input
            label="Mark"
            type="number"
            value={mark}
            onChange={(e) => setMark(e.target.value)}
            placeholder="Enter question mark..."
            required
          />
          <Select
            label="Answer Type"
            value={answerType}
            onChange={(e) => setAnswerType(e.target.value)}
          >
            <option value="mcq">MCQ (Fill in the Blanks)</option>
            <option value="written">Written</option>
          </Select>
          <Select
            label="Question Type"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <option value="general">General</option>
            <option value="math">Math</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter question description (if any)..."
          ></textarea>
        </div>

        {questionType === 'math' && (
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Math Formula
            </label>
            <MathEditor 
              value={mathFormula} 
              onChange={setMathFormula}
              readOnly={false}
            />
            {mathFormula && (
              <div className="mt-2 p-2 bg-gray-50 rounded border text-xs text-gray-600">
                <strong>LaTeX:</strong> {mathFormula}
              </div>
            )}
          </div>
        )}

        {answerType === 'mcq' && (
          <div className="space-y-6 p-4 border border-gray-200 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800">
              Answer Blanks (MCQ Options)
            </h2>
            {blanks.map((blank, blankIndex) => (
              <div
                key={blank.id}
                className="p-4 border border-gray-300 rounded-md relative"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-700">
                    Blank {blankIndex + 1}
                  </h3>
                  {blanks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBlank(blankIndex)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove Blank
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blank.options.map((option, optionIndex) => (
                    <Input
                      key={optionIndex}
                      label={`Option ${optionIndex + 1}`}
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleBlankOptionChange(
                          blankIndex,
                          optionIndex,
                          e.target.value
                        )
                      }
                      placeholder={`Enter option ${optionIndex + 1}`}
                      required
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <Select
                    label="Correct Answer"
                    value={blank.correctAnswer}
                    onChange={(e) =>
                      handleCorrectAnswerChange(blankIndex, e.target.value)
                    }
                    required
                  >
                    <option value="">Choose correct answer</option>
                    {blank.options.map((opt, index) => (
                      opt && (
                        <option key={index} value={index + 1}>
                          {opt}
                        </option>
                      )
                    ))}
                  </Select>
                </div>
              </div>
            ))}
    
          </div>
        )}

        <div className="pt-5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-[#2B6A5B] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Saving to API...' : ' Confirm & Add Question'}
          </button>
        </div>
      </div>

    
    </div>
  );
}