import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import HeartCard from "./HeartCard";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Heart {
  id: string;
  name: string;
  category: string;
  message: string | null;
  date: string;
}

const sampleHearts = [
  { name: "Emma & James", category: "romantic", message: "Together forever, through every storm and every sunny day.", date: "January 14, 2024" },
  { name: "For Mom", category: "family", message: "Thank you for everything. Your love guides me every day.", date: "December 25, 2023" },
  { name: "A.K.", category: "self", message: "A reminder to always believe in myself.", date: "March 1, 2024" },
  { name: "The Johnsons", category: "family", message: "Family is everything. We stick together no matter what.", date: "November 28, 2023" },
  { name: "Sarah + Lily", category: "friendship", message: "Best friends since kindergarten. Nothing can break this bond.", date: "February 14, 2024" },
  { name: "In memory of Dad", category: "memory", message: "Gone but never forgotten. Your wisdom lives on.", date: "April 3, 2023" },
];

const GOAL = 1_000_000;

const HeartWall = () => {
  const [dbHearts, setDbHearts] = useState<Heart[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    const fetchHearts = async () => {
      const { data, error } = await supabase
        .from("hearts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(18);
      
      if (!error && data) {
        setDbHearts(data);
      }
    };

    const fetchCount = async () => {
      // Get demo count
      const { data: demoData } = await supabase
        .from("demo_config")
        .select("demo_heart_count")
        .eq("id", "main")
        .single();
      
      // Get real hearts count
      const { count: realCount } = await supabase
        .from("hearts")
        .select("*", { count: "exact", head: true });
      
      const demoCount = demoData?.demo_heart_count || 74026;
      const total = demoCount + (realCount || 0);
      setTotalCount(total);
    };

    fetchHearts();
    fetchCount();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("heartwall-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "hearts" },
        (payload) => {
          setDbHearts((prev) => [payload.new as Heart, ...prev].slice(0, 18));
          setTotalCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
      name: h.name,
      category: h.category,
      message: h.message || "",
      date: format(new Date(h.date), "MMMM d, yyyy"),
    })),
    ...sampleHearts,
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
              key={index}
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
