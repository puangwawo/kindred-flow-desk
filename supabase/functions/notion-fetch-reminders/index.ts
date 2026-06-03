import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPREADSHEET_ID = '10u7hcfcZX94PXRRR3GSxLOvnMoMSQY84bCNLssxY8Is';
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_sheets/v4';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_SHEETS_API_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    if (!GOOGLE_SHEETS_API_KEY) throw new Error('GOOGLE_SHEETS_API_KEY is not configured');

    const url = `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/Reminders!A2:F10000`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': GOOGLE_SHEETS_API_KEY,
      },
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Sheets error:', response.status, err);
      throw new Error(`Google Sheets error: ${response.status}`);
    }

    const data = await response.json();
    const rows: string[][] = data.values || [];
    const reminders = rows
      .filter((r) => r && r[0])
      .map((r) => ({
        id: r[0] || '',
        date: r[1] || '',
        time: r[2] || '',
        title: r[3] || '',
        notes: r[4] || '',
        status: r[5] || 'pending',
      }))
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

    return new Response(JSON.stringify({ success: true, reminders }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});