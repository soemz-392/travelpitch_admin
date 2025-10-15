import { NextRequest, NextResponse } from 'next/server';
import { CrawlingService } from '@/lib/crawling';
import { adminDb } from '@/lib/firebase-admin';
import { KeywordSet, CrawlResult } from '@/types';
import * as admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { keywordSetId } = await request.json();

    if (!keywordSetId) {
      return NextResponse.json({ error: 'Keyword set ID is required' }, { status: 400 });
    }

    // 키워드 세트 조회
    const keywordSetDoc = await adminDb.collection('keywordSets').doc(keywordSetId).get();
    if (!keywordSetDoc.exists) {
      return NextResponse.json({ error: 'Keyword set not found' }, { status: 404 });
    }

    const keywordSet = { id: keywordSetDoc.id, ...keywordSetDoc.data() } as KeywordSet;

    // 크롤링 실행
    const crawlingService = new CrawlingService();
    await crawlingService.initialize();

    try {
      const results = await crawlingService.crawlGoogleBlogs(keywordSet);
      
      // 결과 저장
      if (results.length > 0) {
        const batch = adminDb.batch();
        results.forEach(result => {
          const docRef = adminDb.collection('crawlResults').doc();
          batch.set(docRef, {
            ...result,
            keywordSetId,
            capturedAt: admin.firestore.Timestamp.now(),
          });
        });
        
        await batch.commit();
      }
      await crawlingService.close();

      return NextResponse.json({ 
        success: true, 
        resultsCount: results.length,
        results: results.map(r => ({
          id: r.id,
          url: r.url,
          title: r.title,
          emails: r.emails,
        }))
      });

    } catch (error) {
      await crawlingService.close();
      throw error;
    }

  } catch (error) {
    console.error('Crawling API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

