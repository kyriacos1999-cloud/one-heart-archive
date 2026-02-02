import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import HeartIcon from "@/components/HeartIcon";
import { supabase } from "@/integrations/supabase/client";

export default function Thanks() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const heartId = searchParams.get("heartId");
  const paymentIntentId = searchParams.get("payment_intent");
  
  const [showHeart, setShowHeart] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);
  const [resolvedHeartId, setResolvedHeartId] = useState<string | null>(heartId);

  useEffect(() => {
    // If we have a payment_intent but no heartId, we need to confirm the payment and get the heartId
    const confirmPaymentAndGetHeart = async () => {
      if (paymentIntentId && !heartId) {
        try {
          const { data, error } = await supabase.functions.invoke("confirm-heart-payment", {
            body: { paymentIntentId },
          });

          if (!error && data?.heartId) {
            setResolvedHeartId(data.heartId);
          }
        } catch (err) {
          console.error("Error confirming payment:", err);
        }
      }
    };

    confirmPaymentAndGetHeart();
  }, [paymentIntentId, heartId]);

  useEffect(() => {
    // Staggered reveal animations
    setTimeout(() => setShowHeart(true), 300);
    setTimeout(() => setShowMessage(true), 1000);
    setTimeout(() => setShowSubtext(true), 1800);
  }, []);

  useEffect(() => {
    // Redirect to the hearts archive after the thank you animation
    const timer = setTimeout(() => {
      navigate("/hearts");
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-background">
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
    </main>
  );
}
