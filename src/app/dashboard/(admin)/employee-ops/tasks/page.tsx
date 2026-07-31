"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipboardList, RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/employee-ops/tasks");
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="text-blue-600" />
            Branch Employee Task Operations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Assign, track, and monitor daily operational tasks for branch staff.
          </p>
        </div>
        <button
          onClick={fetchTasks}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Tasks
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Task Title</th>
                <th className="py-3.5 px-6">Assigned Employee</th>
                <th className="py-3.5 px-6">Branch</th>
                <th className="py-3.5 px-6">Priority</th>
                <th className="py-3.5 px-6">Due Date</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{t.title}</td>
                  <td className="py-4 px-6 font-semibold text-slate-800">{t.assignedTo}</td>
                  <td className="py-4 px-6 font-medium text-slate-700">{t.branchName}</td>
                  <td className="py-4 px-6 text-xs">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        t.priority === "HIGH"
                          ? "bg-red-100 text-red-700"
                          : t.priority === "MEDIUM"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> {t.dueDate}
                  </td>
                  <td className="py-4 px-6 text-xs">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        t.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : t.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {t.status}
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
