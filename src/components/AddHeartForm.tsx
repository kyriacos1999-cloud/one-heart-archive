import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, CreditCard } from "lucide-react";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AddHeartForm = () => {
  const [name, setName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check for payment success in URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    
    if (paymentStatus === "success") {
      toast.success("Payment successful! Your heart has been added 💕");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === "canceled") {
      toast.info("Payment was canceled");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const validateForm = () => {
    const valid = name.trim() !== "" && category !== "";
    setIsFormValid(valid);
    return valid;
  };

  const resetForm = () => {
    setName("");
    setRecipientEmail("");
    setCategory("");
    setMessage("");
    setDate(new Date());
  };

  const handleStripeCheckout = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-heart-payment", {
        body: {
          name: name.trim(),
          category,
          message: message.trim() || "",
          date: format(date, "yyyy-MM-dd"),
          recipientEmail: recipientEmail.trim() || "",
        },
      });

      if (error) {
        console.error("Error creating payment:", error);
        toast.error("Failed to start payment. Please try again.");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name(s)
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Emma & James"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                validateForm();
              }}
              onBlur={validateForm}
              className="bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientEmail" className="text-sm font-medium">
              Recipient Email <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="Send a notification to someone special"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">
              They'll receive a beautiful email letting them know a heart was added for them
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select 
              value={category} 
              onValueChange={(value) => {
                setCategory(value);
                setTimeout(validateForm, 0);
              }}
            >
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

          <div className="pt-4">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Add your heart for €1
            </p>
            <Button
              onClick={handleStripeCheckout}
              disabled={isSubmitting}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              {isSubmitting ? "Processing..." : "Pay €1 with Card"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddHeartForm;