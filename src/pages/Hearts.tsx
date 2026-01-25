import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import HeartCard from "@/components/HeartCard";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useHeartCount } from "@/hooks/useHeartCount";

interface Heart {
  id: string;
  name: string;
  category: string;
  message: string | null;
  date: string;
  created_at: string;
}

const sampleHearts = [
  { name: "Emma & James", category: "romantic", message: "Together forever, through every storm and every sunny day. Our love story continues.", date: "January 14, 2024" },
  { name: "For Mom", category: "family", message: "Thank you for everything. Your love guides me every day.", date: "December 25, 2023" },
  { name: "A.K.", category: "self", message: "A reminder to always believe in myself.", date: "March 1, 2024" },
  { name: "The Johnsons", category: "family", message: "Family is everything. We stick together no matter what.", date: "November 28, 2023" },
  { name: "Sarah + Lily", category: "friendship", message: "Best friends since kindergarten. Nothing can break this bond.", date: "February 14, 2024" },
  { name: "In memory of Dad", category: "memory", message: "Gone but never forgotten. Your wisdom lives on in everything I do.", date: "April 3, 2023" },
];

const Hearts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dbHearts, setDbHearts] = useState<Heart[]>([]);
  const [loading, setLoading] = useState(true);
  const { count: totalHeartCount } = useHeartCount();

  useEffect(() => {
    const fetchHearts = async () => {
      const { data, error } = await supabase
        .from("hearts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching hearts:", error);
      } else {
        setDbHearts(data || []);
      }
      setLoading(false);
    };

    fetchHearts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("hearts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "hearts" },
        (payload) => {
          setDbHearts((prev) => [payload.new as Heart, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const allHearts = useMemo(() => {
    const formattedDbHearts = dbHearts.map((h) => ({
      name: h.name,
      category: h.category,
      message: h.message || "",
      date: format(new Date(h.date), "MMMM d, yyyy"),
    }));
    return [...formattedDbHearts, ...sampleHearts];
  }, [dbHearts]);

  const filteredHearts = useMemo(() => {
    if (!searchQuery.trim()) return allHearts;
    const query = searchQuery.toLowerCase().trim();
    return allHearts.filter((heart) =>
      heart.name.toLowerCase().includes(query)
    );
  }, [searchQuery, allHearts]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="font-serif text-xl tracking-wide">The Heart Wall</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Hearts Grid */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Search */}
          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Find your heart..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                maxLength={100}
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-muted-foreground text-sm">
              {searchQuery 
                ? `${filteredHearts.length} ${filteredHearts.length === 1 ? "heart" : "hearts"} found`
                : `${totalHeartCount.toLocaleString()} hearts added`
              }
            </p>
          </div>

          {filteredHearts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {filteredHearts.map((heart, index) => (
                <HeartCard
                  key={index}
                  name={heart.name}
                  category={heart.category}
                  message={heart.message}
                  date={heart.date}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` } as React.CSSProperties}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No hearts found matching "{searchQuery}"</p>
            </div>
          )}

          <p className="text-center mt-16 text-muted-foreground text-sm font-light tracking-wide">
            This wall closes permanently at 1,000,000 hearts.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Hearts;
