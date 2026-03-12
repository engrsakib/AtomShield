


"use client";
import React, { useState, useEffect } from 'react';
import { User, Edit2, Phone, Briefcase, FileText, Shield, Calendar, X, Upload, Loader2 } from 'lucide-react';
import { ENV } from '@/config/env';
import getCookie from '@/util/GetCookie';

interface AdminData {
  _id: string;
  name: string;
  phone_number: string;
  is_Deleted: boolean;
  permissions: string[];
  designation: string;
  bio: string;
  role: string;
  image: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  designation: string;
  phone_number: string;
  role: string;
  bio: string;
  image: string;
}

export default function AdminProfile() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    designation: '',
    phone_number: '',
    role: '',
    bio: '',
    image: ''
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async (): Promise<void> => {
    try {
      const accessToken = getCookie('access_token');
      
      const response = await fetch(`${ENV.BASE_URL}/admin/auth`, {
        headers: {
          'Authorization': accessToken || '',
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log("Admin Profile", result);
      
      if (result.success) {
        setAdminData(result.data);
        setFormData({
          name: result.data.name,
          designation: result.data.designation,
          phone_number: result.data.phone_number,
          role: result.data.role,
          bio: result.data.bio,
          image: result.data.image
        });
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (): Promise<void> => {
    setUpdating(true);
    try {
      const accessToken = getCookie('access_token');
      const response = await fetch(`${ENV.BASE_URL}/admin/update-staff/${adminData?._id}`, {
        method: 'PATCH',
        credentials: "include",
        headers: {
          'Authorization': accessToken || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.success) {
        setAdminData(result.data);
        setIsModalOpen(false);
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const cloud_name_key = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const upload_preset_key = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', upload_preset_key!);
      formDataUpload.append('cloud_name', cloud_name_key!);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name_key}/image/upload`,
        {
          method: 'POST',
          body: formDataUpload,
        }
      );

      const data = await response.json();
      
      if (data.secure_url) {
        setFormData({ ...formData, image: data.secure_url });
        console.log('Image uploaded successfully:', data.secure_url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-green-100 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Profile</h1>
          <p className="text-gray-600 text-lg">Manage your account information and settings</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative h-48 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          </div>
          
          <div className="px-6 sm:px-10 pb-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20 mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <img
                  src={adminData?.image || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                  alt={adminData?.name}
                  className="relative w-36 h-36 rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-green-100"
                />
                <div className="absolute bottom-3 right-3 w-7 h-7 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
              </div>
              
              <div className="text-center sm:text-left flex-1 mt-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 translate-y-6">{adminData?.name}</h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-semibold text-sm rounded-full border border-green-200">
                    <Shield className="w-4 h-4" />
                    {adminData?.role?.replace(/_/g, ' ')}
                  </span>
                  <span className="inline-flex items-center px-4 py-1.5 bg-green-600 text-white font-medium text-sm rounded-full shadow-md">
                    {adminData?.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Edit2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="font-semibold">Edit Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone Number</p>
                        <p className="text-gray-900 font-semibold text-lg">{adminData?.phone_number}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Designation</p>
                        <p className="text-gray-900 font-semibold text-lg">{adminData?.designation || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Member Since</p>
                        <p className="text-gray-900 font-semibold text-lg">
                          {adminData?.createdAt ? formatDate(adminData.createdAt) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                    Biography
                  </h3>
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200">
                    <div className="flex gap-4">
                      <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-md h-fit">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed text-base">
                          {adminData?.bio || 'No biography provided yet.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                Permissions & Access
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {adminData?.permissions && Array.isArray(adminData.permissions) && adminData.permissions.length > 0 ? (
                  adminData.permissions.map((permission: string, index: number) => (
                    <div
                      key={index}
                      className="group px-4 py-3 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-800 text-sm font-medium text-center rounded-xl border border-green-200 hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-default"
                    >
                      <span className="capitalize">{permission.replace(/_/g, ' ')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-full text-center py-8">No permissions available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md transition-all duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 flex items-center justify-between z-10">
              <h3 className="text-2xl font-bold text-white">Update Profile</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all group"
              >
                <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-88px)] p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                >
                  <option value="admin">Admin</option>
                  <option value="content_manager">Content Manager</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Biography</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Image</label>
                
                {formData.image && (
                  <div className="mb-4 flex justify-center">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-lg opacity-30"></div>
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-green-100"
                      />
                    </div>
                  </div>
                )}

                <label className="block cursor-pointer">
                  <div className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all">
                    {uploadingImage ? (
                      <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-500" />
                    )}
                    <span className="text-sm font-medium text-gray-600">
                      {uploadingImage ? 'Uploading...' : 'Choose Image'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                
                <div className="mt-3">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="Or paste image URL"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updating && <Loader2 className="w-5 h-5 animate-spin" />}
                  {updating ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}