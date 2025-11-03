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

    const DATABASE_ID = '08efbd0774044342981e9d04c872a7dd';

    console.log('Fetching transactions from Notion...');

    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        sorts: [
          {
            property: 'Tanggal',
            direction: 'descending'
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Notion API error:', response.status, errorData);
      throw new Error(`Notion API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Notion data to our format
    const transactions = data.results.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        name: props['Nama Transaksi']?.title?.[0]?.text?.content || '',
        date: props['Tanggal']?.date?.start || '',
        amount: props['Jumlah']?.number || 0,
        type: props['Tipe']?.select?.name || '',
        category: props['Kategori']?.select?.name || '',
        description: props['Deskripsi']?.rich_text?.[0]?.text?.content || '',
        project: props['Proyek Terkait']?.rich_text?.[0]?.text?.content || '',
      };
    });

    console.log(`Fetched ${transactions.length} transactions`);

    return new Response(JSON.stringify({ success: true, transactions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in notion-fetch-transactions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
