import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

export interface SendSmsOptions {
  to: string;
  taskTitle: string;
  category: string;
  dueDate: string;
  notes?: string;
  appUrl?: string;
}

export async function sendTaskNotificationSms(options: SendSmsOptions): Promise<{
  success: boolean;
  simulated?: boolean;
  messageId?: string;
  error?: string;
}> {
  const { to, taskTitle, category, dueDate, notes } = options;

  const due = new Date(dueDate);
  const dueFormatted = `${due.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })} at ${due.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })}`;

  const categoryEmoji: Record<string, string> = {
    CHORE: "🧹 Chore",
    TEST: "📝 School Test",
    HOMEWORK: "📚 Homework",
    REMINDER: "⏰ Reminder",
  };

  const tag = categoryEmoji[category] || "⏰ Reminder";
  let body = `Hey! New task added: [${tag}]\n${taskTitle}\n📅 Due: ${dueFormatted}`;

  if (notes) {
    body += `\n📌 Note: ${notes}`;
  }

  const appBaseUrl = process.env.NEXTAUTH_URL || "https://familytask.vercel.app";
  body += `\nCheck off when done: ${appBaseUrl}`;

  // If Twilio credentials are not set, simulate cleanly for development
  if (!accountSid || !authToken || !fromNumber) {
    console.log("=========================================");
    console.log("📱 [SMS SIMULATION] (Twilio credentials not configured)");
    console.log(`To: ${to}`);
    console.log(`Message:\n${body}`);
    console.log("=========================================");
    return { success: true, simulated: true };
  }

  try {
    const client = twilio(accountSid, authToken);
    const result = await client.messages.create({
      body,
      from: fromNumber,
      to,
    });
    console.log(`[SMS Sent] SID: ${result.sid} to ${to}`);
    return { success: true, messageId: result.sid };
  } catch (error: any) {
    console.error("Twilio SMS send error:", error);
    return { success: false, error: error.message || "Failed to send SMS" };
  }
}
