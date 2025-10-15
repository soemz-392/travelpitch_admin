import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json();
    const { id } = await params;
    
    await adminDb.collection('keywordSets').doc(id).update(data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update keyword set:', error);
    return NextResponse.json({ error: 'Failed to update keyword set' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await adminDb.collection('keywordSets').doc(id).delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete keyword set:', error);
    return NextResponse.json({ error: 'Failed to delete keyword set' }, { status: 500 });
  }
}




