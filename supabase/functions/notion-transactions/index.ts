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

    const { name, date, amount, type, category, description, project } = await req.json();
    const id = crypto.randomUUID();
    const typeName = type === 'income' ? 'Pemasukan' : type === 'expense' ? 'Pengeluaran' : type;
    const row = [id, name || 'Transaksi', date || '', amount ?? 0, typeName, category || '', description || '', project || ''];

    const url = `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A:H:append?valueInputOption=USER_ENTERED`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': GOOGLE_SHEETS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Sheets API error:', response.status, errorData);
      throw new Error(`Google Sheets API error: ${response.status}`);
    }

    return new Response(JSON.stringify({ success: true, id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error adding transaction:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
