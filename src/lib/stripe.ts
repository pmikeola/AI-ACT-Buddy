import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

export type PriceTier = "starter" | "pro";

export async function redirectToCheckout(tier: PriceTier) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("You must be signed in to subscribe.");
  }

  const response = await supabase.functions.invoke("create-checkout", {
    body: { tier, returnUrl: window.location.origin },
  });

  if (response.error) {
    throw new Error(response.error.message || "Failed to create checkout session");
  }

  const { url } = response.data;
  if (!url) {
    throw new Error("No checkout URL returned");
  }

  window.location.href = url;
}

export { stripePromise };
