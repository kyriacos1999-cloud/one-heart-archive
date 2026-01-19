import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import HeartCard from "@/components/HeartCard";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";

const sampleHearts = [
  { name: "Emma & James", category: "romantic", message: "Together forever, through every storm and every sunny day. Our love story continues." },
  { name: "For Mom", category: "family", message: "Thank you for everything. Your love guides me every day." },
  { name: "A.K.", category: "self", message: "A reminder to always believe in myself." },
  { name: "The Johnsons", category: "family", message: "Family is everything. We stick together no matter what." },
  { name: "Sarah + Lily", category: "friendship", message: "Best friends since kindergarten. Nothing can break this bond." },
  { name: "In memory of Dad", category: "memory", message: "Gone but never forgotten. Your wisdom lives on in everything I do." },
  { name: "To my future self", category: "self", message: "Keep going. You're stronger than you know." },
  { name: "M & R", category: "romantic", message: "Every moment with you is a gift." },
  { name: "The hiking crew", category: "friendship", message: "Miles of trails, years of memories. Adventure awaits!" },
  { name: "Nana Rose", category: "memory", message: "Your garden still blooms, just like your love in our hearts." },
  { name: "Leo", category: "self", message: "Embrace who you are." },
  { name: "Chen Family", category: "family", message: "祝我们的家庭永远幸福 - Wishing our family eternal happiness." },
  { name: "J + K Forever", category: "romantic", message: "From our first date to forever. You're my person." },
  { name: "Best friends since '09", category: "friendship", message: "15 years and counting. Here's to many more adventures." },
  { name: "Uncle Tom", category: "memory", message: "Your laughter echoes in every family gathering." },
  { name: "David & Sofia", category: "romantic", message: "Two hearts, one beautiful journey." },
  { name: "My children", category: "family", message: "You are my greatest achievement and my endless love." },
  { name: "L.M.", category: "self", message: "Learning to love myself, one day at a time." },
  { name: "The coffee club", category: "friendship", message: "Every Tuesday morning, same table, same friends, endless support." },
  { name: "For Grandpa", category: "memory", message: "Your stories live on. We miss you dearly." },
  { name: "Always, Anna", category: "romantic", message: "My heart belongs to you, always and forever." },
  { name: "Team forever", category: "friendship", message: "Work brought us together, friendship keeps us close." },
  { name: "Marcus", category: "self", message: "This is my year. Watch me grow." },
  { name: "The Garcias", category: "family", message: "Amor, respeto, y unidad. Love, respect, and unity." },
  { name: "Sophie & Ben", category: "romantic", message: "Found my soulmate in the most unexpected place." },
  { name: "My siblings", category: "family", message: "Built-in best friends for life." },
  { name: "R.T.", category: "self", message: "Healing is not linear, but I'm making progress." },
  { name: "Book club buddies", category: "friendship", message: "More wine than books, more laughs than pages." },
  { name: "In loving memory", category: "memory", message: "Forever in our hearts." },
  { name: "K & M", category: "romantic", message: "Two souls, one heartbeat." },
  { name: "The Williams", category: "family", message: "Generations of love, strength, and togetherness." },
  { name: "Forever friends", category: "friendship", message: "Distance means nothing when someone means everything." },
];

const Hearts = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHearts = useMemo(() => {
    if (!searchQuery.trim()) return sampleHearts;
    const query = searchQuery.toLowerCase().trim();
    return sampleHearts.filter((heart) =>
      heart.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

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
              {filteredHearts.length} {filteredHearts.length === 1 ? "heart" : "hearts"} {searchQuery && "found"}
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
