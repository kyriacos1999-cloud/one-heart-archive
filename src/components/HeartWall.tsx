import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import HeartCard from "./HeartCard";
import { Button } from "./ui/button";

const sampleHearts = [
  { name: "Emma & James", category: "romantic", message: "Together forever, through every storm and every sunny day." },
  { name: "For Mom", category: "family", message: "Thank you for everything. Your love guides me every day." },
  { name: "A.K.", category: "self", message: "A reminder to always believe in myself." },
  { name: "The Johnsons", category: "family", message: "Family is everything. We stick together no matter what." },
  { name: "Sarah + Lily", category: "friendship", message: "Best friends since kindergarten. Nothing can break this bond." },
  { name: "In memory of Dad", category: "memory", message: "Gone but never forgotten. Your wisdom lives on." },
  { name: "To my future self", category: "self", message: "Keep going. You're stronger than you know." },
  { name: "M & R", category: "romantic", message: "Every moment with you is a gift." },
  { name: "The hiking crew", category: "friendship", message: "Miles of trails, years of memories." },
  { name: "Nana Rose", category: "memory", message: "Your garden still blooms, just like your love." },
  { name: "Leo", category: "self", message: "Embrace who you are." },
  { name: "Chen Family", category: "family", message: "祝我们的家庭永远幸福" },
  { name: "J + K Forever", category: "romantic", message: "From our first date to forever." },
  { name: "Best friends since '09", category: "friendship", message: "15 years and counting." },
  { name: "Uncle Tom", category: "memory", message: "Your laughter echoes in every gathering." },
  { name: "David & Sofia", category: "romantic", message: "Two hearts, one beautiful journey." },
  { name: "My children", category: "family", message: "You are my greatest achievement." },
  { name: "L.M.", category: "self", message: "Learning to love myself, one day at a time." },
  { name: "The coffee club", category: "friendship", message: "Same table, same friends, endless support." },
  { name: "For Grandpa", category: "memory", message: "Your stories live on. We miss you dearly." },
  { name: "Always, Anna", category: "romantic", message: "My heart belongs to you, always." },
  { name: "Team forever", category: "friendship", message: "Work brought us together, friendship keeps us close." },
  { name: "Marcus", category: "self", message: "This is my year. Watch me grow." },
  { name: "The Garcias", category: "family", message: "Amor, respeto, y unidad." },
];

const HeartWall = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
          {sampleHearts.map((heart, index) => (
            <HeartCard
              key={index}
              name={heart.name}
              category={heart.category}
              message={heart.message}
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
        
        <p className="text-center mt-8 text-muted-foreground text-sm font-light tracking-wide">
          This wall closes permanently at 1,000,000 hearts.
        </p>
      </div>
    </section>
  );
};

export default HeartWall;
