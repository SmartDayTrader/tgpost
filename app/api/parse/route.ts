import { NextRequest, NextResponse } from 'next/server';
import { parseChannel } from '@/lib/parser';

export async function GET(req: NextRequest) {
  const channel = req.nextUrl.searchParams.get('channel');
  if (!channel) return NextResponse.json({ error: 'Channel required' }, { status: 400 });

  try {
    const data = await parseChannel(channel);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
