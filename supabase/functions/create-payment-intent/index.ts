import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Valid categories for hearts
const VALID_CATEGORIES = ["romantic", "family", "friendship", "memory", "self"] as const;

// Validation functions
function validateName(name: unknown): string {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Name is required");
  }
  const trimmed = name.trim();
  if (trimmed.length > 100) {
    throw new Error("Name must be 100 characters or less");
  }
  return trimmed;
}

function validateCategory(category: unknown): string {
  if (typeof category !== "string") {
    throw new Error("Category is required");
  }
  if (!VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    throw new Error("Invalid category");
  }
  return category;
}

function validateMessage(message: unknown): string {
  if (!message) return "";
  if (typeof message !== "string") return "";
  const trimmed = message.trim();
  if (trimmed.length > 120) {
    throw new Error("Message must be 120 characters or less");
  }
  return trimmed;
}

function validateDate(date: unknown): string {
  if (typeof date !== "string") {
    throw new Error("Date is required");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Invalid date format");
  }
  const parsedDate = new Date(date);
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  if (parsedDate > maxDate) {
    throw new Error("Date cannot be more than 1 year in the future");
  }
  return date;
}

function validateEmail(email: unknown): string {
  if (!email) return "";
  if (typeof email !== "string") return "";
  const trimmed = email.trim();
  if (!trimmed) return "";
  if (trimmed.length > 254) {
    throw new Error("Email must be 254 characters or less");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error("Invalid email format");
  }
  return trimmed;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate all inputs
    const name = validateName(body.name);
    const category = validateCategory(body.category);
    const message = validateMessage(body.message);
    const date = validateDate(body.date);
    const recipientEmail = validateEmail(body.recipientEmail);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create a PaymentIntent for €1 (100 cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        name,
        category,
        message,
        date,
        recipientEmail,
      },
    });

    return new Response(JSON.stringify({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error creating payment intent:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
