import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import HeartIcon from "@/components/HeartIcon";

export default function Thanks() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const heartId = searchParams.get("heartId");
  
  const [showHeart, setShowHeart] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);

  useEffect(() => {
    // Staggered reveal animations
    setTimeout(() => setShowHeart(true), 300);
    setTimeout(() => setShowMessage(true), 1000);
    setTimeout(() => setShowSubtext(true), 1800);

    // Redirect to the heart share page after a moment (if we have an ID)
    // Otherwise just stay on the thank you page
    if (heartId) {
      setTimeout(() => {
        navigate(`/heart/${heartId}`);
      }, 3500);
    }
  }, [heartId, navigate]);

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
