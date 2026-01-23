import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      const { name, category, message, date, recipientEmail } = session.metadata || {};

      if (!name || !category) {
        console.error("Missing required metadata");
        return new Response(JSON.stringify({ error: "Missing metadata" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create Supabase client
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
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${resendApiKey}`,
              },
              body: JSON.stringify({
                from: "Heart Wall <onboarding@resend.dev>",
                to: [recipientEmail],
                subject: `💕 ${name} added a heart for you!`,
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
                        <strong>${name}</strong> has added a heart to the Heart Wall in your honor.
                      </p>
                      <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <p style="color: #9f1239; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Category</p>
                        <p style="color: #be123c; font-size: 18px; font-weight: 500;">${category.charAt(0).toUpperCase() + category.slice(1)}</p>
                      </div>
                      ${message ? `
                        <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                          <p style="color: #9f1239; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Their Message</p>
                          <p style="color: #374151; font-size: 16px; font-style: italic;">"${message}"</p>
                        </div>
                      ` : ""}
                      <p style="color: #6b7280; font-size: 14px; text-align: center;">
                        Date: ${date}
                      </p>
                    </div>
                    <p style="text-align: center; color: #9ca3af; font-size: 14px; margin-top: 30px;">
                      Visit the Heart Wall to see all the love being shared.
                    </p>
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
