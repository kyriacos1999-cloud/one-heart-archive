import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface HeartNotificationRequest {
  recipientEmail: string;
  senderName: string;
  category: string;
  message?: string;
  date: string;
}

// HTML escape function to prevent XSS in email templates
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Validation functions
function validateEmail(email: unknown): string {
  if (typeof email !== "string" || !email.trim()) {
    throw new Error("Recipient email is required");
  }
  const trimmed = email.trim();
  if (trimmed.length > 254) {
    throw new Error("Email too long");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error("Invalid email format");
  }
  return trimmed;
}

function validateString(value: unknown, fieldName: string, maxLength: number): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} is required`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or less`);
  }
  return trimmed;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate inputs
    const recipientEmail = validateEmail(body.recipientEmail);
    const senderName = validateString(body.senderName, "Sender name", 100);
    const category = validateString(body.category, "Category", 50);
    const date = validateString(body.date, "Date", 50);
    const message = body.message ? String(body.message).trim().slice(0, 120) : "";

    // Escape all content for HTML
    const safeSenderName = escapeHtml(senderName);
    const safeCategory = escapeHtml(category);
    const safeDate = escapeHtml(date);
    const safeMessage = message ? escapeHtml(message) : "";

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Heart Wall <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: "💕 Someone added a heart for you on Heart Wall!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Georgia, serif; background-color: #fdf8f6; padding: 40px; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
              .heart { font-size: 48px; text-align: center; margin-bottom: 20px; }
              h1 { color: #1a1a1a; text-align: center; font-weight: 500; }
              .details { background: #fdf8f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .label { color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
              .value { color: #1a1a1a; font-size: 16px; margin-bottom: 12px; }
              .message { font-style: italic; color: #444; padding: 16px; border-left: 3px solid #e8b4b4; margin: 20px 0; }
              .footer { text-align: center; color: #888; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="heart">💕</div>
              <h1>A Heart Was Added For You</h1>
              <div class="details">
                <div class="label">From</div>
                <div class="value">${safeSenderName}</div>
                <div class="label">Category</div>
                <div class="value" style="text-transform: capitalize;">${safeCategory}</div>
                <div class="label">Date</div>
                <div class="value">${safeDate}</div>
              </div>
              ${safeMessage ? `<div class="message">"${safeMessage}"</div>` : ''}
              <div class="footer">
                <p>Visit Heart Wall to see all the hearts ❤️</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    console.log("Heart notification sent:", emailData);

    return new Response(JSON.stringify(emailData), {
      status: emailResponse.ok ? 200 : 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending heart notification:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
