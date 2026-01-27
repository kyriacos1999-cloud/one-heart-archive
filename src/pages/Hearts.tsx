import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import HeartCard from "@/components/HeartCard";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useHeartCount } from "@/hooks/useHeartCount";
import { demoHearts } from "@/data/demoHearts";
import { cn } from "@/lib/utils";

interface Heart {
  id: string;
  name: string;
  category: string;
  message: string | null;
  date: string;
  created_at: string;
}

const categories = [
  { id: "all", label: "All" },
  { id: "romantic", label: "Romantic" },
  { id: "family", label: "Family" },
  { id: "friendship", label: "Friendship" },
  { id: "memory", label: "Memory" },
  { id: "self", label: "Self" },
];

const Hearts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dbHearts, setDbHearts] = useState<Heart[]>([]);
  const [loading, setLoading] = useState(true);
  const { count: totalHeartCount } = useHeartCount();

  useEffect(() => {
    const fetchHearts = async () => {
      const { data, error } = await supabase
        .from("hearts_public")
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
    return [...formattedDbHearts, ...demoHearts];
  }, [dbHearts]);

  const filteredHearts = useMemo(() => {
    let hearts = allHearts;
    
    // Filter by category
    if (selectedCategory !== "all") {
      hearts = hearts.filter((heart) => heart.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      hearts = hearts.filter((heart) =>
        heart.name.toLowerCase().includes(query)
      );
    }
    
    return hearts;
  }, [searchQuery, selectedCategory, allHearts]);

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
          <div className="max-w-md mx-auto mb-6">
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

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "text-xs sm:text-sm transition-all",
                  selectedCategory === category.id && "shadow-sm"
                )}
              >
                {category.label}
              </Button>
            ))}
          </div>

          <div className="text-center mb-8">
            <p className="text-muted-foreground text-sm">
              {searchQuery || selectedCategory !== "all"
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
