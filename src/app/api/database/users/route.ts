import { NextResponse } from 'next/server';
import { mockParticipants } from '@/mock/participants';

export async function GET() {
  console.log('[API Route] GET /api/database/users - Source: Mock Database Users');
  return NextResponse.json(mockParticipants);
}
