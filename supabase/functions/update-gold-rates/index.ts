import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Read GoldAPI key from Deno environment variable
    const goldApiKey = Deno.env.get('GOLDAPI_KEY')
    if (!goldApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'GOLDAPI_KEY environment variable is not configured in Supabase Secrets.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 7. Get Supabase URL and Service Role Key from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Supabase URL or Service Role Key is not configured.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 2 & 3. Call GoldAPI endpoint with x-access-token header
    const goldApiRes = await fetch('https://www.goldapi.io/api/price/XAU/INR', {
      method: 'GET',
      headers: {
        'x-access-token': goldApiKey,
        'Content-Type': 'application/json',
      },
    })

    // 10. Handle GoldAPI failure
    if (!goldApiRes.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `GoldAPI request failed with status HTTP ${goldApiRes.status}`,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const data = await goldApiRes.json()

    // 4 & 5. Read and validate response fields — safely handle null/undefined/non-numeric.
    // Log only field presence (never log values or secrets).
    const fieldPresence = {
      has_price_gram_24k: data.price_gram_24k != null,
      has_price_gram_22k: data.price_gram_22k != null,
      has_price_gram_18k: data.price_gram_18k != null,
      has_price: data.price != null,
    }
    console.log('GoldAPI field presence:', JSON.stringify(fieldPresence))

    // Standard troy ounce to gram conversion factor (LBMA standard)
    const TROY_OZ_TO_GRAM = 31.1034768

    // Primary: use per-gram karat fields when present and valid
    let p24 = (data.price_gram_24k != null) ? Number(data.price_gram_24k) : NaN
    let p22 = (data.price_gram_22k != null) ? Number(data.price_gram_22k) : NaN
    let p18 = (data.price_gram_18k != null) ? Number(data.price_gram_18k) : NaN

    // Fallback: derive from base `price` (XAU spot per troy oz in INR)
    // when karat gram fields are absent or invalid (e.g. on lower-tier plans).
    // 24K = price / 31.1034768
    // 22K = 24K × (22/24)
    // 18K = 24K × (18/24)
    if ((isNaN(p24) || p24 <= 0) && data.price != null) {
      const pricePerGram24k = Number(data.price) / TROY_OZ_TO_GRAM
      if (!isNaN(pricePerGram24k) && pricePerGram24k > 0) {
        console.log('GoldAPI karat fields unavailable — deriving from base price field.')
        p24 = pricePerGram24k
        p22 = pricePerGram24k * (22 / 24)
        p18 = pricePerGram24k * (18 / 24)
      }
    }

    // Final validation — reject if any value is still invalid after fallback
    if (
      isNaN(p24) || p24 <= 0 ||
      isNaN(p22) || p22 <= 0 ||
      isNaN(p18) || p18 <= 0
    ) {
      console.error('GoldAPI validation failed after fallback. Field presence:', JSON.stringify(fieldPresence))
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid numeric price values received from GoldAPI. Karat fields unavailable and base price field missing or invalid.',
        }),
        {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 7. Initialize Supabase service-role client inside Edge Function
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const updatedAt = new Date().toISOString()

    // 6. Insert values into public.gold_rates
    const { error: dbError } = await supabase.from('gold_rates').insert({
      price_24k: p24,
      price_22k: p22,
      price_18k: p18,
      currency: 'INR',
      unit: 'gram',
      source: 'GoldAPI',
      updated_at: updatedAt,
    })

    if (dbError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to insert rates into database: ${dbError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 11. Return safe JSON response
    return new Response(
      JSON.stringify({
        success: true,
        price_24k: p24,
        price_22k: p22,
        price_18k: p18,
        updated_at: updatedAt,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: `Unexpected error: ${err.message || 'Internal Server Error'}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
