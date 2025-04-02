import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const POLAR_API_KEY = Deno.env.get('POLAR_API_KEY');
const POLAR_API_URL = 'https://api.polar.sh/api/v1';

serve(async (req) => {
  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the webhook payload
    const payload = await req.json();

    // Verify this is a new user event
    if (payload.type !== 'INSERT' || payload.table !== 'auth.users') {
      return new Response(
        JSON.stringify({ message: 'Not a new user event' }),
        { status: 200 }
      );
    }

    const user = payload.new;

    // Create Polar customer
    const response = await fetch(`${POLAR_API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POLAR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        name: user.raw_user_meta_data?.full_name || user.email?.split('@')[0],
        metadata: {
          supabase_user_id: user.id
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create Polar customer');
    }

    const customer = await response.json();

    // Store the Polar customer ID in the user's metadata
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.raw_user_meta_data,
          polar_customer_id: customer.id
        }
      }
    );

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ customer }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in create-polar-customer:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
}); 