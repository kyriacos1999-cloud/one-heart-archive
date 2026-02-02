import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      throw new Error("Payment intent ID is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the payment intent to verify it succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment not completed");
    }

    // Extract heart data from metadata
    const { name, category, message, date, recipientEmail } = paymentIntent.metadata;

    if (!name || !category) {
      throw new Error("Missing required metadata");
    }

    // Create Supabase client with service role for bypassing RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Save heart to database
    const { data: heart, error: insertError } = await supabase.from("hearts").insert({
      name,
      category,
      message: message || null,
      date,
      recipient_email: recipientEmail || null,
      stripe_session_id: paymentIntentId, // Reusing this column for payment intent ID
    }).select('id').single();

    if (insertError) {
      console.error("Error saving heart:", insertError);
      throw new Error("Failed to save heart");
    }

    // Send email notification if recipient email provided
    if (recipientEmail) {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      console.log("Attempting to send email notification");
      console.log("Recipient email:", recipientEmail);
      console.log("Resend API key configured:", !!resendApiKey);
      
      if (resendApiKey) {
        try {
          const safeName = escapeHtml(name);
          const safeCategory = escapeHtml(category.charAt(0).toUpperCase() + category.slice(1));
          const safeMessage = message ? escapeHtml(message) : "";
          const safeDate = escapeHtml(date);

          const emailPayload = {
            from: "Heart Wall <noreply@theheartwall.com>",
            to: [recipientEmail],
            subject: `💕 ${safeName} added a heart for you!`,
            html: `
              <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <span style="font-size: 48px;">💕</span>
                </div>
                <h1 style="text-align: center; color: #be123c; font-size: 28px; margin-bottom: 20px;">
                  Someone special added a heart for you
                </h1>
                <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  <p style="color: #374151; font-size: 18px; line-height: 1.6; margin-bottom: 20px;">
                    <strong>${safeName}</strong> has added a heart to the Heart Wall in your honor.
                  </p>
                  <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <p style="color: #9f1239; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Category</p>
                    <p style="color: #be123c; font-size: 18px; font-weight: 500;">${safeCategory}</p>
                  </div>
                  ${safeMessage ? `
                    <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                      <p style="color: #9f1239; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Their Message</p>
                      <p style="color: #374151; font-size: 16px; font-style: italic;">"${safeMessage}"</p>
                    </div>
                  ` : ""}
                  <p style="color: #6b7280; font-size: 14px; text-align: center;">
                    Date: ${safeDate}
                  </p>
                </div>
                <p style="text-align: center; color: #9ca3af; font-size: 14px; margin-top: 30px;">
                  Visit the Heart Wall to see all the love being shared.
                </p>
              </div>
            `,
          };
          
          console.log("Sending email with payload:", JSON.stringify({ ...emailPayload, html: "[HTML content]" }));

          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify(emailPayload),
          });
          
          const emailResult = await emailResponse.json();
          console.log("Email API response status:", emailResponse.status);
          console.log("Email API response:", JSON.stringify(emailResult));
          
          if (!emailResponse.ok) {
            console.error("Email sending failed:", emailResult);
          } else {
            console.log("Email sent successfully to:", recipientEmail);
          }
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      } else {
        console.log("No RESEND_API_KEY configured, skipping email");
      }
    } else {
      console.log("No recipient email provided, skipping email notification");
    }

    console.log("Heart saved successfully:", name, category);

    return new Response(JSON.stringify({ 
      success: true,
      heartId: heart.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error confirming payment:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
