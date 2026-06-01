import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyTelegramData(data: Record<string, string>, botToken: string): boolean {
  const { hash, ...rest } = data;
  const checkString = Object.keys(rest).sort().map(k => `${k}=${rest[k]}`).join('\n');
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
  return hmac === hash;
}

async function isChannelAdmin(userId: number, channelUsername: string, botToken: string): Promise<{ isAdmin: boolean; debug: unknown }> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/getChatAdministrators?chat_id=@${channelUsername}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log('TG API response:', JSON.stringify(data).slice(0, 500));
    console.log('Looking for userId:', userId, typeof userId);
    if (!data.ok) return { isAdmin: false, debug: data };
    const adminIds = data.result.map((m: { user: { id: number } }) => m.user.id);
    console.log('Admin IDs:', adminIds);
    const found = adminIds.includes(userId);
    return { isAdmin: found, debug: { ok: true, adminIds } };
  } catch (e) {
    return { isAdmin: false, debug: String(e) };
  }
}

export async function POST(req: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });

  const { telegramData, channelUsername } = await req.json();
  if (!telegramData || !channelUsername) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

  if (!verifyTelegramData(telegramData, botToken)) return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 403 });
  if (Date.now() / 1000 - parseInt(telegramData.auth_date) > 86400) return NextResponse.json({ error: 'Auth expired' }, { status: 403 });

  const userId = parseInt(telegramData.id);
  const { isAdmin, debug } = await isChannelAdmin(userId, channelUsername.replace('@', ''), botToken);
  
  if (!isAdmin) return NextResponse.json({ error: 'You are not an admin of this channel', debug }, { status: 403 });

  return NextResponse.json({ success: true, channel: channelUsername.replace('@', '') });
}
