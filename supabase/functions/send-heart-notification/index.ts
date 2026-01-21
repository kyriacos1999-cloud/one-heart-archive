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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, senderName, category, message, date }: HeartNotificationRequest = await req.json();

    if (!recipientEmail || !senderName || !category) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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
                <div class="value">${senderName}</div>
                <div class="label">Category</div>
                <div class="value" style="text-transform: capitalize;">${category}</div>
                <div class="label">Date</div>
                <div class="value">${date}</div>
              </div>
              ${message ? `<div class="message">"${message}"</div>` : ''}
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
  } catch (error: any) {
    console.error("Error sending heart notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
