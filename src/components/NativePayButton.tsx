import { useState, useEffect, useRef } from "react";
import {
  PaymentRequest,
  loadStripe,
  Stripe,
} from "@stripe/stripe-js";
import { Button } from "./ui/button";
import HeartIcon from "./HeartIcon";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Use your Stripe publishable key
const stripePromise = loadStripe("pk_live_51SrpVaF5cmmFi3mjYvHWj6GbLLMQJzVPxFxr5sxhgHg0FZR2iGPZfDzgLPOg9NP9eGFjhF09kpRzzEpY0iQVQPLI00jJPQyNOh");

interface NativePayButtonProps {
  name: string;
  category: string;
  message: string;
  date: string;
  recipientEmail: string;
  isFormValid: boolean;
  onValidationError: () => void;
}

const NativePayButton = ({
  name,
  category,
  message,
  date,
  recipientEmail,
  isFormValid,
  onValidationError,
}: NativePayButtonProps) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [canMakePayment, setCanMakePayment] = useState<"applePay" | "googlePay" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Store form data in refs so the event handler always has latest values
  const formDataRef = useRef({ name, category, message, date, recipientEmail });
  
  useEffect(() => {
    formDataRef.current = { name, category, message, date, recipientEmail };
  }, [name, category, message, date, recipientEmail]);

  useEffect(() => {
    const initStripe = async () => {
      const stripeInstance = await stripePromise;
      if (!stripeInstance) return;
      setStripe(stripeInstance);

      const pr = stripeInstance.paymentRequest({
        country: "IE",
        currency: "eur",
        total: {
          label: "Heart Wall",
          amount: 100, // €1 in cents
        },
        requestPayerName: false,
        requestPayerEmail: false,
      });

      const result = await pr.canMakePayment();
      if (result) {
        setPaymentRequest(pr);
        if (result.applePay) {
          setCanMakePayment("applePay");
        } else if (result.googlePay) {
          setCanMakePayment("googlePay");
        }
      }
    };

    initStripe();
  }, []);

  const handleNativePayment = async () => {
    if (!isFormValid) {
      onValidationError();
      return;
    }

    if (!stripe || !paymentRequest) {
      toast.error("Payment not available");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = formDataRef.current;
      
      // Create payment intent on the backend
      const { data: intentData, error: intentError } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: {
            name: formData.name.trim(),
            category: formData.category,
            message: formData.message.trim() || "",
            date: formData.date,
            recipientEmail: formData.recipientEmail.trim() || "",
          },
        }
      );

      if (intentError || !intentData?.clientSecret) {
        console.error("Error creating payment intent:", intentError);
        throw new Error(intentError?.message || "Failed to create payment");
      }

      const clientSecret = intentData.clientSecret;
      const paymentIntentId = intentData.paymentIntentId;

      // Remove any existing listeners and add new one
      paymentRequest.off("paymentmethod");
      
      paymentRequest.on("paymentmethod", async (ev) => {
        try {
          const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (confirmError) {
            ev.complete("fail");
            toast.error(confirmError.message || "Payment failed");
            setIsProcessing(false);
            return;
          }

          if (paymentIntent?.status === "requires_action") {
            const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
            if (actionError) {
              ev.complete("fail");
              toast.error(actionError.message || "Payment failed");
              setIsProcessing(false);
              return;
            }
          }

          ev.complete("success");

          // Confirm the payment and save the heart
          const { data: confirmData, error: confirmFnError } = await supabase.functions.invoke(
            "confirm-heart-payment",
            {
              body: { paymentIntentId },
            }
          );

          if (confirmFnError || !confirmData?.heartId) {
            console.error("Error confirming heart:", confirmFnError, confirmData);
            toast.error("Payment succeeded but failed to save heart. Please contact support.");
            setIsProcessing(false);
            return;
          }

          // Redirect to share page
          window.location.href = `/heart/${confirmData.heartId}`;
        } catch (error) {
          console.error("Payment method handler error:", error);
          ev.complete("fail");
          toast.error("Payment processing failed");
          setIsProcessing(false);
        }
      });

      // Show the native payment sheet
      paymentRequest.show();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Payment failed");
      setIsProcessing(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!isFormValid) {
      onValidationError();
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-heart-payment", {
        body: {
          name: name.trim(),
          category,
          message: message.trim() || "",
          date,
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
      setIsProcessing(false);
    }
  };

  // If native payment is available, show the appropriate button
  if (canMakePayment) {
    return (
      <Button
        onClick={handleNativePayment}
        disabled={isProcessing}
        className="w-full h-14 text-base font-medium rounded-md transition-all duration-400 hover:scale-[1.02]"
        size="lg"
      >
        {canMakePayment === "applePay" ? (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.72 7.54c-.96-1.15-2.24-1.82-3.44-1.82-1.62 0-2.3.77-3.43.77-1.16 0-2.04-.77-3.44-.77-1.35 0-2.79.82-3.76 2.22-1.36 1.97-.73 4.95.97 6.76.68.73 1.51 1.55 2.57 1.55.97 0 1.42-.63 2.67-.63 1.26 0 1.58.63 2.66.63 1.07 0 1.8-.73 2.57-1.55.46-.49.82-1.05 1.08-1.63-2.67-1.03-3.13-4.87-.45-6.3v-.23zm-4.12-2.14c.8-.96 1.41-2.32 1.19-3.68-1.22.09-2.65.83-3.48 1.82-.76.9-1.39 2.26-1.14 3.57 1.34.05 2.64-.73 3.43-1.71z"/>
            </svg>
            {isProcessing ? "Processing..." : "Pay with Apple Pay — €1"}
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            {isProcessing ? "Processing..." : "Pay with Google Pay — €1"}
          </>
        )}
      </Button>
    );
  }

  // Fallback to regular Stripe Checkout
  return (
    <Button
      onClick={handleStripeCheckout}
      disabled={isProcessing}
      className="w-full h-14 text-base font-medium rounded-md transition-all duration-400 hover:scale-[1.02]"
      size="lg"
    >
      <HeartIcon className="w-4 h-4 mr-2" />
      {isProcessing ? "Processing..." : "Place a heart — €1"}
    </Button>
  );
};

export default NativePayButton;
