import { useState } from "react";
import HeartIcon from "./HeartIcon";
import { cn } from "@/lib/utils";
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

const HeartCard = ({ name, category, message, className, style }: HeartCardProps) => {
  const [open, setOpen] = useState(false);
  const colors = categoryColors[category] || categoryColors.romantic;

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
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-foreground/90 font-light leading-relaxed">
              {message || "A heart full of love, placed here forever."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeartCard;
