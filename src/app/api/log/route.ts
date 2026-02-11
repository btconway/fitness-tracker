import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { date, type, value, note } = data;

    await initDb();
    await sql(
      'INSERT INTO fitness_logs (date, type, value, note) VALUES ($1, $2, $3, $4)',
      [date, type, value, note]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const logs = await sql('SELECT * FROM fitness_logs ORDER BY date DESC, created_at DESC');
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
