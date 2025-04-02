import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const POLAR_WEBHOOK_SECRET = Deno.env.get('POLAR_WEBHOOK_SECRET')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify webhook signature
    const signature = req.headers.get('x-polar-signature')
    if (!signature || signature !== POLAR_WEBHOOK_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get webhook payload
    const payload = await req.json()

    // Handle different event types
    switch (payload.type) {
      case 'subscription.created':
      case 'subscription.updated': {
        const { customer_id, subscription_id, status, current_period_end } = payload.data
        const user_id = payload.data.metadata?.user_id

        if (!user_id) {
          throw new Error('User ID not found in metadata')
        }

        // Update subscription in database
        const { error: subscriptionError } = await supabaseClient
          .from('subscriptions')
          .upsert({
            id: subscription_id,
            user_id,
            status,
            current_period_end,
            updated_at: new Date().toISOString()
          })

        if (subscriptionError) throw subscriptionError
        break
      }

      case 'subscription.deleted': {
        const { subscription_id } = payload.data

        // Update subscription status to canceled
        const { error: subscriptionError } = await supabaseClient
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('id', subscription_id)

        if (subscriptionError) throw subscriptionError
        break
      }

      case 'payment.succeeded': {
        const { subscription_id, amount, currency } = payload.data

        // Create payment record
        const { error: paymentError } = await supabaseClient
          .from('payments')
          .insert({
            subscription_id,
            amount,
            currency,
            status: 'succeeded'
          })

        if (paymentError) throw paymentError
        break
      }

      case 'payment.failed': {
        const { subscription_id, amount, currency } = payload.data

        // Create failed payment record
        const { error: paymentError } = await supabaseClient
          .from('payments')
          .insert({
            subscription_id,
            amount,
            currency,
            status: 'failed'
          })

        if (paymentError) throw paymentError
        break
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}) 