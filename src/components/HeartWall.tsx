import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import HeartCard from "./HeartCard";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { demoHearts } from "@/data/demoHearts";

interface Heart {
  id: string;
  name: string;
  category: string;
  message: string | null;
  date: string;
}

const HeartWall = () => {
  const [dbHearts, setDbHearts] = useState<Heart[]>([]);

  useEffect(() => {
    const fetchHearts = async () => {
      const { data, error } = await supabase
        .from("hearts_public")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(18);
      
      if (!error && data) {
        setDbHearts(data);
      }
    };

    fetchHearts();

    // Subscribe to realtime updates for hearts display
    const channel = supabase
      .channel("heartwall-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "hearts" },
        (payload) => {
          setDbHearts((prev) => [payload.new as Heart, ...prev].slice(0, 18));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const displayHearts = [
    ...dbHearts.map((h) => ({
      id: h.id,
      name: h.name,
      category: h.category,
      message: h.message || "",
      date: format(new Date(h.date), "MMMM d, yyyy"),
    })),
    ...demoHearts.map((h) => ({
      id: undefined, // Demo hearts don't have IDs
      name: h.name,
      category: h.category,
      message: h.message,
      date: h.date,
    })),
  ].slice(0, 24);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
          {displayHearts.map((heart, index) => (
            <HeartCard
              key={heart.id || `demo-${index}`}
              id={heart.id}
              name={heart.name}
              category={heart.category}
              message={heart.message}
              date={heart.date}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
            />
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/hearts">
              View All Hearts
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeartWall;
