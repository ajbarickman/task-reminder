"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  GraduationCap,
  Sparkles,
  AlertCircle,
  ChevronDown,
  Info,
  Check,
} from "lucide-react";
import { TaskItem } from "@/lib/tasks-service";

interface ParentViewProps {
  tasks: TaskItem[];
  onAddTask: (taskData: {
    title: string;
    category: "CHORE" | "TEST" | "HOMEWORK" | "REMINDER";
    notes?: string;
    dueDate: string;
    assignedToName: string;
    sendSms?: boolean;
    sonPhoneNumber?: string;
  }) => Promise<any>;
  onToggleTask: (id: string) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const CATEGORY_META = {
  CHORE: {
    label: "Chore",
    icon: Sparkles,
    badgeBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  TEST: {
    label: "School Test",
    icon: GraduationCap,
    badgeBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
  HOMEWORK: {
    label: "Homework",
    icon: BookOpen,
    badgeBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  REMINDER: {
    label: "Reminder",
    icon: Clock,
    badgeBg: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
};

export const ParentView: React.FC<ParentViewProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  isLoading,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [statusBanner, setStatusBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"CHORE" | "TEST" | "HOMEWORK" | "REMINDER">("CHORE");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setHours(18, 0, 0, 0);
    return d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  });
  const [notes, setNotes] = useState("");
  const [sendSms, setSendSms] = useState(true);
  const [sonPhoneNumber, setSonPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved phone number from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("son_phone_number");
    if (saved) setSonPhoneNumber(saved);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (sendSms && sonPhoneNumber) {
      localStorage.setItem("son_phone_number", sonPhoneNumber);
    }

    setIsSubmitting(true);
    setStatusBanner(null);
    try {
      const smsResult = await onAddTask({
        title: title.trim(),
        category,
        dueDate: new Date(dueDate).toISOString(),
        notes: notes.trim() || undefined,
        assignedToName: "Son",
        sendSms,
        sonPhoneNumber: sonPhoneNumber.trim() || undefined,
      });
      setTitle("");
      setNotes("");
      setShowAddForm(false);

      if (sendSms && sonPhoneNumber) {
        if (smsResult?.success) {
          setStatusBanner({
            type: "success",
            message: `📱 SMS text sent successfully to ${sonPhoneNumber}!`,
          });
        } else if (smsResult?.error) {
          setStatusBanner({
            type: "error",
            message: `⚠️ Task saved, but Twilio SMS failed: ${smsResult.error}`,
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      setStatusBanner({
        type: "error",
        message: `Error: ${err.message || "Failed to save task"}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "PENDING") return !task.isCompleted;
    if (activeFilter === "COMPLETED") return task.isCompleted;
    return task.category === activeFilter;
  });

  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const pendingCount = totalTasks - completedCount;

  return (
    <div className="space-y-6">
      {/* Toast / Status Banner */}
      {statusBanner && (
        <div
          className={`p-4 rounded-2xl flex items-start justify-between gap-3 border shadow-sm transition-all ${
            statusBanner.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
              : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800"
          }`}
        >
          <div className="flex items-start gap-2.5 text-xs font-semibold">
            {statusBanner.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <span>{statusBanner.message}</span>
          </div>
          <button
            onClick={() => setStatusBanner(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-indigo-100 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Parent Controls
            </span>
            <h2 className="text-2xl font-bold tracking-tight">Assign Reminders & Tasks</h2>
            <p className="text-sm text-indigo-100/90 mt-1 max-w-md">
              Create chores, tests, and homework here. Your son sees updates in real-time on his phone.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-indigo-700 font-bold text-sm shadow-md hover:bg-indigo-50 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? "Close Form" : "New Task / Reminder"}</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-indigo-400/30 text-center">
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
            <div className="text-2xl font-black">{pendingCount}</div>
            <div className="text-[11px] font-medium text-indigo-100 uppercase tracking-wider">To Do</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
            <div className="text-2xl font-black">{completedCount}</div>
            <div className="text-[11px] font-medium text-indigo-100 uppercase tracking-wider">Finished</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
            <div className="text-2xl font-black">{totalTasks}</div>
            <div className="text-[11px] font-medium text-indigo-100 uppercase tracking-wider">Total</div>
          </div>
        </div>
      </div>

      {/* Add Task Form Modal/Accordion */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">Add New Task for Son</h3>
            <span className="text-xs text-zinc-500">Syncs immediately</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Science Quiz on Solar System, Fold Laundry..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["CHORE", "TEST", "HOMEWORK", "REMINDER"] as const).map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const Icon = meta.icon;
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
                          : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              Notes or Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Read chapters 3 and 4, then answer the questions on Google Classroom."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* SMS Notification Options */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendSms}
                onChange={(e) => setSendSms(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                📱 Send instant SMS text alert to Son&apos;s iPhone
              </span>
            </label>

            {sendSms && (
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Son&apos;s Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-1234"
                  value={sonPhoneNumber}
                  onChange={(e) => setSonPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                  He will receive a text with the reminder, due time, and link to check it off. (Saved for future tasks)
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Save Reminder"}
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: "ALL", label: "All" },
          { key: "PENDING", label: "To Do" },
          { key: "CHORE", label: "Chores" },
          { key: "TEST", label: "Tests" },
          { key: "HOMEWORK", label: "Homework" },
          { key: "REMINDER", label: "Reminders" },
          { key: "COMPLETED", label: "Completed" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === f.key
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-zinc-900 dark:text-white text-sm">No tasks in this category</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Create a new task above or select a different filter.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const meta = CATEGORY_META[task.category] || CATEGORY_META.REMINDER;
            const Icon = meta.icon;
            const due = new Date(task.dueDate);
            const isToday = due.toDateString() === new Date().toDateString();

            return (
              <div
                key={task.id}
                className={`group p-4 rounded-2xl border transition-all ${
                  task.isCompleted
                    ? "bg-zinc-50/80 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-60"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Toggle button */}
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                        task.isCompleted
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-zinc-300 dark:border-zinc-700 hover:border-emerald-500"
                      }`}
                    >
                      {task.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${meta.badgeBg}`}
                        >
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            isToday
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-zinc-500 dark:text-zinc-400"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {isToday ? "Due Today" : due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          {" at "}
                          {due.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-bold text-zinc-900 dark:text-white leading-snug ${
                          task.isCompleted ? "line-through text-zinc-500 dark:text-zinc-500" : ""
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.notes && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info Card on Google Auth & Vercel Sync */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Google Sign-in & Vercel Postgres:</span>
          When deployed to Vercel, signing in with your Google account lets you manage reminders from your phone, while your son logs in with his Google account on his phone to see his daily checklist.
        </div>
      </div>
    </div>
  );
};
