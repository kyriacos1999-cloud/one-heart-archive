import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HeartCard from "@/components/HeartCard";
import Footer from "@/components/Footer";

const sampleHearts = [
  { name: "Emma & James", category: "romantic" },
  { name: "For Mom", category: "family" },
  { name: "A.K.", category: "self" },
  { name: "The Johnsons", category: "family" },
  { name: "Sarah + Lily", category: "friendship" },
  { name: "In memory of Dad", category: "memory" },
  { name: "To my future self", category: "self" },
  { name: "M & R", category: "romantic" },
  { name: "The hiking crew", category: "friendship" },
  { name: "Nana Rose", category: "memory" },
  { name: "Leo", category: "self" },
  { name: "Chen Family", category: "family" },
  { name: "J + K Forever", category: "romantic" },
  { name: "Best friends since '09", category: "friendship" },
  { name: "Uncle Tom", category: "memory" },
  { name: "David & Sofia", category: "romantic" },
  { name: "My children", category: "family" },
  { name: "L.M.", category: "self" },
  { name: "The coffee club", category: "friendship" },
  { name: "For Grandpa", category: "memory" },
  { name: "Always, Anna", category: "romantic" },
  { name: "Team forever", category: "friendship" },
  { name: "Marcus", category: "self" },
  { name: "The Garcias", category: "family" },
  { name: "Sophie & Ben", category: "romantic" },
  { name: "My siblings", category: "family" },
  { name: "R.T.", category: "self" },
  { name: "Book club buddies", category: "friendship" },
  { name: "In loving memory", category: "memory" },
  { name: "K & M", category: "romantic" },
  { name: "The Williams", category: "family" },
  { name: "Forever friends", category: "friendship" },
];

const Hearts = () => {
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
          <div className="text-center mb-12">
            <p className="text-muted-foreground text-sm">
              {sampleHearts.length} hearts on the wall
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {sampleHearts.map((heart, index) => (
              <HeartCard
                key={index}
                name={heart.name}
                category={heart.category}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` } as React.CSSProperties}
              />
            ))}
          </div>

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
