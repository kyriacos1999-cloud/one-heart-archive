import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useHeartCount = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    const { data: demoData } = await supabase
      .from("demo_config")
      .select("demo_heart_count")
      .eq("id", "main")
      .maybeSingle();

    const { count: realCount } = await supabase
      .from("hearts_public")
      .select("*", { count: "exact", head: true });

    const demoCount = demoData?.demo_heart_count || 74026;
    const total = demoCount + (realCount || 0);
    setCount(total);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCount();

    // Increment demo count every 30 seconds while on site
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("demo_config")
        .select("demo_heart_count")
        .eq("id", "main")
        .maybeSingle();
      
      if (data) {
        const newCount = data.demo_heart_count + 1;
        await supabase
          .from("demo_config")
          .update({ demo_heart_count: newCount, updated_at: new Date().toISOString() })
          .eq("id", "main");
        
        // Refetch to get accurate total
        fetchCount();
      }
    }, 30000);

    // Subscribe to hearts table for realtime updates
    const channel = supabase
      .channel("heart-count-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "hearts" },
        () => {
          setCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchCount]);

  return { count, loading };
};
