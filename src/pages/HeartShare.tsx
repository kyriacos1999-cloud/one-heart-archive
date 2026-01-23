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
  romantic: "from-rose-500 to-pink-500",
  family: "from-amber-500 to-orange-500",
  friendship: "from-violet-500 to-purple-500",
  memory: "from-slate-500 to-gray-500",
  self: "from-emerald-500 to-teal-500",
};

const HeartShare = () => {
  const { id } = useParams<{ id: string }>();
  const [heart, setHeart] = useState<Heart | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = heart
    ? `💕 ${heart.name} added a heart to the Heart Wall${heart.message ? `: "${heart.message}"` : ""}`
    : "Check out this heart on the Heart Wall!";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
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
        <div className="animate-pulse">
          <HeartIcon className="w-16 h-16 text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!heart) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <HeartIcon className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="font-serif text-2xl text-foreground mb-2">Heart not found</h1>
        <p className="text-muted-foreground mb-6">This heart may have been removed or doesn't exist.</p>
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Heart Wall
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 py-4 border-b border-border/50">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Heart Wall
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-12 sm:py-20">
        <div className="max-w-lg mx-auto text-center">
          {/* Heart Icon with gradient */}
          <div
            className={`w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-8 rounded-full bg-gradient-to-br ${categoryColors[heart.category] || categoryColors.romantic} p-6 shadow-lg`}
          >
            <HeartIcon className="w-full h-full text-white drop-shadow-md" />
          </div>

          {/* Category Badge */}
          <span className="inline-block px-4 py-1.5 bg-muted text-muted-foreground text-sm rounded-full mb-4">
            {categoryLabels[heart.category] || heart.category}
          </span>

          {/* Name */}
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-4">
            {heart.name}
          </h1>

          {/* Message */}
          {heart.message && (
            <p className="text-lg text-muted-foreground italic mb-6 max-w-md mx-auto">
              "{heart.message}"
            </p>
          )}

          {/* Date */}
          <p className="text-sm text-muted-foreground mb-10">
            {format(new Date(heart.date), "MMMM d, yyyy")}
          </p>

          {/* Share Section */}
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
            <h2 className="font-medium text-foreground mb-4">Share this heart</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={handleTwitterShare}
                variant="outline"
                className="gap-2"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                onClick={handleFacebookShare}
                variant="outline"
                className="gap-2"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="gap-2"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10">
            <p className="text-muted-foreground mb-4">Want to add your own heart?</p>
            <Button asChild>
              <Link to="/#add-heart">Add Your Heart</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeartShare;
