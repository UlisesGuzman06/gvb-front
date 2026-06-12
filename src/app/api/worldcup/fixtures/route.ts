import { NextRequest, NextResponse } from 'next/server';
import { getFixtures } from '@/lib/worldCupFetch';

export async function GET(request: NextRequest) {
  try {
    let fixtures = getFixtures();
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const group = searchParams.get('group');
    const teamId = searchParams.get('team_id');
    
    if (date) {
      fixtures = fixtures.filter(f => f.date === date);
    }
    if (group) {
      const groupTerm = group.length === 1 ? `Group ${group.toUpperCase()}` : group;
      fixtures = fixtures.filter(f => 
        (f.group && f.group.toLowerCase().includes(groupTerm.toLowerCase())) ||
        (f.round && f.round.toLowerCase().includes(groupTerm.toLowerCase()))
      );
    }
    if (teamId) {
      const idNum = parseInt(teamId, 10);
      fixtures = fixtures.filter(f => f.home.id === idNum || f.away.id === idNum);
    }
    
    return NextResponse.json(fixtures);
  } catch (error: any) {
    console.error('[fixtures route] ERROR:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
