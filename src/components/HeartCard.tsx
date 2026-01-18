import HeartIcon from "./HeartIcon";
import { cn } from "@/lib/utils";

interface HeartCardProps {
  name: string;
  category: string;
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

const HeartCard = ({ name, category, className, style }: HeartCardProps) => {
  return (
    <div
      className={cn(
        "heart-card rounded-sm p-4 flex flex-col items-center justify-center text-center transition-all duration-300",
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
    </div>
  );
};

export default HeartCard;
