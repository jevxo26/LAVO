"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axios from "axios";
import { toast } from "sonner";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleCreated: () => void;
}

export function CreateRoleModal({ isOpen, onClose, onRoleCreated }: CreateRoleModalProps) {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !displayName) {
      toast.error("Role name and display name are required");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/roles", { name, displayName, description });
      toast.success("Custom role created successfully");
      setName("");
      setDisplayName("");
      setDescription("");
      onRoleCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Create Custom Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Role Key Name (e.g., MARKETING_MANAGER)</label>
            <input
              type="text"
              placeholder="e.g. OPERATIONS_COORDINATOR"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Display Name (e.g., Operations Coordinator)</label>
            <input
              type="text"
              placeholder="e.g. Operations Coordinator"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-slate-500">Description</label>
            <textarea
              placeholder="Enter role description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors border border-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Role"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
