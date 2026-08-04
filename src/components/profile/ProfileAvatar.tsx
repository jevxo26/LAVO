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
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onAvatarChange(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{getInitials(fullName)}</span>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center rounded-full">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-all transform hover:scale-105 disabled:opacity-50"
          title="Upload new avatar"
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

      <div className="text-center sm:text-left space-y-1">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{fullName || "User Profile"}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          PNG, JPG, or WEBP up to 5MB. Click camera icon to update photo.
        </p>
      </div>
    </div>
  );
};
