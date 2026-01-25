import { useState } from "react";
import HeartIcon from "./HeartIcon";
import { cn } from "@/lib/utils";
import { Twitter, Facebook, Link2, Check, Instagram } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HeartCardProps {
  name: string;
  category: string;
  message?: string;
  date?: string;
  className?: string;
  style?: React.CSSProperties;
}

const categoryLabels: Record<string, string> = {
  romantic: "Romantic",
  family: "Family",
  friendship: "Friendship",
  memory: "Memory",
  self: "Self",
};

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

const HeartCard = ({ name, category, message, date, className, style }: HeartCardProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const colors = categoryColors[category] || categoryColors.romantic;

  const shareText = `${name} added a heart to the Heart Wall: "${message || "A heart full of love, placed here forever."}"`;
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareOnInstagram = () => {
    // Instagram doesn't have a direct share URL, so we copy the text and open Instagram
    navigator.clipboard.writeText(shareText);
    toast.success("Text copied! Opening Instagram...");
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareUrl} - ${shareText}`);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "rounded-sm p-4 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-105 cursor-pointer border",
          colors.bg,
          colors.border,
          colors.hover,
          className
        )}
        style={style}
      >
        <HeartIcon className={cn("w-5 h-5 mb-2 opacity-80", colors.icon)} />
        <p className="font-serif text-sm font-medium text-foreground leading-tight">
          {name}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {categoryLabels[category] || category}
        </p>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <HeartIcon className={cn("w-10 h-10", colors.icon)} />
            </div>
            <DialogTitle className="font-serif text-xl text-center">{name}</DialogTitle>
            <p className="text-xs text-muted-foreground">
              {categoryLabels[category] || category}
            </p>
            {date && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                {date}
              </p>
            )}
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-foreground/90 font-light leading-relaxed">
              {message || "A heart full of love, placed here forever."}
            </p>
          </div>
          
          {/* Social Share Buttons */}
          <div className="flex justify-center gap-3 pt-2 pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={shareOnTwitter}
              className="gap-2"
            >
              <Twitter className="w-4 h-4" />
              <span className="hidden sm:inline">Twitter</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareOnFacebook}
              className="gap-2"
            >
              <Facebook className="w-4 h-4" />
              <span className="hidden sm:inline">Facebook</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareOnInstagram}
              className="gap-2"
            >
              <Instagram className="w-4 h-4" />
              <span className="hidden sm:inline">Instagram</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyLink}
              className="gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeartCard;
