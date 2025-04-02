import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { validateEvent } from "npm:@polar-sh/sdk/webhooks";

// Types
type WebhookEvent = {
  event_type: string;
  type: string;
  polar_event_id: string;
  created_at: string;
  modified_at: string;
  data: any;
};

type SubscriptionData = {
  polar_id: string;
  user_id: string;
  polar_price_id: string;
  currency: string;
  interval: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  amount: number;
  started_at: number;
  customer_id: string;
  metadata: Record<string, any>;
  custom_field_data: Record<string, any>;
  canceled_at?: number;
  ended_at?: number;
  customer_cancellation_reason?: string | null;
  customer_cancellation_comment?: string | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Verify Polar webhook signature
async function verifyPolarSignature(
  request: Request,
  body: string
): Promise<boolean> {
  try {
    // Internally validateEvent uses headers as a dictionary e.g. headers["webhook-id"]
    // So we need to convert the headers to a dictionary
    // (request.headers is a Headers object which is accessed as request.headers.get("webhook-id"))
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    validateEvent(body, headers, Deno.env.get("POLAR_WEBHOOK_SECRET"));
    return true;
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

// Utility functions
async function storeWebhookEvent(supabaseClient: any, body: any): Promise<any> {
  try {
    const { data, error } = await supabaseClient
      .from("webhook_events")
      .insert({
        event_type: body.type,
        type: body.type,
        polar_event_id: body.data.id,
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
        data: body.data,
      } as WebhookEvent)
      .select();

    if (error) {
      console.error("Error storing webhook event:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in storeWebhookEvent:", error);
    throw error;
  }
}

// Event handlers
async function handleCheckoutCreated(supabaseClient: any, body: any) {
  try {
    const { data, error } = await supabaseClient
      .from("payments")
      .insert({
        currency: body.data.currency,
        amount: body.data.amount / 100,
        status: body.data.status,
        user_id: body.data.metadata.customer_external_id,
        id: body.data.id,
      })
      .select();

    if (error) {
      console.error("Error inserting subscription:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ message: "handleCheckoutCreated created successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating handleCheckoutCreated:", error);
    return new Response(
      JSON.stringify({ error: "Failed to handleCheckoutCreated" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

async function handleCheckoutUpdated(supabaseClient: any, body: any) {
  try {
    const { data, error } = await supabaseClient
      .from("payments")
      .update({ status: body.data.status, subscriptionId: body.data.subscription_id })
      .eq("id", body.data.id);

    if (error) {
      console.error("Error handleCheckoutUpdated:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ message: "handleCheckoutUpdated created successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating handleCheckoutUpdated:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create handleCheckoutUpdated" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

async function handleSubscriptionCreated(supabaseClient: any, body: any) {
  try {
    const { data, error } = await supabaseClient
      .from("subscriptions")
      .insert({
        id: body.data.id,
        user_id: body.data.customer.external_id,
        status: body.data.status,
        plan_id: body.data.product_id,
        current_period_start: body.data.current_period_start,
        current_period_end: body.data.current_period_end,
        cancel_at_period_end: body.data.cancel_at_period_end
        
      })
      .select();

      if (data) {
        await supabaseClient.from('payments').update({
            subscriptionId: body.data.id
        }).eq('id', body.data.checkout_id)
      }

    if (error) {
      console.error("Error handleSubscriptionCreated subscription:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ message: "handleSubscriptionCreated created successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating handleSubscriptionCreated:", error);
    return new Response(
      JSON.stringify({ error: "Failed to handleSubscriptionCreated subscription" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

async function handleSubscriptionUpdated(supabaseClient: any, body: any) {
  try {
    const { data: existingSub } = await supabaseClient
      .from("subscriptions")
      .select()
      .eq("id", body.data.id)
      .single();

    if (existingSub) {
      const { error } = await supabaseClient
        .from("subscriptions")
        .update({
            status: body.data.status,
            current_period_start: body.data.current_period_start,
            current_period_end: body.data.current_period_end,
            cancel_at_period_end: body.data.cancel_at_period_end
        })
        .eq("id", body.data.id);

      if (error) {
        console.error("Error handleSubscriptionUpdated subscription:", error);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ message: "handleSubscriptionUpdated updated successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating handleSubscriptionUpdated:", error);
    return new Response(
      JSON.stringify({ error: "Failed to handleSubscriptionUpdated subscription" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Main webhook handler
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let eventId: string | null = null;

  try {
    // Clone the request to get the body as text for signature verification
    const clonedReq = req.clone();
    const rawBody = await clonedReq.text();
    const isValidSignature = await verifyPolarSignature(req, rawBody);

    if (!isValidSignature) {
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse the body as JSON
    const body = JSON.parse(rawBody);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Store the webhook event
    const eventData = await storeWebhookEvent(supabaseClient, body);
    eventId = eventData?.[0]?.id;

    // Handle the event based on type
    switch (body.type) {
      case "checkout.created":
        return await handleCheckoutCreated(supabaseClient, body);
      case "checkout.updated":
        return await handleCheckoutUpdated(supabaseClient, body);
      case "subscription.created":
        return await handleSubscriptionCreated(supabaseClient, body);
      case "subscription.updated":
        return await handleSubscriptionUpdated(supabaseClient, body);
      default:
        return new Response(
          JSON.stringify({ message: `Unhandled event type: ${body.type}` }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }
  } catch (err) {
    console.error("Error processing webhook:", err);

    // Try to update event status to error if we have an eventId
    if (eventId) {
      try {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        await supabaseClient
          .from("webhook_events")
          .update({ error: err.message })
          .eq("id", eventId);
      } catch (updateErr) {
        console.error("Error updating webhook event with error:", updateErr);
      }
    }

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
