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

    // Vercel Serverless Functions에서는 Puppeteer가 작동하지 않음
    // 임시로 기능 비활성화
    return NextResponse.json({ 
      error: '크롤링 기능은 현재 비활성화되어 있습니다. 인플루언서 관리 섹션에서 수동으로 추가해주세요.',
      message: 'Crawling feature is currently disabled on Vercel. Please use manual influencer addition.',
    }, { status: 503 });

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

