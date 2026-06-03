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

    const url = `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A2:H10000`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': GOOGLE_SHEETS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Sheets API error:', response.status, errorData);
      throw new Error(`Google Sheets API error: ${response.status}`);
    }

    const data = await response.json();
    const rows: string[][] = data.values || [];

    const transactions = rows
      .filter((r) => r && r[0])
      .map((r) => ({
        id: r[0] || '',
        name: r[1] || '',
        date: r[2] || '',
        amount: parseFloat(r[3] || '0') || 0,
        type: r[4] || '',
        category: r[5] || '',
        description: r[6] || '',
        project: r[7] || '',
      }))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    console.log(`Fetched ${transactions.length} transactions`);

    return new Response(JSON.stringify({ success: true, transactions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
