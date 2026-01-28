import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import HeartIcon from "@/components/HeartIcon";

type PendingHeart = {
  name: string;
  recipientEmail: string | null;
  category: string;
  message: string | null;
  date: string;
  createdAt: string;
};

export default function Thanks() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [showHeart, setShowHeart] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const raw = localStorage.getItem("pendingHeart");
        if (!raw) {
          setStatus("error");
          toast.error("No heart data found. Please try again.");
          return;
        }

        const pending: PendingHeart = JSON.parse(raw);

        const { data, error } = await supabase
          .from("hearts")
          .insert([
            {
              name: pending.name,
              recipient_email: pending.recipientEmail,
              category: pending.category,
              message: pending.message,
              date: pending.date,
            },
          ])
          .select("id")
          .single();

        if (error) throw error;

        localStorage.removeItem("pendingHeart");
        setStatus("success");

        // Staggered reveal animations
        setTimeout(() => setShowHeart(true), 300);
        setTimeout(() => setShowMessage(true), 1000);
        setTimeout(() => setShowSubtext(true), 1800);

        // Redirect to the heart share page after a moment
        setTimeout(() => {
          window.location.href = `/heart/${data.id}`;
        }, 3500);
      } catch (e: unknown) {
        console.error(e);
        setStatus("error");
        toast.error("Payment received, but we couldn't add your heart. Please contact support.");
      }
    };

    run();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-background">
      {status === "loading" && (
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-8">
            <HeartIcon className="w-12 h-12 text-primary/40 animate-pulse" />
          </div>
          <p className="text-muted-foreground font-light">Placing your heart...</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center max-w-sm">
          {/* Heart icon with gentle scale-in animation */}
          <div 
            className={`relative w-16 h-16 mx-auto mb-10 transition-all duration-1000 ease-out ${
              showHeart 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-75"
            }`}
          >
            <HeartIcon className="w-16 h-16 text-primary" />
            {/* Subtle pulse ring */}
            <div 
              className={`absolute inset-0 rounded-full border border-primary/20 transition-all duration-1000 delay-500 ${
                showHeart 
                  ? "opacity-0 scale-150" 
                  : "opacity-100 scale-100"
              }`}
            />
          </div>

          {/* Main message */}
          <h1 
            className={`font-serif text-2xl md:text-3xl text-foreground mb-4 transition-all duration-1000 ease-out ${
              showMessage 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-4"
            }`}
          >
            It stays.
          </h1>

          {/* Subtext */}
          <p 
            className={`text-muted-foreground font-light text-sm transition-all duration-1000 ease-out ${
              showSubtext 
                ? "opacity-60 translate-y-0" 
                : "opacity-0 translate-y-4"
            }`}
          >
            Forever on the wall.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center max-w-sm">
          <HeartIcon className="w-10 h-10 mx-auto mb-6 text-muted-foreground/50" />
          <h1 className="font-serif text-xl text-foreground mb-3">Almost there.</h1>
          <p className="text-muted-foreground font-light text-sm leading-relaxed">
            We couldn't find your heart details. Please go back and try again.
          </p>
        </div>
      )}
    </main>
  );
}
