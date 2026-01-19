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

const HeartCard = ({ name, category, message, className, style }: HeartCardProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "heart-card rounded-sm p-4 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-105 cursor-pointer",
          className
        )}
        style={style}
      >
        <HeartIcon className="w-5 h-5 mb-2 opacity-80" />
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
              <HeartIcon className="w-10 h-10 text-primary" />
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
