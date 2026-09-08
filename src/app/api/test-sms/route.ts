import { NextResponse } from "next/server";
import { sendTaskNotificationSms } from "@/lib/sms";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Please enter a phone number to test." },
        { status: 400 }
      );
    }

    const result = await sendTaskNotificationSms({
      to: phoneNumber,
      taskTitle: "FamilyTask connection working!",
      category: "REMINDER",
      dueDate: new Date().toISOString(),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/test-sms error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
