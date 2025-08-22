import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create a Supabase client using the anon key for authentication
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get the plan from request body
    const { plan } = await req.json();
    if (!plan) throw new Error("Plan is required");
    logStep("Plan received", { plan });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("Creating new customer");
    }

    // Define plan pricing (in cents)
    const plans = {
      monthly: {
        price: 2500, // R$ 25.00
        interval: "month" as const,
        name: "Plano Mensal - cofrin",
        trial_period_days: 30
      },
      semestral: {
        price: 12000, // R$ 120.00 (6 x R$ 20)
        interval: "month" as const,
        interval_count: 6,
        name: "Plano Semestral - cofrin",
        trial_period_days: 30
      },
      annual: {
        price: 18000, // R$ 180.00 (12 x R$ 15)
        interval: "year" as const,
        name: "Plano Anual - cofrin",
        trial_period_days: 30
      }
    };

    const selectedPlan = plans[plan as keyof typeof plans];
    if (!selectedPlan) throw new Error("Invalid plan selected");
    logStep("Selected plan", selectedPlan);

    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { 
              name: selectedPlan.name,
              description: `Acesso completo ao cofrin - Controle financeiro inteligente`
            },
            unit_amount: selectedPlan.price,
            recurring: { 
              interval: selectedPlan.interval,
              ...(selectedPlan.interval_count && { interval_count: selectedPlan.interval_count })
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${origin}/?canceled=true`,
      subscription_data: {
        trial_period_days: selectedPlan.trial_period_days,
      },
      allow_promotion_codes: true,
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});