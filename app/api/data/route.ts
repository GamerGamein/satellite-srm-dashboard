import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const backendUrl = `${BACKEND_API_URL}/api/data?${searchParams.toString()}`;

    // Forward request to FastAPI backend
    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }, // Disable cache for live database queries
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.detail || `Backend returned status ${res.status}`,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Next.js /api/data proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to connect to Python FastAPI backend at ' + BACKEND_API_URL,
        details: error?.message,
        hint: 'Please ensure `python backend/run.py` is running on port 8000',
      },
      { status: 502 }
    );
  }
}
