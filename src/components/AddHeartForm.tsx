import { useState, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
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
import StripePaymentForm from "./StripePaymentForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const stripePromise = loadStripe("pk_live_51MOSNfF5cmmFi3mj550iCWkE5yGdp1JU7PdhP9Mrw7J11Ne2Zp1oTY70HYrMZvAfWrJhCAb9oSMSHebLlKSJ7rZH00nx8BGFza");

const AddHeartForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  
  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);

  const isCurrentlyValid = name.trim() !== "" && category !== "";

  const handleValidationError = () => {
    toast.error("Please fill in all required fields");
  };

  const handleProceedToPayment = async () => {
    if (!isCurrentlyValid) {
      handleValidationError();
      return;
    }

    setIsCreatingIntent(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-payment-intent", {
        body: {
          name: name.trim(),
          senderName: senderName.trim() || "",
          category,
          message: message.trim() || "",
          date: format(date, "yyyy-MM-dd"),
          recipientEmail: recipientEmail.trim() || "",
        },
      });

      if (error) {
        // Provide the most actionable error message we can (esp. for mobile autofill issues)
        const ctx = (error as unknown as { context?: { body?: unknown } }).context;
        const ctxBody = ctx?.body as unknown;
        const backendMsg =
          (typeof ctxBody === "object" && ctxBody && "error" in ctxBody && typeof (ctxBody as any).error === "string")
            ? (ctxBody as any).error
            : undefined;

        throw new Error(backendMsg || (error as Error).message || "Failed to create payment");
      }
      if (!data?.clientSecret) throw new Error("Failed to create payment");

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setShowPayment(true);
    } catch (err) {
      console.error("Error creating payment intent:", err);
      const msg = err instanceof Error ? err.message : "Failed to initialize payment. Please try again.";
      toast.error(msg);
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!paymentIntentId) return;

    try {
      const { data, error } = await supabase.functions.invoke("confirm-heart-payment", {
        body: { paymentIntentId },
      });

      if (error) throw error;

      // Redirect to thanks page with the heart ID
      navigate(`/thanks?heartId=${data.heartId}`);
    } catch (err) {
      console.error("Error confirming payment:", err);
      // Payment succeeded but confirmation failed - still redirect
      toast.success("Payment successful! Your heart has been added.");
      navigate("/thanks");
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    toast.error(errorMessage);
  };

  const handleBackToForm = () => {
    setShowPayment(false);
    setClientSecret(null);
    setPaymentIntentId(null);
  };

  // Payment view with Stripe Elements
  if (showPayment && clientSecret) {
    return (
      <section id="add-heart" className="py-32 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <HeartIcon className="w-8 h-8 mx-auto mb-6 opacity-60 animate-breathe" />
            <h2 className="text-xl font-medium mb-2">Complete Your Heart</h2>
            <p className="text-sm text-muted-foreground">
              Secure payment powered by Stripe
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 mb-6 border">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium capitalize">{category}</span>
              </div>
              {recipientEmail && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notify</span>
                  <span className="font-medium text-xs">{recipientEmail}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank Fees</span>
                <span className="font-medium">€0.30</span>
              </div>
            </div>
          </div>

          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#be123c",
                },
              },
            }}
          >
            <StripePaymentForm
              paymentIntentId={paymentIntentId!}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </Elements>


          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={handleBackToForm}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to form
          </Button>
        </div>
      </section>
    );
  }

  // Form view
  return (
    <section id="add-heart" className="py-32 px-4 sm:px-6 lg:px-8 bg-card">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-14">
          <HeartIcon className="w-8 h-8 mx-auto mb-6 opacity-60 animate-breathe" />
          <p className="text-base text-muted-foreground font-light italic">
            Someone came to mind.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name on the heart
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="The person this heart is for"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderName" className="text-sm font-medium">
              Your name{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="senderName"
              type="text"
              placeholder="So they know who placed it"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientEmail" className="text-sm font-medium">
              Recipient email{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
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
              onValueChange={setCategory}
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
            <Label className="text-sm font-medium">
              Date{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
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
              Message{" "}
              <span className="text-muted-foreground font-normal">
                (optional, 120 chars)
              </span>
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
            <p className="text-center text-sm text-muted-foreground font-light">
              Whenever it feels true.
            </p>

            <Button
              className="w-full h-14 text-base"
              disabled={!isCurrentlyValid || isCreatingIntent}
              onClick={handleProceedToPayment}
            >
              {isCreatingIntent ? "Preparing payment..." : "Place a heart — €1"}
            </Button>

            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              It stays.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddHeartForm;
