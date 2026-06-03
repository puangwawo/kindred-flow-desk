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
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    if (!GOOGLE_SHEETS_API_KEY) throw new Error('GOOGLE_SHEETS_API_KEY is not configured');
    if (!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    if (!TELEGRAM_CHAT_ID) throw new Error('TELEGRAM_CHAT_ID is not configured');

    const { date, time, title, notes } = await req.json();
    const id = crypto.randomUUID();
    const row = [id, date || '', time || '', title || '', notes || '', 'pending'];

    // Append to Reminders sheet
    const sheetRes = await fetch(
      `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/Reminders!A:F:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': GOOGLE_SHEETS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [row] }),
      }
    );

    if (!sheetRes.ok) {
      const err = await sheetRes.text();
      console.error('Sheets error:', sheetRes.status, err);
      throw new Error(`Google Sheets error: ${sheetRes.status}`);
    }

    // Send Telegram notification
    const message =
      `🔔 <b>Reminder Baru</b>\n\n` +
      `<b>${title}</b>\n` +
      `📅 ${date} ⏰ ${time}\n` +
      (notes ? `\n📝 ${notes}` : '');

    const tgRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!tgRes.ok) {
      const err = await tgRes.text();
      console.error('Telegram error:', tgRes.status, err);
    }

    return new Response(JSON.stringify({ success: true, id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in notion-reminders:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
