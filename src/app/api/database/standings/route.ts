import { NextResponse } from 'next/server';
import { mockStandings } from '@/mock/standings';

export async function GET() {
  console.log('[API Route] GET /api/database/standings - Source: Mock Database Standings');
  return NextResponse.json(mockStandings);
}
