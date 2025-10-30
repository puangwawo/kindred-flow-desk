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
    const { name, date, amount, type, category, description, project } = await req.json();

    console.log('Adding transaction to Notion:', { name, date, amount, type, category });

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
          'Nama Transaksi': {
            title: [{
              text: { content: name || 'Transaksi' },
            }],
          },
          'Tanggal': {
            date: {
              start: date,
            },
          },
          'Jumlah': {
            number: amount,
          },
          'Tipe': {
            select: {
              name: type === 'income' ? 'Pemasukan' : 'Pengeluaran',
            },
          },
          'Kategori': {
            select: {
              name: category,
            },
          },
          'Deskripsi': {
            rich_text: [{
              text: { content: description || '' },
            }],
          },
          'Proyek Terkait': {
            rich_text: [{
              text: { content: project || '' },
            }],
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Notion API error:', response.status, errorData);
      
      if (response.status === 404) {
        throw new Error('Database Notion tidak ditemukan. Pastikan database sudah di-share dengan integration Anda.');
      } else if (response.status === 401 || response.status === 403) {
        throw new Error('API token tidak valid atau tidak memiliki akses. Cek pengaturan token Anda.');
      }
      
      throw new Error(`Notion API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Transaction added successfully:', data.id);

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in notion-transactions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
