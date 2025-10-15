import { NextRequest, NextResponse } from 'next/server';
import { SchedulerService } from '@/lib/scheduler';

export async function POST(request: NextRequest) {
  try {
    // 인증 확인 (Cloud Scheduler에서 호출)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.SCHEDULER_TOKEN;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await SchedulerService.runWeeklyCrawling();

    return NextResponse.json({ 
      success: true, 
      message: 'Weekly crawling completed successfully' 
    });

  } catch (error) {
    console.error('Weekly crawling API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}





