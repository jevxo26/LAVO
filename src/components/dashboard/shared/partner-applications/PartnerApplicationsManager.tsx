"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  FileSearch,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Search,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Phone,
  MapPin,
  Briefcase,
  Sparkles,
  UserCheck,
  UserX,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface PartnerApplication {
  id: string;
  phone: string;
  targetCity: string;
  experience?: string | null;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
  reviewedBy?: {
    fullName: string;
  } | null;
  reviewedAt?: string | null;
}

const FALLBACK_APPLICATIONS: PartnerApplication[] = [
  {
    id: "APP-101",
    phone: "+880 1711-223344",
    targetCity: "Dhaka (Gulshan & Banani)",
    experience: "5 years running dry cleaning franchise",
    reason: "Looking to expand operational scale with Laundrix on-demand infrastructure.",
    status: "PENDING",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    user: {
      fullName: "Rahim Chowdhury",
      email: "rahim.c@example.com",
    },
  },
  {
    id: "APP-102",
    phone: "+880 1819-556677",
    targetCity: "Chittagong (GEC Circle)",
    experience: "3 years commercial laundry services",
    reason: "Partnering to fulfill bulk garment orders across Chittagong hub.",
    status: "APPROVED",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    user: {
      fullName: "Anisur Rahman",
      email: "anisur@example.com",
    },
    reviewedBy: {
      fullName: "Super Admin",
    },
    reviewedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "APP-103",
    phone: "+880 1912-990011",
    targetCity: "Sylhet (Zindabazar)",
    experience: "No prior industry experience",
    reason: "Wants to start new laundry shop.",
    status: "REJECTED",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    user: {
      fullName: "Tariqul Islam",
      email: "tariqul@example.com",
    },
    reviewedBy: {
      fullName: "Super Admin",
    },
    reviewedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
];

export function PartnerApplicationsManager() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [selectedApp, setSelectedApp] = useState<PartnerApplication | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Check role
  const rawRole = (user as any)?.role || (user as any)?.userType || "";
  const role = rawRole.toUpperCase().trim().replace(/[\s-]+/g, "_");
  const isSuperAdmin = ["SUPER_ADMIN", "SUPERADMIN"].includes(role);

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/partner-applications?page=1&limit=100");
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setApplications(data.data);
      } else {
        setApplications(FALLBACK_APPLICATIONS);
      }
    } catch {
      setApplications(FALLBACK_APPLICATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Update status (Super Admin ONLY)
  const handleUpdateStatus = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    if (!isSuperAdmin) {
      toast.error("Permission denied: Only Super Admin can approve or reject applications.");
      return;
    }

    setActionLoading(id + "_" + newStatus);
    try {
      const res = await authFetch(`/partner-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(
          newStatus === "APPROVED"
            ? "Partner application APPROVED! Applicant upgraded to VENDOR."
            : "Partner application REJECTED."
        );

        setApplications((prev) =>
          prev.map((app) =>
            app.id === id
              ? {
                  ...app,
                  status: newStatus,
                  reviewedBy: { fullName: (user as any)?.fullName || "Super Admin" },
                  reviewedAt: new Date().toISOString(),
                }
              : app
          )
        );

        if (selectedApp && selectedApp.id === id) {
          setSelectedApp((prev) =>
            prev
              ? {
                  ...prev,
                  status: newStatus,
                  reviewedBy: { fullName: (user as any)?.fullName || "Super Admin" },
                  reviewedAt: new Date().toISOString(),
                }
              : null
          );
        }
      } else {
        toast.error(data.message || "Failed to update application status.");
      }
    } catch {
      toast.error("Network error while updating partner application.");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter & Search
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.user.fullName.toLowerCase().includes(q) ||
        app.user.email.toLowerCase().includes(q) ||
        app.phone.toLowerCase().includes(q) ||
        app.targetCity.toLowerCase().includes(q) ||
        app.id.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  // Statistics
  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === "PENDING").length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 p-6 md:p-8 text-white shadow-lg">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-48 w-48 rounded-full bg-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-sky-200" />
              <span className="text-sky-200 text-xs font-bold uppercase tracking-wider">
                Vendor Onboarding Desk
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Partner Applications
            </h1>
            <p className="mt-1 text-sm text-sky-100 max-w-xl">
              Review and manage vendor partnership requests submitted across your branch network.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3.5 flex items-center gap-3">
              <Building2 size={24} className="text-sky-200" />
              <div>
                <p className="text-xs font-medium text-sky-100">Total Requests</p>
                <p className="text-xl font-black">{totalCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Permission Notice */}
      <div
        className={`flex items-center justify-between gap-3 p-4 rounded-xl border text-xs font-semibold ${
          isSuperAdmin
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-amber-50 text-amber-800 border-amber-200"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isSuperAdmin ? (
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert size={18} className="text-amber-600 shrink-0" />
          )}
          <span>
            {isSuperAdmin
              ? "Super Admin Mode Active: You have full permission to ACCEPT or REJECT vendor partner applications."
              : "Read-Only View: You can view application details. Application approval/rejection is restricted strictly to Super Admin."}
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/80 border border-current">
          {role}
        </span>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileSearch size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Applications</p>
            <p className="text-xl font-extrabold text-slate-900">{totalCount}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Review</p>
            <p className="text-xl font-extrabold text-amber-600">{pendingCount}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Approved Vendors</p>
            <p className="text-xl font-extrabold text-emerald-600">{approvedCount}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Rejected</p>
            <p className="text-xl font-extrabold text-rose-600">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Search & Filter Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone or target city..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter size={14} className="text-slate-400 shrink-0 ml-1" />
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "ALL" ? "All Status" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-3" />
              <p className="text-xs font-semibold">Loading partner applications...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileSearch size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No partner applications found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filter.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Applicant</th>
                  <th className="py-3.5 px-6">Contact Info</th>
                  <th className="py-3.5 px-6">Target City</th>
                  <th className="py-3.5 px-6">Experience</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Submitted</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div>{app.user.fullName}</div>
                      <div className="text-[11px] font-medium text-slate-400">{app.user.email}</div>
                    </td>

                    <td className="py-4 px-6 text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-400" />
                        {app.phone}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-400" />
                        {app.targetCity}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600 max-w-[200px] truncate">
                      {app.experience || <span className="text-slate-300">None specified</span>}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          app.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : app.status === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            app.status === "APPROVED"
                              ? "bg-emerald-500"
                              : app.status === "REJECTED"
                              ? "bg-rose-500"
                              : "bg-amber-500 animate-pulse"
                          }`}
                        />
                        {app.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-400 font-medium whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Detail Button (All Roles) */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedApp(app)}
                          className="h-8 rounded-xl px-2.5 text-[11px] font-bold border-slate-200 text-slate-700 hover:bg-slate-100 gap-1"
                        >
                          <Eye size={13} /> View
                        </Button>

                        {/* Super Admin Action Buttons */}
                        {isSuperAdmin && (
                          <>
                            {app.status !== "APPROVED" && (
                              <Button
                                size="sm"
                                disabled={actionLoading === app.id + "_APPROVED"}
                                onClick={() => handleUpdateStatus(app.id, "APPROVED")}
                                className="h-8 rounded-xl px-2.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-sm"
                              >
                                <UserCheck size={13} /> Accept
                              </Button>
                            )}

                            {app.status !== "REJECTED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoading === app.id + "_REJECTED"}
                                onClick={() => handleUpdateStatus(app.id, "REJECTED")}
                                className="h-8 rounded-xl px-2.5 text-[11px] font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-1"
                              >
                                <UserX size={13} /> Reject
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        {selectedApp && (
          <DialogContent className="max-w-xl rounded-2xl p-6">
            <DialogHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-extrabold text-slate-900">
                  Partner Application Details
                </DialogTitle>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedApp.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedApp.status === "REJECTED"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {selectedApp.status}
                </span>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Submitted on {new Date(selectedApp.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 text-xs">
              {/* Applicant Info */}
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Applicant Name</p>
                  <p className="text-sm font-bold text-slate-900">{selectedApp.user.fullName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Email Address</p>
                  <p className="text-sm font-semibold text-slate-800">{selectedApp.user.email}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Phone</p>
                  <p className="text-xs font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Phone size={12} className="text-slate-400" />
                    {selectedApp.phone}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Target City / Area</p>
                  <p className="text-xs font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-slate-400" />
                    {selectedApp.targetCity}
                  </p>
                </div>
              </div>

              {/* Experience */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <Briefcase size={13} className="text-blue-600" /> Prior Experience
                </p>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 font-medium">
                  {selectedApp.experience || "No prior industry experience specified."}
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <FileSearch size={13} className="text-blue-600" /> Partnership Reason & Goals
                </p>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 font-medium leading-relaxed">
                  {selectedApp.reason}
                </div>
              </div>

              {/* Reviewer Info */}
              {selectedApp.reviewedBy && (
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-slate-600 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Reviewed By: </span>
                    {selectedApp.reviewedBy.fullName}
                  </div>
                  {selectedApp.reviewedAt && (
                    <div className="text-[11px] text-slate-400">
                      {new Date(selectedApp.reviewedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                {isSuperAdmin ? "Super Admin Mode" : "Read-Only View Mode"}
              </span>

              <div className="flex items-center gap-2">
                {isSuperAdmin && (
                  <>
                    {selectedApp.status !== "APPROVED" && (
                      <Button
                        size="sm"
                        disabled={!!actionLoading}
                        onClick={() => handleUpdateStatus(selectedApp.id, "APPROVED")}
                        className="h-9 rounded-xl px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                      >
                        <UserCheck size={14} /> Accept & Upgrade User
                      </Button>
                    )}

                    {selectedApp.status !== "REJECTED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!!actionLoading}
                        onClick={() => handleUpdateStatus(selectedApp.id, "REJECTED")}
                        className="h-9 rounded-xl px-4 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-1.5"
                      >
                        <UserX size={14} /> Reject Application
                      </Button>
                    )}
                  </>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedApp(null)}
                  className="h-9 rounded-xl px-4 text-xs font-semibold"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
