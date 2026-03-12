
"use client";

import { ENV } from '@/config/env';
import getCookie from '@/util/GetCookie';
import { AlignLeft, Bold, Italic, Underline, List, ListOrdered, Type, FileText, Upload, X, Loader2, CheckCircle } from 'lucide-react';
import React, { useState, useRef } from 'react';
import Swal from 'sweetalert2';

import dynamic from "next/dynamic";

const QuillEditor = dynamic(() => import("@/editor/QuilEditor"), {
  ssr: false,
});


export default function CreateGuideline() {
  const [formData, setFormData] = useState({
    title: '',
    video_url: '',
    thumbnail_url: '',
    description: '',
    is_published: true
  });

  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  const handleInputChange = (e:any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const applyTextFormat = (command:any, value = null) => {
    document.execCommand(command, false, value as any);
    editorRef.current?.focus();
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      setFormData(prev => ({ ...prev, description: htmlContent }));
    }
  };

  const handleThumbnailUpload = async (e:any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please select an image file',
        confirmButtonColor: '#0d9488'
      });
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'File size must be less than 6MB',
        confirmButtonColor: '#0d9488'
      });
      return;
    }

    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', UPLOAD_PRESET);
      uploadData.append('cloud_name', CLOUD_NAME);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: uploadData
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        thumbnail_url: data.secure_url
      }));
      setThumbnailPreview(data.secure_url);

      Swal.fire({
        icon: 'success',
        title: 'Upload Success!',
        text: 'Thumbnail uploaded successfully',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (error) {
      console.error('Error uploading image:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Failed to upload image. Please try again.',
        confirmButtonColor: '#0d9488'
      });
    } finally {
      setUploading(false);
    }
  };

  const removeThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail_url: '' }));
    setThumbnailPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };



  const handleSubmit = async () => {
  if (!formData.title.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Title',
      text: 'Please enter a title',
      confirmButtonColor: '#0d9488'
    });
    return;
  }

  if (!formData.video_url.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Video URL',
      text: 'Please enter a video URL',
      confirmButtonColor: '#0d9488'
    });
    return;
  }

  setSubmitting(true);
  setSuccess(false);

  try {
    const payload = {
      title: formData.title.trim(),
      video_url: formData.video_url.trim(),
      thumbnail_url: formData.thumbnail_url?.trim() || '',
      description: formData.description?.trim() || '',
      is_published: formData.is_published,
    };

    const response = await fetch(`${ENV.BASE_URL}/youtube`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getCookie('access_token') || ''
      },
      body: JSON.stringify(payload)
    });

    const checkedData = await response.clone().json().catch(() => ({}));
    console.log('Response Data:', checkedData);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create guideline');
    }

    const result = await response.json();
    console.log('Success:', result);

    await Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'YouTube video created successfully',
      confirmButtonColor: '#0d9488',
      timer: 3000
    });

    handleReset();
  } catch (error) {
    console.error('Error creating guideline:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to create video. Please try again.';

    Swal.fire({
      icon: 'error',
      title: 'Creation Failed',
      text: errorMessage,
      confirmButtonColor: '#0d9488'
    });
  } finally {
    setSubmitting(false);
  }
};


  const handleReset = () => {
    setFormData({
      title: '',
      video_url: '',
      thumbnail_url: '',
      description: '',
      is_published: true
    });
    setThumbnailPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-2xl p-6 sm:p-8 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Create YouTube Video</h1>
              <p className="text-teal-50 text-sm sm:text-base mt-1">MCQ Application Guidelines Setup</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-4 flex items-center gap-3 animate-pulse">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-green-800 font-semibold">YouTube video created successfully!</span>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6 sm:p-8 space-y-6">

          {/* Title */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm sm:text-base">
              <Type className="w-5 h-5 text-teal-600" />
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter guideline title"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
            />
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm sm:text-base">
              <FileText className="w-5 h-5 text-teal-600" />
              Video URL *
            </label>
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleInputChange}
              placeholder="https://example.com/video.mp4"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
            />
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm sm:text-base">
              <Upload className="w-5 h-5 text-teal-600" />
              Thumbnail Image
            </label>
            
            {!thumbnailPreview ? (
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                  id="thumbnail-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="thumbnail-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-teal-500 transition-all ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-2" />
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload thumbnail</span>
                      <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                    </>
                  )}
                </label>
              </div>
            ) : (
              <div className="relative inline-block">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full max-w-md h-48 object-cover rounded-xl border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm sm:text-base">
              <FileText className="w-5 h-5 text-teal-600" />
              Status
            </label>
            <select
              name="is_published"
              value={formData.is_published ? 'true' : 'false'}
              onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.value === 'true' }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white transition-all"
            >
              <option value="true">Published</option>
              <option value="false">Unpublished</option>
            </select>
          </div>

          {/* Description with Quill Editor */}
<div className="space-y-2">
  <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm sm:text-base">
    <AlignLeft className="w-5 h-5 text-teal-600" />
    Description *
  </label>

  <QuillEditor
    value={formData.description}
    onChange={(html) =>
      setFormData((prev) => ({ ...prev, description: html }))
    }
  />
</div>


          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || uploading}
              className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Guideline'
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={submitting}
              className="sm:w-32 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </div>


      </div>
      
      <style jsx>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contentEditable]:focus {
          outline: none;
        }
        [contentEditable] strong {
          font-weight: bold;
        }
        [contentEditable] em {
          font-style: italic;
        }
        [contentEditable] u {
          text-decoration: underline;
        }
        [contentEditable] ul {
          list-style-type: disc;
          margin-left: 20px;
          margin-top: 8px;
          margin-bottom: 8px;
        }
        [contentEditable] ol {
          list-style-type: decimal;
          margin-left: 20px;
          margin-top: 8px;
          margin-bottom: 8px;
        }
        [contentEditable] li {
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
}