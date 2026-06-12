import { NextRequest, NextResponse } from 'next/server';
import { getStandings } from '@/lib/worldCupFetch';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group') || 'A';
    
    const standings = getStandings(group);
    return NextResponse.json(standings);
  } catch (error: any) {
    console.error('[standings route] ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
