import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const POLAR_WEBHOOK_SECRET = Deno.env.get('POLAR_WEBHOOK_SECRET')

serve(async (req) => {
  try {
    // Verify webhook signature
    const signature = req.headers.get('x-polar-signature')
    if (!signature || signature !== POLAR_WEBHOOK_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get webhook payload
    const payload = await req.json()
    const { event_type, data } = payload

    // Handle different event types
    switch (event_type) {
      case 'subscription.created':
      case 'subscription.updated': {
        const { customer_id, subscription_id, status, current_period_end } = data
        const user_id = data.metadata?.user_id

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
        const { subscription_id } = data

        // Update subscription status to canceled
        const { error: subscriptionError } = await supabaseClient
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('id', subscription_id)

        if (subscriptionError) throw subscriptionError
        break
      }

      case 'payment.succeeded': {
        const { subscription_id, amount, currency } = data

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
        const { subscription_id, amount, currency } = data

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
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}) 