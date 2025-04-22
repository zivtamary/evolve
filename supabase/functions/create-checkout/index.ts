import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
    // Create Supabase client
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    console.log('User:', user);
    if (authError || !user) {
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Get customer by supabase user id
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${POLAR_API_KEY_PROD}`
      }
    };
    /*    const customer = fetch('https://sandbox-api.polar.sh/v1/customers/external/{external_id}', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err)); */ const customerRequest = await fetch(`${POLAR_API_URL_PROD}/customers/external/${user.id}`, options);
    const customer = await customerRequest.json();
    console.log('Customer:', customer);
    let createdCustomer = null;
    if (!customerRequest.ok || !customer.id) {
      // Create customer https://sandbox-api.polar.sh/v1/customers/
      const response = await fetch(`${POLAR_API_URL_PROD}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${POLAR_API_KEY_PROD}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          external_id: user.id,
          name: user.user_metadata.full_name || user.email?.split('@')[0],
          metadata: {
            supabase_user_id: user.id
          }
        })
      }).catch((err)=>{
        console.error(err);
        throw new Error(err.message || 'Failed to create customer');
      });
      const responseData = await response.json();
      console.log('Create customer response:', responseData);
      if (!response.ok) {
        console.log('Failed to create customer');
        const error = await response.json();
        throw new Error(error.message || 'Failed to create customer');
      }
      console.log('Customer created:', responseData);
      console.log('About to save customer to supabase');
      // Save customer to supabase to profiles table under polar_customer_id
      await supabaseClient.from('profiles').update({
        polar_customer_id: responseData.id
      }).eq('id', user.id);
      console.log('Updated customer in supabase');
      createdCustomer = responseData;
    }
    // Get request body
    const { plan_id } = await req.json();
    console.log('Plan ID:', plan_id);
    if (!plan_id) {
      return new Response(JSON.stringify({
        error: 'Plan ID is required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log('User ID:', user.user_metadata.polar_customer_id);
    // Create Polar checkout session
    const response = await fetch(`${POLAR_API_URL_PROD}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POLAR_API_KEY_PROD}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer_id: customer?.id || createdCustomer?.id,
        customer_external_id: user.id,
        customer_email: user.email,
        product_id: plan_id,
        success_url: "https://evolve-app.com?checkout_id={CHECKOUT_ID}"
      })
    });
    const checkout = await response.json();
    console.log('Checkout:', checkout);
    return new Response(JSON.stringify({
      checkout_url: checkout.url
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.log('Error creating checkout session:', error);
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
