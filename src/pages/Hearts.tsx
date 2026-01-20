import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import HeartCard from "@/components/HeartCard";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";

const sampleHearts = [
  { name: "Emma & James", category: "romantic", message: "Together forever, through every storm and every sunny day. Our love story continues.", date: "January 14, 2024" },
  { name: "For Mom", category: "family", message: "Thank you for everything. Your love guides me every day.", date: "December 25, 2023" },
  { name: "A.K.", category: "self", message: "A reminder to always believe in myself.", date: "March 1, 2024" },
  { name: "The Johnsons", category: "family", message: "Family is everything. We stick together no matter what.", date: "November 28, 2023" },
  { name: "Sarah + Lily", category: "friendship", message: "Best friends since kindergarten. Nothing can break this bond.", date: "February 14, 2024" },
  { name: "In memory of Dad", category: "memory", message: "Gone but never forgotten. Your wisdom lives on in everything I do.", date: "April 3, 2023" },
  { name: "To my future self", category: "self", message: "Keep going. You're stronger than you know.", date: "January 1, 2024" },
  { name: "M & R", category: "romantic", message: "Every moment with you is a gift.", date: "June 15, 2023" },
  { name: "The hiking crew", category: "friendship", message: "Miles of trails, years of memories. Adventure awaits!", date: "August 20, 2023" },
  { name: "Nana Rose", category: "memory", message: "Your garden still blooms, just like your love in our hearts.", date: "May 12, 2023" },
  { name: "Leo", category: "self", message: "Embrace who you are.", date: "October 5, 2023" },
  { name: "Chen Family", category: "family", message: "祝我们的家庭永远幸福 - Wishing our family eternal happiness.", date: "February 10, 2024" },
  { name: "J + K Forever", category: "romantic", message: "From our first date to forever. You're my person.", date: "July 4, 2023" },
  { name: "Best friends since '09", category: "friendship", message: "15 years and counting. Here's to many more adventures.", date: "September 15, 2023" },
  { name: "Uncle Tom", category: "memory", message: "Your laughter echoes in every family gathering.", date: "November 1, 2023" },
  { name: "David & Sofia", category: "romantic", message: "Two hearts, one beautiful journey.", date: "February 28, 2024" },
  { name: "My children", category: "family", message: "You are my greatest achievement and my endless love.", date: "December 31, 2023" },
  { name: "L.M.", category: "self", message: "Learning to love myself, one day at a time.", date: "January 20, 2024" },
  { name: "The coffee club", category: "friendship", message: "Every Tuesday morning, same table, same friends, endless support.", date: "October 15, 2023" },
  { name: "For Grandpa", category: "memory", message: "Your stories live on. We miss you dearly.", date: "March 17, 2023" },
  { name: "Always, Anna", category: "romantic", message: "My heart belongs to you, always and forever.", date: "February 14, 2023" },
  { name: "Team forever", category: "friendship", message: "Work brought us together, friendship keeps us close.", date: "July 20, 2023" },
  { name: "Marcus", category: "self", message: "This is my year. Watch me grow.", date: "January 1, 2024" },
  { name: "The Garcias", category: "family", message: "Amor, respeto, y unidad. Love, respect, and unity.", date: "December 24, 2023" },
  { name: "Sophie & Ben", category: "romantic", message: "Found my soulmate in the most unexpected place.", date: "August 5, 2023" },
  { name: "My siblings", category: "family", message: "Built-in best friends for life.", date: "November 15, 2023" },
  { name: "R.T.", category: "self", message: "Healing is not linear, but I'm making progress.", date: "February 1, 2024" },
  { name: "Book club buddies", category: "friendship", message: "More wine than books, more laughs than pages.", date: "September 1, 2023" },
  { name: "In loving memory", category: "memory", message: "Forever in our hearts.", date: "June 1, 2023" },
  { name: "K & M", category: "romantic", message: "Two souls, one heartbeat.", date: "March 14, 2024" },
  { name: "The Williams", category: "family", message: "Generations of love, strength, and togetherness.", date: "October 20, 2023" },
  { name: "Forever friends", category: "friendship", message: "Distance means nothing when someone means everything.", date: "December 10, 2023" },
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
