"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, User, Sparkles, LogIn } from "lucide-react";

interface NavbarProps {
  currentRole: "PARENT" | "CHILD";
  onRoleChange: (role: "PARENT" | "CHILD") => void;
  userName?: string;
  userEmail?: string;
  userImage?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  userName,
  userEmail,
  userImage,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white leading-none">
              FamilyTask
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Sync reminders & chores
            </p>
          </div>
        </div>

        {/* Role Toggle Switcher */}
        <div className="flex items-center space-x-2">
          <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl flex items-center border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => onRoleChange("PARENT")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === "PARENT"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Parent</span>
            </button>
            <button
              onClick={() => onRoleChange("CHILD")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === "CHILD"
                  ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Son</span>
            </button>
          </div>

          {/* User Icon */}
          <div className="relative group">
            {userImage ? (
              <img
                src={userImage}
                alt={userName || "User"}
                className="w-8 h-8 rounded-full ring-2 ring-indigo-500/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
