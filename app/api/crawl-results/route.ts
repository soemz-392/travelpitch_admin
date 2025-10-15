import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const crawlResultsSnapshot = await adminDb.collection('crawlResults').orderBy('capturedAt', 'desc').limit(50).get();
    const crawlResults: any[] = [];
    
    crawlResultsSnapshot.forEach((doc: any) => {
      crawlResults.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json(crawlResults);
  } catch (error) {
    console.error('Failed to fetch crawl results:', error);
    return NextResponse.json({ error: 'Failed to fetch crawl results' }, { status: 500 });
  }
}




