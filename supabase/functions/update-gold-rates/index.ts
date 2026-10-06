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
    // 1. Read MetalpriceAPI key from Deno environment variable
    const metalpriceApiKey = Deno.env.get('METALPRICE_API_KEY') || 'd18ebc22362256e0497a2d1080d18648'

    // 2. Get Supabase URL and Service Role Key from environment
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

    // 3. Call MetalpriceAPI endpoint
    const url = `https://api.metalpriceapi.com/v1/latest?api_key=${metalpriceApiKey}&base=INR&currencies=XAU`
    const apiRes = await fetch(url)

    if (!apiRes.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `MetalpriceAPI request failed with status HTTP ${apiRes.status}`,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const data = await apiRes.json()
    if (!data.success || !data.rates) {
      return new Response(
        JSON.stringify({
          success: false,
          error: data.error?.info || 'Invalid response from MetalpriceAPI',
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Standard troy ounce to gram conversion factor (LBMA standard)
    const TROY_OZ_TO_GRAM = 31.1034768

    // Parse XAU in INR
    const xauInInr = Number(data.rates.INRXAU || (data.rates.XAU ? (1 / data.rates.XAU) : 0))
    if (!xauInInr || xauInInr <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid XAU rate from MetalpriceAPI',
        }),
        {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const p24 = xauInInr / TROY_OZ_TO_GRAM
    const p22 = p24 * (22 / 24)
    const p18 = p24 * (18 / 24)

    // 4. Initialize Supabase service-role client inside Edge Function
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    const updatedAt = new Date().toISOString()

    // 5. Insert values into public.gold_rates
    const { error: dbError } = await supabase.from('gold_rates').insert({
      price_24k: Math.round(p24),
      price_22k: Math.round(p22),
      price_18k: Math.round(p18),
      currency: 'INR',
      unit: 'gram',
      source: 'MetalpriceAPI',
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

    // 6. Return safe JSON response
    return new Response(
      JSON.stringify({
        success: true,
        price_24k: Math.round(p24),
        price_22k: Math.round(p22),
        price_18k: Math.round(p18),
        source: 'MetalpriceAPI',
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
