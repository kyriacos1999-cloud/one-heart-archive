import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import HeartCard from "./HeartCard";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { useHeartCount } from "@/hooks/useHeartCount";
import { demoHearts } from "@/data/demoHearts";

interface Heart {
  id: string;
  name: string;
  category: string;
  message: string | null;
  date: string;
}

const GOAL = 1_000_000;

const HeartWall = () => {
  const [dbHearts, setDbHearts] = useState<Heart[]>([]);
  const [lastHeartTime, setLastHeartTime] = useState<Date | null>(null);
  const [, setTick] = useState(0); // For re-rendering relative time
  const { count: totalCount } = useHeartCount();
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    const fetchHearts = async () => {
      const { data, error } = await supabase
        .from("hearts_public")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(18);
      
      if (!error && data) {
        setDbHearts(data);
        // Set the most recent heart's timestamp
        if (data.length > 0 && data[0].created_at) {
          setLastHeartTime(new Date(data[0].created_at));
        }
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
          const newHeart = payload.new as Heart & { created_at?: string };
          setDbHearts((prev) => [newHeart, ...prev].slice(0, 18));
          // Update last heart time on new inserts
          if (newHeart.created_at) {
            setLastHeartTime(new Date(newHeart.created_at));
          } else {
            setLastHeartTime(new Date());
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update relative time display every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Animate the counter
  useEffect(() => {
    if (totalCount === 0) return;
    
    const duration = 1500;
    const steps = 60;
    const stepValue = totalCount / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= totalCount) {
        setAnimatedCount(totalCount);
        clearInterval(timer);
      } else {
        setAnimatedCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalCount]);

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

  const progressPercentage = Math.min((totalCount / GOAL) * 100, 100);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Counter */}
        <div className="mb-12 text-center">
          <div className="inline-block">
            <p className="text-sm text-muted-foreground mb-2 tracking-wide">
              Hearts added
            </p>
            <p className="font-serif text-4xl sm:text-5xl font-medium text-foreground mb-4">
              {animatedCount.toLocaleString()}
              <span className="text-muted-foreground/50 text-2xl sm:text-3xl ml-2">
                / {GOAL.toLocaleString()}
              </span>
            </p>
            <div className="w-64 sm:w-80 mx-auto">
              <Progress 
                value={progressPercentage} 
                className="h-2 bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {(100 - progressPercentage).toFixed(4)}% remaining until the wall closes
            </p>
          </div>
        </div>

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
        
        {/* Recency whisper */}
        {lastHeartTime && (
          <p className="text-center mt-8 text-xs text-muted-foreground/80 font-light tracking-wide">
            Last heart placed: {formatDistanceToNow(lastHeartTime, { addSuffix: false })} ago
          </p>
        )}
        
        <div className="text-center mt-6">
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
