"use client";

import React, { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";

interface ProfileAvatarProps {
  fullName: string;
  avatarUrl: string;
  onAvatarChange: (newUrl: string) => void;
  isUploading?: boolean;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  fullName,
  avatarUrl,
  onAvatarChange,
  isUploading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) onAvatarChange(event.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl border border-border bg-card shadow-sm">
      {/* Avatar circle */}
      <div className="relative group shrink-0">
        <div
          className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-md flex items-center justify-center text-white text-2xl font-black"
          style={{
            borderColor: "var(--card)",
            background: "linear-gradient(135deg, var(--primary), var(--ring))",
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <span>{getInitials(fullName)}</span>
          )}

          {/* Upload spinner overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full"
              style={{ background: "rgba(0,0,0,0.5)" }}>
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Camera button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title="Upload new avatar"
          className="absolute bottom-0 right-0 p-2 rounded-full text-white shadow-md transition-all hover:scale-105 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
        >
          <Camera size={16} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Text */}
      <div className="text-center sm:text-left space-y-1">
        <h2 className="text-xl font-black text-card-foreground">{fullName || "User Profile"}</h2>
        <p className="text-xs text-muted-foreground font-medium">
          PNG, JPG, or WEBP up to 5MB. Click camera icon to update photo.
        </p>
      </div>
    </div>
  );
};
