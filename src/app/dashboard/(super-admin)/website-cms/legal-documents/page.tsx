"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function LegalDocumentsCMSPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/website-cms/legal-documents");
      setDocs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Legal Documents & Compliance Terms
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage Terms of Service, Privacy Policy, Refund Policy, and Garment Liability Terms.
          </p>
        </div>
        <button
          onClick={() => toast.success("Drafting new legal policy document...")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus size={14} /> Add Policy Document
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Document Title</th>
                <th className="py-3.5 px-6">Slug</th>
                <th className="py-3.5 px-6">Version</th>
                <th className="py-3.5 px-6">Last Updated</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{d.title}</td>
                  <td className="py-4 px-6 text-xs text-blue-600 font-mono">/{d.slug}</td>
                  <td className="py-4 px-6 font-bold text-slate-700">{d.version}</td>
                  <td className="py-4 px-6 text-xs text-slate-500">{d.lastUpdated}</td>
                  <td className="py-4 px-6 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
