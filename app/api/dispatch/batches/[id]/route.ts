import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

// PATCH: 배치 상태 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      updatedAt: admin.firestore.Timestamp.now(),
    };

    if (status === 'done') {
      updateData.processedAt = admin.firestore.Timestamp.now();
    }

    await adminDb.collection('dispatchBatches').doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update batch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

