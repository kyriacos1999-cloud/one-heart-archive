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
            <div className="space-y-3">
              <Button
                onClick={handleStripeCheckout}
                disabled={isSubmitting}
                className="w-full h-12 bg-black hover:bg-black/90 text-white font-medium rounded-md flex items-center justify-center gap-3"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                {isSubmitting ? "Processing..." : "Pay with Apple Pay"}
              </Button>
              <Button
                onClick={handleStripeCheckout}
                disabled={isSubmitting}
                variant="outline"
                className="w-full h-12 bg-background hover:bg-muted text-foreground border-2 border-foreground font-medium rounded-md flex items-center justify-center gap-3"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isSubmitting ? "Processing..." : "Pay with Google Pay"}
              </Button>
              <Button
                onClick={handleStripeCheckout}
                disabled={isSubmitting}
                variant="outline"
                className="w-full h-12 font-medium rounded-md flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {isSubmitting ? "Processing..." : "Pay €1 with Card"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddHeartForm;