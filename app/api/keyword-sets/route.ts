import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const keywordSetsSnapshot = await adminDb.collection('keywordSets').get();
    const keywordSets: any[] = [];
    
    keywordSetsSnapshot.forEach((doc: any) => {
      keywordSets.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json(keywordSets);
  } catch (error) {
    console.error('Failed to fetch keyword sets:', error);
    return NextResponse.json({ error: 'Failed to fetch keyword sets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // ID 제거 (Firestore가 자동 생성)
    const { id, ...keywordSetData } = data;
    
    const docRef = await adminDb.collection('keywordSets').add(keywordSetData);
    
    return NextResponse.json({ id: docRef.id, ...keywordSetData });
  } catch (error) {
    console.error('Failed to create keyword set:', error);
    return NextResponse.json({ error: 'Failed to create keyword set' }, { status: 500 });
  }
}




