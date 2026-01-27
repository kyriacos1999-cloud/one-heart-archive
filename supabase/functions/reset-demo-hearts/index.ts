import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin secret for authentication (set in Supabase secrets)
const ADMIN_SECRET = Deno.env.get("ADMIN_SECRET");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for admin secret in Authorization header
    const authHeader = req.headers.get("Authorization");
    
    if (!ADMIN_SECRET) {
      console.error("ADMIN_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Reset demo hearts to 74,026
    const { error } = await supabase
      .from("demo_config")
      .update({ 
        demo_heart_count: 74026, 
        last_reset_at: new Date().toISOString(),
        updated_at: new Date().toISOString() 
      })
      .eq("id", "main");

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: "Demo hearts reset to 74,026" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
