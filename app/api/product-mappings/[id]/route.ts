import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// DELETE: 상품 매핑 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await adminDb.collection('productMappings').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product mapping:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

