import { NextResponse } from "next/server";
import { getTasksList, addTask, toggleTask, removeTask } from "@/lib/tasks-service";
import { sendTaskNotificationSms } from "@/lib/sms";

export async function GET() {
  try {
    const tasks = await getTasksList();
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, notes, dueDate, assignedToName, sendSms, sonPhoneNumber } = body;

    if (!title || !category || !dueDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, category, dueDate" },
        { status: 400 }
      );
    }

    const created = await addTask({
      title,
      category,
      notes,
      dueDate,
      assignedToName,
    });

    let smsStatus = null;
    if (sendSms && sonPhoneNumber) {
      smsStatus = await sendTaskNotificationSms({
        to: sonPhoneNumber,
        taskTitle: title,
        category,
        dueDate,
        notes,
      });
    }

    return NextResponse.json({ success: true, task: created, smsStatus }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ success: false, error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Task ID is required" }, { status: 400 });
    }

    const updated = await toggleTask(id);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: updated });
  } catch (error) {
    console.error("PATCH /api/tasks error:", error);
    return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Task ID is required" }, { status: 400 });
    }

    const success = await removeTask(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("DELETE /api/tasks error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete task" }, { status: 500 });
  }
}
