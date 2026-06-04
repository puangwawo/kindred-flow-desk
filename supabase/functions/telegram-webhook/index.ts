import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SPREADSHEET_ID = '10u7hcfcZX94PXRRR3GSxLOvnMoMSQY84bCNLssxY8Is';
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_sheets/v4';

async function sendTelegram(token: string, chatId: number | string, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

async function appendTransaction(
  lovableKey: string,
  sheetsKey: string,
  row: (string | number)[],
) {
  const url = `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A:H:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': sheetsKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [row] }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Sheets ${res.status}: ${t}`);
  }
}

const HELP = `<b>Perintah Pencatatan Transaksi</b>

<b>Pemasukan:</b>
<code>/in JUMLAH KATEGORI DESKRIPSI | PROYEK</code>
Contoh: <code>/in 150000 Penjualan Jual sayur | OBA1</code>

<b>Pengeluaran:</b>
<code>/out JUMLAH KATEGORI DESKRIPSI | PROYEK</code>
Contoh: <code>/out 25000 Transport Bensin | OBA2</code>

<b>Bantuan:</b> <code>/help</code>

Catatan: PROYEK opsional, default OBA1.`;

function parseCommand(text: string) {
  // /in <amount> <category> <desc...> | <project?>
  const match = text.match(/^\/(in|out)\s+(\d[\d.,]*)\s+(\S+)\s+([^|]+?)(?:\s*\|\s*(.+))?$/i);
  if (!match) return null;
  const [, cmd, amountStr, category, desc, project] = match;
  const amount = Number(amountStr.replace(/[.,]/g, ''));
  if (!Number.isFinite(amount)) return null;
  return {
    type: cmd.toLowerCase() === 'in' ? 'Pemasukan' : 'Pengeluaran',
    amount,
    category: category.trim(),
    description: desc.trim(),
    project: (project || 'OBA1').trim(),
  };
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok');

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
  const GOOGLE_SHEETS_API_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY')!;
  const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
  const ALLOWED_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

  let update: any;
  try {
    update = await req.json();
  } catch {
    return new Response('ok');
  }

  const msg = update.message ?? update.edited_message;
  const chatId = msg?.chat?.id;
  const text: string = (msg?.text ?? '').trim();
  if (!chatId || !text) return new Response('ok');

  // Restrict to authorized chat
  if (ALLOWED_CHAT_ID && String(chatId) !== String(ALLOWED_CHAT_ID)) {
    await sendTelegram(TELEGRAM_BOT_TOKEN, chatId, '⛔ Chat tidak diizinkan.');
    return new Response('ok');
  }

  try {
    if (/^\/(start|help)/i.test(text)) {
      await sendTelegram(TELEGRAM_BOT_TOKEN, chatId, HELP);
      return new Response('ok');
    }

    if (/^\/(in|out)\b/i.test(text)) {
      const parsed = parseCommand(text);
      if (!parsed) {
        await sendTelegram(
          TELEGRAM_BOT_TOKEN,
          chatId,
          '❌ Format salah.\n\n' + HELP,
        );
        return new Response('ok');
      }
      const id = crypto.randomUUID();
      const date = new Date().toISOString().slice(0, 10);
      const name = parsed.description.slice(0, 60) || parsed.category;
      const row = [
        id,
        name,
        date,
        parsed.amount,
        parsed.type,
        parsed.category,
        parsed.description,
        parsed.project,
      ];
      await appendTransaction(LOVABLE_API_KEY, GOOGLE_SHEETS_API_KEY, row);

      const emoji = parsed.type === 'Pemasukan' ? '🟢' : '🔴';
      const formatted = new Intl.NumberFormat('id-ID').format(parsed.amount);
      await sendTelegram(
        TELEGRAM_BOT_TOKEN,
        chatId,
        `${emoji} <b>${parsed.type} tercatat</b>\n` +
          `💰 Rp ${formatted}\n` +
          `📁 ${parsed.category}\n` +
          `🏷 ${parsed.project}\n` +
          `📝 ${parsed.description}\n` +
          `📅 ${date}`,
      );
      return new Response('ok');
    }

    // Unknown command starting with /
    if (text.startsWith('/')) {
      await sendTelegram(TELEGRAM_BOT_TOKEN, chatId, HELP);
    }
  } catch (err) {
    console.error('telegram-webhook error:', err);
    await sendTelegram(
      TELEGRAM_BOT_TOKEN,
      chatId,
      `❌ Gagal menyimpan: ${err instanceof Error ? err.message : 'error'}`,
    );
  }

  return new Response('ok');
});