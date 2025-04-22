import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
const POLAR_API_KEY_PROD = Deno.env.get('POLAR_API_KEY_PROD');

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  } 

Deno.serve(async (req)=>{
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
          headers: corsHeaders
        });
      }
  try {
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')
        }
      }
    });
    // Get the connected user's ID
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User not found');
    }
    const userId = user.id;
    // Delete associated data from the profiles table
    await supabaseClient.from('profiles').delete().eq('user_id', userId);
    // Add additional DELETE statements for other associated tables as needed
    // await supabaseClient.from('other_table').delete().eq('user_id', userId);
    // Finally, delete the user from the auth.users table
    await supabaseClient.auth.admin.deleteUser(userId);
    // Call Polar API to remove the customer
    const polarResponse = await fetch(`https://api.polar.com/v1/customers/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${POLAR_API_KEY_PROD}`
      }
    });
    if (!polarResponse.ok) {
      throw new Error('Failed to remove customer from Polar API');
    }
    return new Response(JSON.stringify({
      message: 'User deleted successfully'
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
      status: 400
    });
  }
});
