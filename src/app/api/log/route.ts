import { NextRequest, NextResponse } from 'next/server';
import { sql, initDb, isDatabaseConfigured } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const data = await req.json();
    const { date, type, value, note, rounds, pullup_sets, pushup_sets } = data;

    await initDb();
    await sql`INSERT INTO fitness_logs (date, type, value, rounds, pullup_sets, pushup_sets, note) VALUES (${date}, ${type}, ${value}, ${rounds || null}, ${pullup_sets || null}, ${pushup_sets || null}, ${note})`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const logs = await sql`SELECT * FROM fitness_logs ORDER BY date DESC, created_at DESC`;
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id parameter' }, { status: 400 });
    }

    await sql`DELETE FROM fitness_logs WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const data = await req.json();
    const { id, rounds, note } = data;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id parameter' }, { status: 400 });
    }

    await sql`UPDATE fitness_logs SET rounds = ${rounds || null}, note = ${note || null} WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
