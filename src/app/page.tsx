"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ParentView } from "@/components/ParentView";
import { SonView } from "@/components/SonView";
import { TaskItem } from "@/lib/tasks-service";
import { Smartphone, ShieldCheck, CheckCircle2, RefreshCw } from "lucide-react";

export default function HomePage() {
  const [currentRole, setCurrentRole] = useState<"PARENT" | "CHILD">("PARENT");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks on mount
  const loadTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error("Failed to load tasks:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = async (taskData: {
    title: string;
    category: "CHORE" | "TEST" | "HOMEWORK" | "REMINDER";
    notes?: string;
    dueDate: string;
    assignedToName: string;
    sendSms?: boolean;
    sonPhoneNumber?: string;
  }) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (data.success && data.task) {
        setTasks((prev) => [...prev, data.task]);
      }
    } catch (e) {
      console.error("Failed to add task:", e);
    }
  };

  const handleToggleTask = async (id: string) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isCompleted: !t.isCompleted,
              completedAt: !t.isCompleted ? new Date().toISOString() : null,
            }
          : t
      )
    );

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success && data.task) {
        setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
      }
    } catch (e) {
      console.error("Failed to toggle task:", e);
      // Revert if error
      loadTasks();
    }
  };

  const handleDeleteTask = async (id: string) => {
    // Optimistic UI update
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await fetch(`/api/tasks?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.error("Failed to delete task:", e);
      loadTasks();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      <Navbar currentRole={currentRole} onRoleChange={setCurrentRole} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
        {/* Device Switch Helper Pill (Convenient for mobile testing) */}
        <div className="mb-5 flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>
              Previewing on phone as:{" "}
              <strong className="text-zinc-900 dark:text-white">
                {currentRole === "PARENT" ? "Parent (Organizer)" : "Son (Checklist)"}
              </strong>
            </span>
          </div>

          <button
            onClick={() => setCurrentRole(currentRole === "PARENT" ? "CHILD" : "PARENT")}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Switch to {currentRole === "PARENT" ? "Son's Phone" : "Parent's Phone"}</span>
          </button>
        </div>

        {/* Dynamic View */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
            <p className="text-sm font-medium">Loading your family tasks...</p>
          </div>
        ) : currentRole === "PARENT" ? (
          <ParentView
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            isLoading={isLoading}
          />
        ) : (
          <SonView tasks={tasks} onToggleTask={handleToggleTask} isLoading={isLoading} />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
        <p>TaskMate Reminders • Built with Next.js, Auth.js & Vercel Postgres</p>
      </footer>
    </div>
  );
}
