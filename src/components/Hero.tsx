import HeartIcon from "./HeartIcon";
import { Button } from "./ui/button";
import { useHeartCount } from "@/hooks/useHeartCount";

const Hero = () => {
  const { count } = useHeartCount();

  const scrollToForm = () => {
    document.getElementById("add-heart")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20">
      <div className="animate-fade-in-up max-w-3xl">
        <HeartIcon className="w-12 h-12 mx-auto mb-8 animate-pulse-subtle" />
        
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground tracking-tight leading-tight">
          One Heart. One Euro. Forever.
        </h1>
        
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground font-light max-w-xl mx-auto text-balance">
          Add your heart to a living wall of human connection — before it closes.
        </p>
        
        <Button
          onClick={scrollToForm}
          className="mt-10 px-8 py-6 text-base font-medium tracking-wide"
          size="lg"
        >
          Add Your Heart
        </Button>
        
        <p className="mt-10 text-sm text-muted-foreground">
          <span className="font-serif italic">{count.toLocaleString()}</span>
          <span className="ml-1">hearts added</span>
        </p>
      </div>
    </section>
  );
};

export default Hero;
