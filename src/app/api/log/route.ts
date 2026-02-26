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
    const {
      date,
      type,
      value,
      note,
      rounds,
      pullup_sets,
      pushup_sets,
      swing_sets,
      row_sets,
      bell_size,
      secondary_bell_size,
      secondary_rounds,
    } = data;

    const hasSecondaryBell =
      secondary_bell_size !== undefined &&
      secondary_bell_size !== null &&
      secondary_bell_size !== '';
    const hasSecondaryRounds =
      secondary_rounds !== undefined &&
      secondary_rounds !== null &&
      secondary_rounds !== '';

    if (hasSecondaryBell !== hasSecondaryRounds) {
      return NextResponse.json(
        { success: false, error: 'secondary_bell_size and secondary_rounds must be provided together' },
        { status: 400 }
      );
    }

    let normalizedSecondaryRounds: number | null = null;
    if (hasSecondaryRounds) {
      const parsed = Number(secondary_rounds);
      if (!Number.isInteger(parsed) || parsed < 1) {
        return NextResponse.json(
          { success: false, error: 'secondary_rounds must be a positive integer' },
          { status: 400 }
        );
      }
      normalizedSecondaryRounds = parsed;
    }

    await initDb();
    await sql`INSERT INTO fitness_logs (date, type, value, rounds, pullup_sets, pushup_sets, swing_sets, row_sets, bell_size, secondary_bell_size, secondary_rounds, note) VALUES (${date}, ${type}, ${value}, ${rounds || null}, ${pullup_sets || null}, ${pushup_sets || null}, ${swing_sets || null}, ${row_sets || null}, ${bell_size || null}, ${hasSecondaryBell ? secondary_bell_size : null}, ${normalizedSecondaryRounds}, ${note})`;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');

    if (month) {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      const logs = await sql`
        SELECT * FROM fitness_logs
        WHERE date >= ${startDate} AND date <= ${endDate}
        ORDER BY date DESC, created_at DESC
      `;
      return NextResponse.json(logs);
    }

    const logs = await sql`SELECT * FROM fitness_logs ORDER BY date DESC, created_at DESC`;
    return NextResponse.json(logs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
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
    const { id, rounds, note, bell_size, secondary_bell_size, secondary_rounds } = data;
    const hasField = (field: string) => Object.prototype.hasOwnProperty.call(data, field);

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id parameter' }, { status: 400 });
    }

    const hasSecondaryBellField = hasField('secondary_bell_size');
    const hasSecondaryRoundsField = hasField('secondary_rounds');
    if (hasSecondaryBellField !== hasSecondaryRoundsField) {
      return NextResponse.json(
        { success: false, error: 'secondary_bell_size and secondary_rounds must be patched together' },
        { status: 400 }
      );
    }

    let normalizedSecondaryRounds: number | null = null;
    if (hasSecondaryRoundsField) {
      if (secondary_rounds !== null && secondary_rounds !== '') {
        const parsed = Number(secondary_rounds);
        if (!Number.isInteger(parsed) || parsed < 1) {
          return NextResponse.json(
            { success: false, error: 'secondary_rounds must be a positive integer' },
            { status: 400 }
          );
        }
        normalizedSecondaryRounds = parsed;
      }
    }

    await sql`
      UPDATE fitness_logs
      SET
        rounds = CASE WHEN ${hasField('rounds')} THEN ${rounds || null} ELSE rounds END,
        note = CASE WHEN ${hasField('note')} THEN ${note || null} ELSE note END,
        bell_size = CASE WHEN ${hasField('bell_size')} THEN ${bell_size || null} ELSE bell_size END,
        secondary_bell_size = CASE
          WHEN ${hasSecondaryBellField} THEN ${secondary_bell_size || null}
          ELSE secondary_bell_size
        END,
        secondary_rounds = CASE
          WHEN ${hasSecondaryRoundsField} THEN ${normalizedSecondaryRounds}
          ELSE secondary_rounds
        END
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
