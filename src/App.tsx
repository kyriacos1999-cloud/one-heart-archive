import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Index from "./pages/Index";
import Hearts from "./pages/Hearts";
import HeartShare from "./pages/HeartShare";
import Thanks from "./pages/Thanks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const RootPaymentRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Stripe may redirect back with query params to the root URL (static hosting safe).
    // Forward those params to /thanks, where we confirm and then redirect to /heart/:id.
    const params = new URLSearchParams(location.search);
    if (location.pathname === "/" && params.has("payment_intent")) {
      navigate(`/thanks${location.search}`, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RootPaymentRedirect />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hearts" element={<Hearts />} />
          <Route path="/heart/:id" element={<HeartShare />} />
          <Route path="/thanks" element={<Thanks />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
