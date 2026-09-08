import twilio from "twilio";

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

  // Read and clean environment variables at runtime
  const rawSid = process.env.TWILIO_ACCOUNT_SID?.replace(/['"]/g, "").trim();
  const rawAuth = process.env.TWILIO_AUTH_TOKEN?.replace(/['"]/g, "").trim();
  let rawFrom = process.env.TWILIO_PHONE_NUMBER?.replace(/['"]/g, "").trim();

  // Ensure fromNumber has leading +
  if (rawFrom && !rawFrom.startsWith("+")) {
    rawFrom = "+" + rawFrom;
  }

  // Normalize recipient phone number to E.164 (+1XXXXXXXXXX)
  let formattedTo = to.replace(/[^\d+]/g, "").trim();
  if (!formattedTo.startsWith("+")) {
    if (formattedTo.length === 10) {
      formattedTo = "+1" + formattedTo;
    } else if (formattedTo.length === 11 && formattedTo.startsWith("1")) {
      formattedTo = "+" + formattedTo;
    }
  }

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

  const appBaseUrl =
    process.env.NEXTAUTH_URL || "https://task-reminder-henna.vercel.app";
  body += `\nCheck off when done: ${appBaseUrl}`;

  // If Twilio credentials are missing
  if (!rawSid || !rawAuth || !rawFrom) {
    console.log("=========================================");
    console.log("📱 [SMS SIMULATION] (Twilio credentials not configured)");
    console.log(`To: ${formattedTo}`);
    console.log(`Message:\n${body}`);
    console.log("=========================================");
    return {
      success: false,
      simulated: true,
      error: "Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER) are missing in environment variables.",
    };
  }

  try {
    const client = twilio(rawSid, rawAuth);
    const result = await client.messages.create({
      body,
      from: rawFrom,
      to: formattedTo,
    });
    console.log(`[SMS Sent] SID: ${result.sid} to ${formattedTo}`);
    return { success: true, messageId: result.sid };
  } catch (error: any) {
    console.error("Twilio SMS send error:", error);
    return {
      success: false,
      error: error.message || "Failed to send SMS via Twilio",
    };
  }
}
