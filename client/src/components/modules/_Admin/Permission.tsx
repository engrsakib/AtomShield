"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Shield, CheckCircle2, XCircle, ArrowLeft, History, Clock, ShieldAlert, PlusCircle, MinusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2"; // SweetAlert2 ইম্পোর্ট করা হয়েছে

// --- Helpers ---
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

enum PermissionEnum {
  CREATE_STUDENT = "create_student",
  VIEW_STUDENT = "view_student",
  UPDATE_STUDENT = "update_student",
  DELETE_STUDENT = "delete_student",
  CREATE_EXAM = "create_exam",
  VIEW_EXAM = "view_exam",
  UPDATE_EXAM = "update_exam",
  DELETE_EXAM = "delete_exam",
  CREATE_QUESTION = "create_question",
  VIEW_QUESTION = "view_question",
  UPDATE_QUESTION = "update_question",
  DELETE_QUESTION = "delete_question",
  CREATE_BOOK = "create_book",
  VIEW_BOOK = "view_book",
  UPDATE_BOOK = "update_book",
  DELETE_BOOK = "delete_book",
  CREATE_GUIDELINE = "create_guideline",
  VIEW_GUIDELINE = "view_guideline",
  UPDATE_GUIDELINE = "update_guideline",
  DELETE_GUIDELINE = "delete_guideline",
  CREATE_STAFF = "create_staff",
  VIEW_STAFF = "view_staff",
  UPDATE_STAFF = "update_staff",
  DELETE_STAFF = "delete_staff",
  CHECK_RESULT = "check_result",
  MANAGE_PERMISSIONS = "manage_permissions",
  PERMISSIONS_AUDIT = "permissions_audit",
  PERMISSIONS_VIEW = "permissions_view",
}

export default function ManagePermissions() {
  const router = useRouter();
  const [adminId, setAdminId] = useState<string>("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  const [myPermissions, setMyPermissions] = useState<string[]>([]);
  const [hasViewAccess, setHasViewAccess] = useState(true);

  const permissionGroups = [
    { title: "Staff & Management", icon: "👥", permissions: [
      { key: PermissionEnum.CREATE_STAFF, label: "Create Staff" },
      { key: PermissionEnum.VIEW_STAFF, label: "View Staff" },
      { key: PermissionEnum.CHECK_RESULT, label: "Check Result" },
      { key: PermissionEnum.MANAGE_PERMISSIONS, label: "Manage Permissions" },
      { key: PermissionEnum.PERMISSIONS_AUDIT, label: "Permissions Audit" },
      { key: PermissionEnum.PERMISSIONS_VIEW, label: "View Permissions" },
    ]},
    {
      title: "Book",
      icon: "📚",
      permissions: [
        { key: PermissionEnum.CREATE_BOOK, label: "Create Book" },
        { key: PermissionEnum.VIEW_BOOK, label: "View Book" },
        { key: PermissionEnum.UPDATE_BOOK, label: "Update Book" },
        { key: PermissionEnum.DELETE_BOOK, label: "Delete Book" },
      ],
    },
    {
      title: "Guideline",
      icon: "📋",
      permissions: [
        { key: PermissionEnum.CREATE_GUIDELINE, label: "Create Guideline" },
        { key: PermissionEnum.VIEW_GUIDELINE, label: "View Guideline" },
        { key: PermissionEnum.UPDATE_GUIDELINE, label: "Update Guideline" },
        { key: PermissionEnum.DELETE_GUIDELINE, label: "Delete Guideline" },
      ],
    },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setAdminId(id);
      fetchPermissionsForId(id);
    }
  }, []);

  const fetchPermissionsForId = async (id: string) => {
    try {
      setLoading(true);
      const accessToken = getCookie("access_token");
      if (!accessToken) return router.push("/login");

      const meRes = await fetch(`${BASE_URL}/admin/auth`, {
        headers: { "Authorization": accessToken }
      });
      const meJson = await meRes.json();
      if (meJson.success) {
        const perms = meJson.data.permissions || [];
        setMyPermissions(perms);
        if (!perms.includes(PermissionEnum.PERMISSIONS_VIEW)) {
          setHasViewAccess(false);
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`${BASE_URL}/admin/${id}`, {
        headers: { "Authorization": accessToken }
      });
      const json = await res.json();
      if (json.success) {
        setSelectedPermissions(json.data.permissions || []);
        setAuditLogs(json.data.audit_logs || []);
      }
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Could not connect to the server.',
        confirmButtonColor: '#166534'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (permission: string) => {
    setSelectedPermissions(prev => prev.includes(permission) ? prev.filter(p => p !== permission) : [...prev, permission]);
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      const accessToken = getCookie("access_token");
      const res = await fetch(`${BASE_URL}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": accessToken! },
        body: JSON.stringify({ id: adminId, permissions: selectedPermissions }),
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire({
          icon: 'success',
          title: 'Saved!',
          text: 'Permissions updated successfully.',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        fetchPermissionsForId(adminId); 
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: json.message || "Something went wrong",
          confirmButtonColor: '#166534'
        });
      }
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: 'Error saving data to the server.',
        confirmButtonColor: '#166534'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!hasViewAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50">
        <div className="max-w-md p-8 bg-white border border-red-100 shadow-2xl rounded-2xl">
          <ShieldAlert className="w-20 h-20 mx-auto mb-4 text-red-500 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don't have the <code className="px-2 py-1 font-mono text-sm text-red-700 rounded bg-red-50">permissions_view</code> right.</p>
          <button onClick={() => router.back()} className="w-full py-3 mt-6 text-white transition-all bg-gray-900 rounded-xl hover:bg-black">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 font-sans bg-gray-50 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 mb-2 text-gray-500 transition-colors hover:text-green-800">
            <ArrowLeft className="w-4 h-4" /> <span>Back to List</span>
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Manage Permissions</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {myPermissions.includes(PermissionEnum.PERMISSIONS_AUDIT) && (
            <button 
              onClick={() => setShowAudit(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-green-200 text-green-800 rounded-xl hover:bg-green-50 transition-all shadow-sm font-semibold"
            >
              <History className="w-5 h-5" /> Audit History
            </button>
          )}
          <button onClick={() => fetchPermissionsForId(adminId)} className="px-5 py-2.5 bg-green-800 text-white rounded-xl hover:bg-green-900 transition-all shadow-md font-semibold">
            Reload
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl lg:col-span-2">
          <label className="block mb-3 text-xs font-bold tracking-widest text-gray-400 uppercase">Target Admin Identifier</label>
          <input 
            type="text" value={adminId} readOnly
            className="w-full px-4 py-3 font-mono text-gray-500 border-none outline-none cursor-not-allowed bg-gray-50 rounded-xl"
          />
        </div>
        <div className="p-6 text-white bg-green-800 shadow-lg rounded-2xl">
          <p className="text-xs font-bold text-green-100 uppercase">Active Permissions</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-4xl font-black">{selectedPermissions.length}</span>
            <span className="mb-1 text-lg text-green-300">/ {Object.keys(PermissionEnum).length}</span>
          </div>
        </div>
      </div>

      {/* Permission Grid */}
      <div className="grid grid-cols-1 gap-6 mb-24 md:grid-cols-2">
        {permissionGroups.map((group) => (
          <div key={group.title} className="overflow-hidden transition-shadow bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="flex items-center gap-2 font-bold text-gray-800">
                <span className="text-xl">{group.icon}</span> {group.title}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2 p-4">
              {group.permissions.map((p) => {
                const isSelected = selectedPermissions.includes(p.key);
                return (
                  <div 
                    key={p.key} onClick={() => handleTogglePermission(p.key)}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all duration-200 ${isSelected ? "bg-green-50 border-green-200 shadow-sm" : "bg-white border-transparent hover:bg-gray-50"}`}
                  >
                    <span className={`font-medium ${isSelected ? "text-green-900" : "text-gray-600"}`}>{p.label}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "bg-green-800 border-green-800 scale-110" : "border-gray-200"}`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
        <button 
          onClick={handleSavePermissions} disabled={saving}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl shadow-2xl hover:bg-black flex items-center justify-center gap-3 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          Update Permissions
        </button>
      </div>

      {/* --- Audit Modal --- */}
      {showAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 duration-300 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-800 rounded-xl text-white shadow-lg shadow-green-200"><History className="w-5 h-5" /></div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Activity History</h2>
                  <p className="text-xs text-gray-500">Real-time permission changes</p>
                </div>
              </div>
              <button onClick={() => setShowAudit(false)} className="p-2 text-gray-400 transition-colors rounded-full hover:bg-gray-200 hover:text-gray-900"><XCircle className="w-7 h-7" /></button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto bg-white">
              {auditLogs.length > 0 ? (
                auditLogs.slice().reverse().map((log) => (
                  <div key={log._id} className="relative pb-6 pl-8 border-l-2 border-gray-200 border-dashed last:border-0">
                    <div className="absolute -left-[11px] top-0 w-5 h-5 bg-white border-4 border-green-600 rounded-full shadow-sm" />
                    
                    <div className="p-5 transition-colors border border-gray-100 bg-gray-50 rounded-2xl hover:border-green-200">
                      <div className="flex items-start justify-between mb-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-tighter ${
                          log.action === 'created' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {log.action}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
                          <Clock className="w-3 h-3" /> {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>

                      {/* Added Permissions */}
                      {log.added && log.added.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-1.5 mb-2 text-green-700">
                            <PlusCircle className="w-4 h-4" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Added Access</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {log.added.map((p: string) => (
                              <span key={p} className="text-[10px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-md border border-green-200/50 shadow-sm">
                                {p.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Removed Permissions */}
                      {log.removed && log.removed.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-1.5 mb-2 text-red-700">
                            <MinusCircle className="w-4 h-4" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Revoked Access</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {log.removed.map((p: string) => (
                              <span key={p} className="text-[10px] font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-md border border-red-200/50 shadow-sm">
                                {p.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer: User Identity */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200/60">
                        <div className="flex items-center justify-center w-10 h-10 text-xs font-black text-white bg-gray-900 shadow-md rounded-xl">
                          {log.changedBy?.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="flex items-center gap-2 text-sm font-bold text-gray-900">
                            {log.changedBy?.name}
                            <span className="text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">
                              {log.changedBy?.role}
                            </span>
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium leading-none mt-0.5">{log.changedBy?.phone_number}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <History className="w-16 h-16 mb-4 opacity-10" />
                  <p className="font-medium">No activity recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}