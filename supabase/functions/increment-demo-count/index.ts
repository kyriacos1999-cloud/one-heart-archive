import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key to update demo_config (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get current count
    const { data: currentData, error: fetchError } = await supabase
      .from("demo_config")
      .select("demo_heart_count")
      .eq("id", "main")
      .single();

    if (fetchError || !currentData) {
      console.error("Error fetching demo config:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch demo config" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment count
    const newCount = currentData.demo_heart_count + 1;
    
    const { error: updateError } = await supabase
      .from("demo_config")
      .update({ 
        demo_heart_count: newCount, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", "main");

    if (updateError) {
      console.error("Error updating demo config:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update demo config" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, count: newCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error incrementing demo count:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
