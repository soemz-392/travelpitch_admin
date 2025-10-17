import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { DispatchBatch } from '@/types';

export const dynamic = 'force-dynamic';

// GET: 모든 발송 배치 조회
export async function GET(request: NextRequest) {
  try {
    const batchesSnapshot = await adminDb
      .collection('dispatchBatches')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const batches: DispatchBatch[] = [];
    batchesSnapshot.forEach((doc) => {
      batches.push({ id: doc.id, ...doc.data() } as DispatchBatch);
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error('Failed to fetch dispatch batches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

