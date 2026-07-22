import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SummaryCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  accent?: "default" | "green" | "amber" | "blue" | "violet";
};

const accentStyles = {
  default: "bg-slate-100 text-slate-600",
  green:   "bg-emerald-100 text-emerald-600",
  amber:   "bg-amber-100 text-amber-600",
  blue:    "bg-blue-100 text-blue-600",
  violet:  "bg-violet-100 text-violet-600",
};

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
  accent = "default",
}: SummaryCardProps) {
  return (
    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">{title}</p>
            <h2 className="text-2xl font-bold text-slate-900">{value}</h2>
            {description && (
              <p className="text-xs text-slate-400">{description}</p>
            )}
          </div>
          <div className={cn("rounded-lg p-2.5", accentStyles[accent])}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
