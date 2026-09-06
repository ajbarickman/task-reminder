"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Check,
  Sparkles,
  BookOpen,
  GraduationCap,
  Clock,
  Trophy,
  Calendar,
  Flame,
  ChevronRight,
  Smile,
  PartyPopper,
} from "lucide-react";
import { TaskItem } from "@/lib/tasks-service";

interface SonViewProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const CATEGORY_ICONS = {
  CHORE: { icon: Sparkles, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-950/60", label: "Chore" },
  TEST: { icon: GraduationCap, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-950/60", label: "Test / Quiz" },
  HOMEWORK: { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-950/60", label: "Homework" },
  REMINDER: { icon: Clock, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-950/60", label: "Reminder" },
};

export const SonView: React.FC<SonViewProps> = ({ tasks, onToggleTask }) => {
  const [selectedTab, setSelectedTab] = useState<"TODAY" | "UPCOMING" | "ALL">("TODAY");

  const todayStr = new Date().toDateString();

  const handleCheck = async (id: string, currentlyCompleted: boolean) => {
    // If checking as complete, trigger celebratory confetti!
    if (!currentlyCompleted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#6366f1", "#10b981", "#f59e0b", "#ec4899"],
      });
    }
    await onToggleTask(id);
  };

  // Classify tasks
  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  const todayTasks = tasks.filter((t) => {
    const d = new Date(t.dueDate);
    return d.toDateString() === todayStr;
  });

  const todayPending = todayTasks.filter((t) => !t.isCompleted);
  const todayDone = todayTasks.filter((t) => t.isCompleted);

  const displayTasks =
    selectedTab === "TODAY"
      ? todayTasks.length > 0
        ? todayTasks
        : tasks.filter((t) => !t.isCompleted) // Fallback if no tasks today
      : selectedTab === "UPCOMING"
      ? tasks.filter((t) => !t.isCompleted && new Date(t.dueDate).toDateString() !== todayStr)
      : tasks;

  const totalToday = todayTasks.length || 1;
  const progressPercent = Math.round((todayDone.length / totalToday) * 100);

  return (
    <div className="space-y-6">
      {/* Son's Hero Motivation Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-6 text-white shadow-xl shadow-emerald-600/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-2xl bg-white/20 backdrop-blur-md">
              <Trophy className="w-6 h-6 text-amber-300" />
            </span>
            <div>
              <h2 className="text-xl font-black tracking-tight">Today&apos;s Missions</h2>
              <p className="text-xs text-emerald-100 font-medium">Keep up the great streak!</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Ready</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span>
              {todayDone.length} of {todayTasks.length} Completed
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-3 p-0.5 backdrop-blur-sm">
            <div
              className="bg-gradient-to-r from-amber-300 to-emerald-200 h-2 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Celebratory message if all today are done */}
        {todayTasks.length > 0 && todayPending.length === 0 && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-white/20 rounded-2xl backdrop-blur-md text-xs font-bold">
            <PartyPopper className="w-5 h-5 text-amber-300" />
            <span>All missions done for today! High five! ✋</span>
          </div>
        )}
      </div>

      {/* Filter Selector */}
      <div className="grid grid-cols-3 gap-2 bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
        <button
          onClick={() => setSelectedTab("TODAY")}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            selectedTab === "TODAY"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          Today ({todayTasks.length})
        </button>
        <button
          onClick={() => setSelectedTab("UPCOMING")}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            selectedTab === "UPCOMING"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setSelectedTab("ALL")}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            selectedTab === "ALL"
              ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          All Tasks
        </button>
      </div>

      {/* Task Checklist Items */}
      <div className="space-y-3">
        {displayTasks.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
            <Smile className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-zinc-900 dark:text-white text-base">No tasks to do right now!</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              You&apos;re completely caught up. Great job!
            </p>
          </div>
        ) : (
          displayTasks.map((task) => {
            const meta = CATEGORY_ICONS[task.category] || CATEGORY_ICONS.REMINDER;
            const Icon = meta.icon;
            const due = new Date(task.dueDate);
            const isToday = due.toDateString() === todayStr;

            return (
              <div
                key={task.id}
                onClick={() => handleCheck(task.id, task.isCompleted)}
                className={`relative cursor-pointer select-none rounded-2xl border p-4 transition-all duration-200 active:scale-[0.99] ${
                  task.isCompleted
                    ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40 opacity-75"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-emerald-400 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Big Touch-Friendly Checkbox */}
                  <div
                    className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      task.isCompleted
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400"
                        : "border-2 border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800"
                    }`}
                  >
                    {task.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${meta.bg} ${meta.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        {meta.label}
                      </span>

                      {task.category === "TEST" && (
                        <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white font-extrabold text-[10px] tracking-wide animate-pulse">
                          TEST COMING UP
                        </span>
                      )}

                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {isToday ? "Due Today at " : due.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " "}
                        {due.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>

                    <h3
                      className={`text-base font-bold text-zinc-900 dark:text-white leading-snug transition-colors ${
                        task.isCompleted ? "line-through text-zinc-400 dark:text-zinc-500" : ""
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.notes && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 bg-zinc-100/80 dark:bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                        {task.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
