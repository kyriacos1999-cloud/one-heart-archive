import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeartIcon from "./HeartIcon";
import { cn } from "@/lib/utils";
import { Facebook, Instagram, Link2, Check } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HeartCardProps {
  id?: string;
  name: string;
  category: string;
  message?: string;
  date?: string;
  className?: string;
  style?: React.CSSProperties;
}

const categoryColors: Record<string, { bg: string; border: string; hover: string; icon: string }> = {
  romantic: {
    bg: "bg-heart-romantic-muted/40",
    border: "border-heart-romantic/20",
    hover: "hover:bg-heart-romantic-muted/60",
    icon: "text-heart-romantic",
  },
  family: {
    bg: "bg-heart-family-muted/40",
    border: "border-heart-family/20",
    hover: "hover:bg-heart-family-muted/60",
    icon: "text-heart-family",
  },
  friendship: {
    bg: "bg-heart-friendship-muted/40",
    border: "border-heart-friendship/20",
    hover: "hover:bg-heart-friendship-muted/60",
    icon: "text-heart-friendship",
  },
  memory: {
    bg: "bg-heart-memory-muted/40",
    border: "border-heart-memory/20",
    hover: "hover:bg-heart-memory-muted/60",
    icon: "text-heart-memory",
  },
  self: {
    bg: "bg-heart-self-muted/40",
    border: "border-heart-self/20",
    hover: "hover:bg-heart-self-muted/60",
    icon: "text-heart-self",
  },
};

const HeartCard = ({ id, name, category, message, date, className, style }: HeartCardProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const colors = categoryColors[category] || categoryColors.romantic;

  // Generate unique share URL if heart has an ID
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = id ? `${baseUrl}/heart/${id}` : baseUrl;
  const shareText = `${name} — a heart in the archive.`;
  const fullShareText = message 
    ? `${name}: "${message}" — a heart in the archive.`
    : shareText;

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareOnInstagram = async () => {
    try {
      await navigator.clipboard.writeText(`${fullShareText}\n${shareUrl}`);
      toast.success("Copied — paste in Instagram");
      window.open("https://instagram.com", "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const shareOnTikTok = async () => {
    try {
      await navigator.clipboard.writeText(`${fullShareText}\n${shareUrl}`);
      toast.success("Copied — paste in TikTok");
      window.open("https://tiktok.com", "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const viewHeartPage = () => {
    if (id) {
      setOpen(false);
      navigate(`/heart/${id}`);
    }
  };

  // Subtle opacity variation for human imperfection
  const baseOpacity = style?.animationDelay 
    ? 0.92 + (parseInt(style.animationDelay) % 5) * 0.02 
    : 1;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "rounded-sm p-4 flex flex-col items-center justify-center text-center transition-all duration-500 hover:scale-[1.02] cursor-pointer border",
          colors.bg,
          colors.border,
          colors.hover,
          className
        )}
        style={{ ...style, opacity: baseOpacity }}
      >
        <HeartIcon className={cn("w-5 h-5 mb-2 opacity-70", colors.icon)} />
        <p className="font-serif text-sm font-medium text-foreground/90 leading-tight">
          {name}
        </p>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <HeartIcon className={cn("w-10 h-10 opacity-80", colors.icon)} />
            </div>
            <DialogTitle className="font-serif text-xl text-center">{name}</DialogTitle>
            {date && (
              <p className="text-xs text-muted-foreground/50 mt-2">
                {date}
              </p>
            )}
          </DialogHeader>
          <div className="py-6">
            <p className="text-center text-foreground/80 font-light leading-relaxed">
              {message || "A heart full of love, placed here forever."}
            </p>
          </div>
          
          {/* Share options - only show if heart has ID */}
          {id ? (
            <div className="border-t border-border/30 pt-4 mt-2">
              <p className="text-xs text-muted-foreground text-center mb-3">Share this heart</p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareOnFacebook}
                  className="text-muted-foreground hover:text-foreground"
                  title="Share on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareOnInstagram}
                  className="text-muted-foreground hover:text-foreground"
                  title="Share on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareOnTikTok}
                  className="text-muted-foreground hover:text-foreground"
                  title="Share on TikTok"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyLink}
                  className="text-muted-foreground hover:text-foreground"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                </Button>
              </div>
              <div className="text-center mt-4">
                <Button
                  variant="link"
                  size="sm"
                  onClick={viewHeartPage}
                  className="text-xs text-muted-foreground"
                >
                  View full page
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-t border-border/30 pt-4 mt-2">
              <p className="text-xs text-muted-foreground/50 text-center">
                Demo heart
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeartCard;
