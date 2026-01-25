import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Twitter, Facebook, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeartIcon from "@/components/HeartIcon";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Heart {
  id: string;
  name: string;
  category: string;
  message: string | null;
  date: string;
}

const categoryLabels: Record<string, string> = {
  romantic: "Romantic Love",
  family: "Family Love",
  friendship: "Friendship",
  memory: "In Memory",
  self: "Self Love",
};

const categoryColors: Record<string, string> = {
  romantic: "text-[hsl(350,60%,65%)]",
  family: "text-[hsl(35,80%,55%)]",
  friendship: "text-[hsl(200,70%,55%)]",
  memory: "text-[hsl(270,50%,70%)]",
  self: "text-[hsl(140,30%,55%)]",
};

const HeartShare = () => {
  const { id } = useParams<{ id: string }>();
  const [heart, setHeart] = useState<Heart | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const fetchHeart = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("hearts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching heart:", error);
      } else {
        setHeart(data);
      }
      setLoading(false);
    };

    fetchHeart();
  }, [id]);

  // Intentional pause before revealing content
  useEffect(() => {
    if (!loading && heart) {
      // Let the page breathe before showing content
      const contentTimer = setTimeout(() => setShowContent(true), 800);
      // Delay share options further
      const shareTimer = setTimeout(() => setShowShare(true), 2000);
      
      return () => {
        clearTimeout(contentTimer);
        clearTimeout(shareTimer);
      };
    }
  }, [loading, heart]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = heart
    ? `${heart.name} — a heart in the archive.`
    : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-breathe">
          <HeartIcon className="w-12 h-12 text-muted-foreground/50" />
        </div>
      </div>
    );
  }

  if (!heart) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <HeartIcon className="w-12 h-12 text-muted-foreground mb-6" />
        <h1 className="font-serif text-2xl text-foreground mb-2">Heart not found</h1>
        <p className="text-muted-foreground mb-8">This heart may have been removed.</p>
        <Button asChild variant="ghost">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - minimal */}
      <header className="px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-16 sm:py-24">
        <div className="max-w-md mx-auto text-center">
          
          {/* Confirmation line - appears first */}
          <p 
            className={`text-sm text-muted-foreground mb-10 transition-opacity duration-700 ${
              showContent ? "opacity-100" : "opacity-0"
            }`}
          >
            Your heart is here now. It stays.
          </p>

          {/* Heart Icon - muted, not celebratory */}
          <div
            className={`mb-8 transition-all duration-700 delay-200 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <HeartIcon 
              className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto ${categoryColors[heart.category] || categoryColors.romantic}`} 
            />
          </div>

          {/* Category - subtle */}
          <span 
            className={`inline-block text-xs text-muted-foreground tracking-widest uppercase mb-4 transition-opacity duration-500 delay-300 ${
              showContent ? "opacity-100" : "opacity-0"
            }`}
          >
            {categoryLabels[heart.category] || heart.category}
          </span>

          {/* Name */}
          <h1 
            className={`font-serif text-2xl sm:text-3xl font-medium text-foreground mb-4 transition-all duration-500 delay-400 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {heart.name}
          </h1>

          {/* Message */}
          {heart.message && (
            <p 
              className={`text-base text-muted-foreground italic mb-6 max-w-sm mx-auto transition-opacity duration-500 delay-500 ${
                showContent ? "opacity-100" : "opacity-0"
              }`}
            >
              "{heart.message}"
            </p>
          )}

          {/* Date */}
          <p 
            className={`text-sm text-muted-foreground/70 mb-16 transition-opacity duration-500 delay-500 ${
              showContent ? "opacity-100" : "opacity-0"
            }`}
          >
            {format(new Date(heart.date), "MMMM d, yyyy")}
          </p>

          {/* Share Section - appears later, not eager */}
          <div 
            className={`transition-opacity duration-700 ${
              showShare ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="text-xs text-muted-foreground mb-4">If you'd like to share</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                onClick={handleTwitterShare}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleFacebookShare}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Quiet CTA */}
            <div className="mt-16 pt-8 border-t border-border/30">
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                <Link to="/#add-heart">Leave your own</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeartShare;
