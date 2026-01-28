import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PendingHeart = {
  name: string;
  recipientEmail: string | null;
  category: string;
  message: string | null;
  date: string; // yyyy-mm-dd
  createdAt: string;
};

export default function Thanks() {
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    const run = async () => {
      try {
        const raw = localStorage.getItem("pendingHeart");
        if (!raw) {
          setStatus("error");
          toast.error("No heart data found. Please try again.");
          return;
        }

        const pending: PendingHeart = JSON.parse(raw);

        // Create the heart in your database
        // NOTE: table/column names might differ in your project.
        // If this errors, paste the error message and I’ll adjust it to your schema.
        const { data, error } = await supabase
          .from("hearts")
          .insert([
            {
              name: pending.name,
              recipient_email: pending.recipientEmail,
              category: pending.category,
              message: pending.message,
              date: pending.date,
            },
          ])
          .select("id")
          .single();

        if (error) throw error;

        localStorage.removeItem("pendingHeart");
        setStatus("done");

        // Redirect to the heart share page (matches your existing route /heart/:id)
        window.location.href = `/heart/${data.id}`;
      } catch (e: any) {
        console.error(e);
        setStatus("error");
        toast.error("Payment received, but we couldn't add your heart. Please contact support.");
      }
    };

    run();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      {status === "loading" && (
        <div className="text-center">
          <h1 className="text-xl font-semibold">Thank you.</h1>
          <p className="text-muted-foreground mt-2">Placing your heart on the wall…</p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <h1 className="text-xl font-semibold">Almost there.</h1>
          <p className="text-muted-foreground mt-2">
            We couldn’t find your heart details. Please go back and try again.
          </p>
        </div>
      )}
    </main>
  );
}
