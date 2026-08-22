"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
}

export function StarRating({ value, onChange, readonly = false, size = 18 }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const display = readonly ? value : hovered || value;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
          aria-label={`${s} stars`}
        >
          <Star
            size={size}
            className={s <= display ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-300"}
          />
        </button>
      ))}
    </div>
  );
}
