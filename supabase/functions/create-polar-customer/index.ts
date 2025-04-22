import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
const POLAR_API_KEY = Deno.env.get('POLAR_API_KEY');
const POLAR_API_KEY_PROD = Deno.env.get('POLAR_API_KEY_PROD');
const POLAR_API_URL = 'https://sandbox-api.polar.sh/v1';
const POLAR_API_URL_PROD = 'https://api.polar.sh/v1';
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Create a Supabase client
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'No authorization header'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 401
      });
    }
    // Get the user from the auth header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      return new Response(JSON.stringify({
        error: 'Invalid user'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 401
      });
    }
    // Create Polar customer
    const response = await fetch(`${POLAR_API_URL_PROD}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POLAR_API_KEY_PROD}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
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
    const { error: updateError } = await supabaseClient.auth.updateUser({
      data: {
        polar_customer_id: customer.id
      }
    });
    if (updateError) {
      throw updateError;
    }
    return new Response(JSON.stringify({
      customer
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
