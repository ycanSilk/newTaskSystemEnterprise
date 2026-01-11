import { NextRequest, NextResponse } from 'next/server';
import { handleMissionHall } from '../../../../api/handlers/task/missionHallHandler';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  return handleMissionHall(request as NextRequest);
}
