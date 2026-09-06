import { prisma, getPrisma } from "./prisma";
import fs from "fs";
import path from "path";
import os from "os";

export interface TaskItem {
  id: string;
  title: string;
  category: "CHORE" | "TEST" | "HOMEWORK" | "REMINDER";
  notes?: string | null;
  dueDate: string; // ISO string
  isCompleted: boolean;
  completedAt?: string | null;
  assignedToName: string;
  createdByName: string;
  familyId?: string | null;
}

const LOCAL_DATA_FILE =
  process.env.VERCEL || process.env.NODE_ENV === "production"
    ? path.join(os.tmpdir(), "tasks.json")
    : path.join(process.cwd(), ".local-data", "tasks.json");

let inMemoryTasks: TaskItem[] | null = null;

function getInitialTasks(): TaskItem[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return [
    {
      id: "task-1",
      title: "Clean bedroom & organize desk",
      category: "CHORE",
      notes: "Put laundry into the hamper and wipe down desk surface.",
      dueDate: today.toISOString(),
      isCompleted: false,
      assignedToName: "Son",
      createdByName: "Parent",
    },
    {
      id: "task-2",
      title: "History Chapter 5 Quiz Prep",
      category: "TEST",
      notes: "Review flashcards on the American Revolution key dates.",
      dueDate: tomorrow.toISOString(),
      isCompleted: false,
      assignedToName: "Son",
      createdByName: "Parent",
    },
    {
      id: "task-3",
      title: "Math worksheet pages 42-45",
      category: "HOMEWORK",
      notes: "Problems 1 through 20 (odds only). Show your work!",
      dueDate: today.toISOString(),
      isCompleted: false,
      assignedToName: "Son",
      createdByName: "Parent",
    },
    {
      id: "task-4",
      title: "Pack backpack for tomorrow morning",
      category: "REMINDER",
      notes: "Don't forget the signed field trip permission slip and gym clothes.",
      dueDate: today.toISOString(),
      isCompleted: true,
      completedAt: today.toISOString(),
      assignedToName: "Son",
      createdByName: "Parent",
    },
  ];
}

function ensureLocalDataDir() {
  try {
    const dir = path.dirname(LOCAL_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_DATA_FILE)) {
      fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(getInitialTasks(), null, 2), "utf-8");
    }
  } catch (e) {
    // If filesystem is read-only or restricted, fallback to inMemoryTasks
    if (!inMemoryTasks) {
      inMemoryTasks = getInitialTasks();
    }
  }
}

function readLocalTasks(): TaskItem[] {
  try {
    ensureLocalDataDir();
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const raw = fs.readFileSync(LOCAL_DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to read file tasks, using memory:", err);
  }

  if (!inMemoryTasks) {
    inMemoryTasks = getInitialTasks();
  }
  return inMemoryTasks;
}

function writeLocalTasks(tasks: TaskItem[]) {
  try {
    ensureLocalDataDir();
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(tasks, null, 2), "utf-8");
  } catch (e) {
    console.warn("Filesystem write failed, caching in memory:", e);
  }
  inMemoryTasks = tasks;
}

const isDbReady = () => Boolean(getPrisma());

export async function getTasksList(): Promise<TaskItem[]> {
  if (isDbReady()) {
    try {
      const dbTasks = await prisma.task.findMany({
        orderBy: { dueDate: "asc" },
        include: {
          assignedTo: { select: { name: true } },
          createdBy: { select: { name: true } },
        },
      });
      return dbTasks.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category as any,
        notes: t.notes,
        dueDate: t.dueDate.toISOString(),
        isCompleted: t.isCompleted,
        completedAt: t.completedAt ? t.completedAt.toISOString() : null,
        assignedToName: t.assignedTo?.name || "Son",
        createdByName: t.createdBy?.name || "Parent",
        familyId: t.familyId,
      }));
    } catch (e) {
      console.warn("Prisma DB read failed, falling back to local storage:", e);
    }
  }

  return readLocalTasks();
}

export async function addTask(data: {
  title: string;
  category: "CHORE" | "TEST" | "HOMEWORK" | "REMINDER";
  notes?: string;
  dueDate: string;
  assignedToName?: string;
  createdByName?: string;
}): Promise<TaskItem> {
  if (isDbReady()) {
    try {
      const created = await prisma.task.create({
        data: {
          title: data.title,
          category: data.category,
          notes: data.notes || null,
          dueDate: new Date(data.dueDate),
          isCompleted: false,
        },
      });
      return {
        id: created.id,
        title: created.title,
        category: created.category as any,
        notes: created.notes,
        dueDate: created.dueDate.toISOString(),
        isCompleted: created.isCompleted,
        assignedToName: data.assignedToName || "Son",
        createdByName: data.createdByName || "Parent",
      };
    } catch (e) {
      console.warn("Prisma DB write failed, falling back to local storage:", e);
    }
  }

  const tasks = readLocalTasks();
  const newTask: TaskItem = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: data.title,
    category: data.category,
    notes: data.notes || null,
    dueDate: new Date(data.dueDate).toISOString(),
    isCompleted: false,
    assignedToName: data.assignedToName || "Son",
    createdByName: data.createdByName || "Parent",
  };
  tasks.push(newTask);
  writeLocalTasks(tasks);
  return newTask;
}

export async function toggleTask(id: string): Promise<TaskItem | null> {
  if (isDbReady()) {
    try {
      const existing = await prisma.task.findUnique({ where: { id } });
      if (existing) {
        const nextState = !existing.isCompleted;
        const updated = await prisma.task.update({
          where: { id },
          data: {
            isCompleted: nextState,
            completedAt: nextState ? new Date() : null,
          },
        });
        return {
          id: updated.id,
          title: updated.title,
          category: updated.category as any,
          notes: updated.notes,
          dueDate: updated.dueDate.toISOString(),
          isCompleted: updated.isCompleted,
          completedAt: updated.completedAt ? updated.completedAt.toISOString() : null,
          assignedToName: "Son",
          createdByName: "Parent",
        };
      }
    } catch (e) {
      console.warn("Prisma DB update failed, falling back to local storage:", e);
    }
  }

  const tasks = readLocalTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  task.isCompleted = !task.isCompleted;
  task.completedAt = task.isCompleted ? new Date().toISOString() : null;
  writeLocalTasks(tasks);
  return task;
}

export async function removeTask(id: string): Promise<boolean> {
  if (isDbReady()) {
    try {
      await prisma.task.delete({ where: { id } });
      return true;
    } catch (e) {
      console.warn("Prisma DB delete failed, falling back to local storage:", e);
    }
  }

  let tasks = readLocalTasks();
  const initialLength = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);
  if (tasks.length !== initialLength) {
    writeLocalTasks(tasks);
    return true;
  }
  return false;
}
