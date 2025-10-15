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

    await SchedulerService.sendWeeklyReminder();

    return NextResponse.json({ 
      success: true, 
      message: 'Weekly reminder sent successfully' 
    });

  } catch (error) {
    console.error('Weekly reminder API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}





