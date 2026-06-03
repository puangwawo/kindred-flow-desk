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

    const { pageId } = await req.json();
    if (!pageId) throw new Error('pageId is required');

    const authHeaders = {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': GOOGLE_SHEETS_API_KEY,
    };

    // Find row index by scanning column A
    const idsRes = await fetch(
      `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A2:A10000`,
      { headers: authHeaders }
    );
    if (!idsRes.ok) throw new Error(`Sheets read error: ${idsRes.status}`);
    const idsData = await idsRes.json();
    const rows: string[][] = idsData.values || [];
    const idx = rows.findIndex((r) => r[0] === pageId);
    if (idx === -1) throw new Error('Transaction not found');

    // Sheet rows are 0-indexed in API; A2 = index 1
    const startIndex = idx + 1;
    const endIndex = startIndex + 1;

    // Get sheetId for "Sheet1"
    const metaRes = await fetch(
      `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties`,
      { headers: authHeaders }
    );
    const meta = await metaRes.json();
    const sheet = meta.sheets?.find((s: any) => s.properties?.title === 'Sheet1');
    const sheetId = sheet?.properties?.sheetId ?? 0;

    const delRes = await fetch(
      `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}:batchUpdate`,
      {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            deleteDimension: {
              range: { sheetId, dimension: 'ROWS', startIndex, endIndex },
            },
          }],
        }),
      }
    );
    if (!delRes.ok) {
      const t = await delRes.text();
      throw new Error(`Sheets delete error: ${delRes.status} ${t}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
