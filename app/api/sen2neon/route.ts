import { NextRequest, NextResponse } from 'next/server';
import { querySEN2NEONTiles, getSEN2NEONBenchmarks } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || undefined;
    const landCover = searchParams.get('landCover') || undefined;
    const superclass = searchParams.get('superclass') || undefined;
    const getBenchmarks = searchParams.get('benchmarks') === 'true';

    if (getBenchmarks) {
      const benchmarks = getSEN2NEONBenchmarks();
      return NextResponse.json({
        dataset: 'isp-uv-es/SEN2NEON',
        benchmarks,
      });
    }

    const result = querySEN2NEONTiles({
      page,
      limit,
      search,
      landCover,
      superclass,
    });

    return NextResponse.json({
      dataset: 'isp-uv-es/SEN2NEON',
      description: 'Paired Sentinel-2 L2A (10m) and NEON AVIRIS-NG (2.5m/1.0m) super-resolution benchmark',
      ...result,
    });
  } catch (error: any) {
    console.error('API /api/sen2neon error:', error);
    return NextResponse.json(
      { error: 'Failed to query SEN2NEON dataset', details: error?.message },
      { status: 500 }
    );
  }
}
