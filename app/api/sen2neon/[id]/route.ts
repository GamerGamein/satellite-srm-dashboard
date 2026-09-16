import { NextRequest, NextResponse } from 'next/server';
import { getTileById } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolved = params instanceof Promise ? await params : (params as any);
    const rawId = resolved?.id || '';
    const id = decodeURIComponent(rawId);
    const tile = getTileById(id);

    if (!tile) {
      return NextResponse.json({ error: `Tile with ID '${id}' not found` }, { status: 404 });
    }

    return NextResponse.json({
      dataset: 'isp-uv-es/SEN2NEON',
      tile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch tile details', details: error?.message },
      { status: 500 }
    );
  }
}
