import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const allCities = [
  "Tokyo", "Lisbon", "Toronto", "Buenos Aires", "Seoul", "Nairobi",
  "Paris", "New York", "London", "Sydney", "Mumbai", "Dubai",
  "Berlin", "Cape Town", "Rio de Janeiro", "Singapore", "Amsterdam",
  "Bangkok", "Mexico City", "Cairo", "Stockholm", "Vienna", "Istanbul",
  "Barcelona", "Vancouver", "Melbourne", "Hong Kong", "São Paulo",
  "Dublin", "Copenhagen", "Oslo", "Prague", "Zurich", "Milan",
  "Warsaw", "Athens", "Moscow", "Jakarta", "Manila", "Kuala Lumpur"
];

const getRandomCities = (count: number, exclude: string[] = []) => {
  const available = allCities.filter(city => !exclude.includes(city));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const GlobalProof = () => {
  const [cities, setCities] = useState<string[]>(() => getRandomCities(6));
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Subscribe to new hearts being added
    const channel = supabase
      .channel("global-proof-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "hearts" },
        () => {
          // When a new heart is added, rotate in a new city
          setIsAnimating(true);
          setTimeout(() => {
            setCities(prev => {
              // Remove first city, add a new random one at the end
              const remaining = prev.slice(1);
              const newCity = getRandomCities(1, remaining)[0];
              return [...remaining, newCity];
            });
            setIsAnimating(false);
          }, 150);
        }
      )
      .subscribe();

    // Also rotate cities periodically to simulate global activity
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCities(prev => {
          const remaining = prev.slice(1);
          const newCity = getRandomCities(1, remaining)[0];
          return [...remaining, newCity];
        });
        setIsAnimating(false);
      }, 150);
    }, 8000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm text-muted-foreground tracking-widest uppercase">
          Hearts added today from
        </p>
        <p 
          className={`mt-3 text-base sm:text-lg text-foreground/80 font-light transition-opacity duration-150 ${
            isAnimating ? "opacity-50" : "opacity-100"
          }`}
        >
          {cities.join(" · ")}
        </p>
      </div>
    </section>
  );
};

export default GlobalProof;
