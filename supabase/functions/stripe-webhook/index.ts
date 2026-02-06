import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const signature = req.headers.get("stripe-signature");

  if (!signature || !webhookSecret) {
    return new Response(JSON.stringify({ error: "Missing signature or webhook secret" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extract heart data from metadata
      const { name, senderName, category, message, date, recipientEmail } = session.metadata || {};

      if (!name || !category) {
        console.error("Missing required metadata");
        return new Response(JSON.stringify({ error: "Missing metadata" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create Supabase client with service role for bypassing RLS
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Save heart to database with session ID for sharing
      const { error: insertError } = await supabase.from("hearts").insert({
        name,
        category,
        message: message || null,
        date,
        recipient_email: recipientEmail || null,
        stripe_session_id: session.id,
      });

      if (insertError) {
        console.error("Error saving heart:", insertError);
        return new Response(JSON.stringify({ error: "Failed to save heart" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Send email notification if recipient email provided
      if (recipientEmail) {
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (resendApiKey) {
          try {
            // Escape all user-provided content to prevent XSS
            const safeName = escapeHtml(name);
            const safeSenderName = senderName ? escapeHtml(senderName) : "";
            const safeCategory = escapeHtml(category.charAt(0).toUpperCase() + category.slice(1));
            const safeMessage = message ? escapeHtml(message) : "";
            const safeDate = escapeHtml(date);

            const placedByLine = safeSenderName
              ? `<strong style="font-weight: 600;">${safeSenderName}</strong> placed a heart for you.`
              : `Someone placed a heart for you.`;

            const subjectLine = safeSenderName
              ? `${safeSenderName} placed a heart for you`
              : `A heart was placed for you`;

            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${resendApiKey}`,
              },
              body: JSON.stringify({
                from: "Heart Wall <noreply@theheartwall.com>",
                to: [recipientEmail],
                subject: subjectLine,
                html: `
                  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 520px; margin: 0 auto; padding: 60px 40px; background-color: #FDFCFB;">
                    
                    <div style="text-align: center; margin-bottom: 48px;">
                      <span style="font-size: 32px; opacity: 0.7;">♡</span>
                    </div>
                    
                    <h1 style="text-align: center; color: #1a1a1a; font-size: 24px; font-weight: 400; margin-bottom: 40px; letter-spacing: -0.01em;">
                      ${safeName}, a heart is here for you
                    </h1>
                    
                    <div style="text-align: center; padding: 0 20px;">
                      <p style="color: #374151; font-size: 17px; line-height: 1.75; margin-bottom: 32px;">
                        ${placedByLine}<br>
                        It's on the wall now — quietly, permanently.
                      </p>
                      
                      <p style="color: #6b7280; font-size: 15px; margin-bottom: 8px; font-style: italic;">
                        For ${safeCategory.toLowerCase()}
                      </p>
                      
                      ${safeMessage ? `
                        <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 32px 0; padding: 0 10px;">
                          "${safeMessage}"
                        </p>
                      ` : ""}
                      
                      <p style="color: #9ca3af; font-size: 13px; margin-top: 40px;">
                        ${safeDate}
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 56px; padding-top: 32px; border-top: 1px solid #e5e5e5;">
                      <p style="color: #9ca3af; font-size: 13px; letter-spacing: 0.02em;">
                        It stays.
                      </p>
                    </div>
                    
                  </div>
                `,
              }),
            });
          } catch (emailError) {
            console.error("Error sending email:", emailError);
          }
        }
      }

      console.log("Heart saved successfully:", name, category);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
