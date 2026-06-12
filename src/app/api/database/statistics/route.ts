import { NextResponse } from 'next/server';
import { mockStatistics } from '@/mock/statistics';

export async function GET() {
  console.log('[API Route] GET /api/database/statistics - Source: Mock Database Statistics');
  return NextResponse.json(mockStatistics);
}
