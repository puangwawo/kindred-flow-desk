import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NOTION_API_TOKEN = Deno.env.get('NOTION_API_TOKEN');
    if (!NOTION_API_TOKEN) {
      throw new Error('NOTION_API_TOKEN is not configured');
    }

    const DATABASE_ID = 'e885eabb7fb54576b76ae83abe7552cb';
    const { date, time, title, notes } = await req.json();

    console.log('Adding reminder to Notion:', { date, time, title });

    const dateTimeString = `${date}T${time}:00`;

    const response = await fetch(`https://api.notion.com/v1/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: {
          'Tanggal & Waktu': {
            date: {
              start: dateTimeString,
            },
          },
          'Judul': {
            title: [{
              text: { content: title },
            }],
          },
          'Catatan': {
            rich_text: [{
              text: { content: notes || '' },
            }],
          },
          'Status': {
            status: {
              name: 'In progress'
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Notion API error:', response.status, errorData);
      throw new Error(`Notion API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Reminder added successfully:', data.id);

    return new Response(JSON.stringify({ success: true, id: data.id }), {
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
