import HeartCard from "./HeartCard";

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
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
            />
          ))}
        </div>
        
        <p className="text-center mt-12 text-muted-foreground text-sm font-light tracking-wide">
          This wall closes permanently at 100,000 hearts.
        </p>
      </div>
    </section>
  );
};

export default HeartWall;
