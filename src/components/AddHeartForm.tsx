import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Apple } from "lucide-react";
import GooglePayButton from "@google-pay/button-react";
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

const AddHeartForm = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [isFormValid, setIsFormValid] = useState(false);
  const [applePayAvailable, setApplePayAvailable] = useState(false);

  useEffect(() => {
    // Check if Apple Pay is available
    if ((window as any).ApplePaySession && (window as any).ApplePaySession.canMakePayments()) {
      setApplePayAvailable(true);
    }
  }, []);

  const validateForm = () => {
    const valid = name.trim() !== "" && category !== "";
    setIsFormValid(valid);
    return valid;
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setMessage("");
    setDate(new Date());
  };

  const handlePaymentSuccess = (paymentData: google.payments.api.PaymentData) => {
    console.log("Payment successful:", paymentData);
    toast.success("Heart added successfully! 💕");
    resetForm();
  };

  const handleApplePay = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const ApplePaySession = (window as any).ApplePaySession;
    if (!ApplePaySession) {
      toast.error("Apple Pay is not available on this device");
      return;
    }

    const request = {
      countryCode: "IE",
      currencyCode: "EUR",
      supportedNetworks: ["visa", "masterCard", "amex"],
      merchantCapabilities: ["supports3DS"],
      total: { label: "Heart Wall", amount: "1.00" },
    };

    const session = new ApplePaySession(3, request);

    session.onvalidatemerchant = (event: any) => {
      // In production, you'd validate with your server
      console.log("Merchant validation:", event.validationURL);
      // For demo purposes, we'll complete the session
      session.abort();
      toast.info("Apple Pay requires merchant validation setup");
    };

    session.onpaymentauthorized = (event: any) => {
      console.log("Apple Pay authorized:", event.payment);
      session.completePayment(ApplePaySession.STATUS_SUCCESS);
      toast.success("Heart added successfully! 💕");
      resetForm();
    };

    session.oncancel = () => {
      console.log("Apple Pay cancelled");
    };

    session.begin();
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
            <div className="flex flex-col gap-3">
              <GooglePayButton
                environment="TEST"
                paymentRequest={{
                  apiVersion: 2,
                  apiVersionMinor: 0,
                  allowedPaymentMethods: [
                    {
                      type: "CARD",
                      parameters: {
                        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                        allowedCardNetworks: ["MASTERCARD", "VISA"],
                      },
                      tokenizationSpecification: {
                        type: "PAYMENT_GATEWAY",
                        parameters: {
                          gateway: "example",
                          gatewayMerchantId: "exampleGatewayMerchantId",
                        },
                      },
                    },
                  ],
                  merchantInfo: {
                    merchantId: "BCR2DN4T7XKVEMB7",
                    merchantName: "Heart Wall",
                  },
                  transactionInfo: {
                    totalPriceStatus: "FINAL",
                    totalPriceLabel: "Total",
                    totalPrice: "1.00",
                    currencyCode: "EUR",
                    countryCode: "IE",
                  },
                }}
                onLoadPaymentData={handlePaymentSuccess}
                onError={(error) => {
                  console.error("Google Pay error:", error);
                  toast.error("Payment failed. Please try again.");
                }}
                onClick={() => {
                  if (!validateForm()) {
                    toast.error("Please fill in all required fields");
                    return;
                  }
                }}
                buttonColor="black"
                buttonType="pay"
                buttonSizeMode="fill"
                style={{ width: "100%", height: 48 }}
              />
              
              {applePayAvailable && (
                <Button
                  onClick={handleApplePay}
                  className="w-full h-12 bg-black hover:bg-black/90 text-white font-medium rounded-md flex items-center justify-center gap-2"
                >
                  <Apple className="w-5 h-5" />
                  Pay with Apple Pay
                </Button>
              )}
              
              {!applePayAvailable && (
                <p className="text-xs text-center text-muted-foreground">
                  Apple Pay is available on Safari with compatible devices
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddHeartForm;