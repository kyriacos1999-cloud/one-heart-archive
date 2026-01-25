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
import confetti from "canvas-confetti";

const fireConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af'];

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();

  // Big burst in the middle
  confetti({
    particleCount: 100,
    spread: 100,
    origin: { y: 0.6 },
    colors,
  });
};

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
    const sessionId = urlParams.get("session_id");
    
    if (paymentStatus === "success" && sessionId) {
      // Fire confetti celebration
      fireConfetti();
      toast.success("Payment successful! Your heart has been added 💕", {
        duration: 5000,
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Fetch the heart ID and redirect to share page
      const fetchHeartAndRedirect = async () => {
        // Wait a moment for the webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const { data, error } = await supabase.functions.invoke("get-heart-by-session", {
            body: { sessionId },
          });
          
          if (!error && data?.heartId) {
            // Redirect to share page
            window.location.href = `/heart/${data.heartId}`;
          }
        } catch (err) {
          console.error("Error fetching heart:", err);
          // Fallback: scroll to heart wall
          const heartWall = document.querySelector('.grid.grid-cols-3');
          if (heartWall) {
            heartWall.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      };
      
      fetchHeartAndRedirect();
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
    <section id="add-heart" className="py-32 px-4 sm:px-6 lg:px-8 bg-card">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-14">
          <HeartIcon className="w-8 h-8 mx-auto mb-6 opacity-60 animate-breathe" />
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground">
            Leave Your Mark
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

          <div className="pt-8 space-y-5">
            <Button
              onClick={handleStripeCheckout}
              disabled={isSubmitting}
              className="w-full h-14 text-base font-medium rounded-md transition-all duration-400 hover:scale-[1.02]"
              size="lg"
            >
              <HeartIcon className="w-4 h-4 mr-2" />
              {isSubmitting ? "Processing..." : "Leave Your Heart — €1"}
            </Button>
            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              Your heart joins the archive.
              <br />
              It stays here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddHeartForm;