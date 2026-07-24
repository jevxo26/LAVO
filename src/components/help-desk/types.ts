// ─── Data interfaces ──────────────────────────────────────────────────────────

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Assignee {
  id: string;
  fullName: string;
  userType: string;
}

// ─── Style helpers ────────────────────────────────────────────────────────────

export function priorityStyle(p: string): { cls: string; dot: string; label: string } {
  switch (p.toUpperCase()) {
    case "URGENT": return { cls: "bg-rose-50 text-rose-700 border-rose-200",      dot: "bg-rose-500",   label: "Urgent"  };
    case "HIGH":   return { cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", label: "High"    };
    case "MEDIUM": return { cls: "bg-amber-50 text-amber-700 border-amber-200",    dot: "bg-amber-400",  label: "Medium"  };
    default:       return { cls: "bg-slate-50 text-slate-600 border-slate-200",    dot: "bg-slate-400",  label: "Normal"  };
  }
}

export function statusStyle(s: string): { cls: string; dot: string; label: string } {
  switch (s) {
    case "enabled-live-chat": return { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500 animate-pulse", label: "Live Chat"      };
    case "solved":            return { cls: "bg-indigo-50 text-indigo-700 border-indigo-200",    dot: "bg-indigo-500",               label: "Solved"         };
    case "pendingReview":     return { cls: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-400",                label: "Pending Review" };
    default:                  return { cls: "bg-slate-50 text-slate-600 border-slate-200",       dot: "bg-slate-400",                label: s                };
  }
}
