import HeartIcon from "./HeartIcon";
import { Button } from "./ui/button";
import { useHeartCount } from "@/hooks/useHeartCount";

const Hero = () => {
  const { count } = useHeartCount();

  const scrollToForm = () => {
    document.getElementById("add-heart")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-24">
      <div className="animate-fade-in-slow max-w-3xl">
        <HeartIcon className="w-10 h-10 mx-auto mb-10 animate-breathe opacity-80" />
        
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground tracking-tight leading-tight">
          One Heart. One Euro. Forever.
        </h1>
        
        <p className="mt-8 text-lg sm:text-xl text-muted-foreground font-light max-w-md mx-auto">
          A permanent record that someone was loved.
        </p>
        
        <p className="mt-12 text-base text-foreground/70 font-light italic">
          For someone. Or for yourself.
        </p>
        
        <Button
          onClick={scrollToForm}
          className="mt-8 px-10 py-6 text-base font-medium tracking-wide transition-transform duration-400 hover:scale-[1.02]"
          size="lg"
        >
          Leave Your Heart
        </Button>
        
        <p className="mt-14 text-sm text-muted-foreground">
          <span className="font-serif italic">{count.toLocaleString()}</span>
          <span className="ml-1">hearts in the archive</span>
        </p>
      </div>
    </section>
  );
};

export default Hero;
