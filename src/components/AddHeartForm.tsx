import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";
import HeartIcon from "./HeartIcon";

const AddHeartForm = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState<Date>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, category, message, date });
  };

  return (
    <section id="add-heart" className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <HeartIcon className="w-8 h-8 mx-auto mb-4 opacity-70" />
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground">
            Add Your Heart
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name(s)
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Emma & James"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="romantic">Romantic</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="friendship">Friendship</SelectItem>
                <SelectItem value="memory">Memory</SelectItem>
                <SelectItem value="self">Self</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message <span className="text-muted-foreground font-normal">(optional, 120 chars)</span>
            </Label>
            <Textarea
              id="message"
              placeholder="A moment worth remembering..."
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 120))}
              className="bg-background resize-none h-24"
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/120
            </p>
          </div>

          <Button
            type="submit"
            className="w-full py-6 text-base font-medium tracking-wide mt-4"
            size="lg"
          >
            Confirm & Add Heart — €1
          </Button>
        </form>
      </div>
    </section>
  );
};

export default AddHeartForm;
