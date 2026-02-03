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
        from: "The Heart Wall <noreply@theheartwall.com>",
        to: [recipientEmail],
        subject: "Someone placed a heart for you",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                background-color: #FAF9F7; 
                margin: 0;
                padding: 40px 20px;
                line-height: 1.6;
              }
              .container { 
                max-width: 480px; 
                margin: 0 auto; 
                background: #ffffff; 
                padding: 60px 40px; 
                text-align: center;
              }
              .heart { 
                color: #E8B4B4;
                font-size: 32px; 
                margin-bottom: 40px;
                display: block;
              }
              h1 { 
                font-family: 'Georgia', 'Times New Roman', serif;
                color: #1a1a1a; 
                font-weight: 400;
                font-size: 24px;
                margin: 0 0 32px 0;
                letter-spacing: -0.02em;
              }
              .body-text {
                color: #666666;
                font-size: 16px;
                margin: 0 0 12px 0;
              }
              .sender-name {
                color: #1a1a1a;
                font-weight: 500;
              }
              .message-block {
                margin: 32px 0;
                padding: 24px 0;
                border-top: 1px solid #f0f0f0;
                border-bottom: 1px solid #f0f0f0;
              }
              .message-text {
                font-family: 'Georgia', 'Times New Roman', serif;
                font-style: italic;
                color: #444444;
                font-size: 16px;
                margin: 0;
              }
              .cta-button {
                display: inline-block;
                margin-top: 32px;
                padding: 14px 28px;
                background-color: #1a1a1a;
                color: #ffffff !important;
                text-decoration: none;
                font-size: 14px;
                letter-spacing: 0.02em;
              }
              .cta-button:hover {
                background-color: #333333;
              }
              .footer {
                margin-top: 48px;
                padding-top: 32px;
                border-top: 1px solid #f0f0f0;
              }
              .footer-text {
                color: #999999;
                font-size: 13px;
                margin: 0 0 4px 0;
              }
              .footer-tagline {
                color: #bbbbbb;
                font-size: 12px;
                margin: 12px 0 0 0;
                font-style: italic;
              }
              .footer-link {
                color: #999999;
                text-decoration: none;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <span class="heart">♥</span>
              
              <h1>Someone placed a heart for you.</h1>
              
              <p class="body-text">
                <span class="sender-name">${safeSenderName}</span> added your name to the wall.
              </p>
              <p class="body-text">
                It's there now — quietly, permanently.
              </p>
              
              ${safeMessage ? `
                <div class="message-block">
                  <p class="message-text">"${safeMessage}"</p>
                </div>
              ` : ''}
              
              <a href="https://theheartwall.com/hearts" class="cta-button">See the wall →</a>
              
              <div class="footer">
                <p class="footer-text">This heart is part of a permanent public archive.</p>
                <p class="footer-tagline">One name. One heart. Forever.</p>
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
