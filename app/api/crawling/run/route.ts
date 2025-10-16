import { NextRequest, NextResponse } from 'next/server';
import { CrawlingService } from '@/lib/crawling';
import { adminDb } from '@/lib/firebase-admin';
import { KeywordSet, CrawlResult } from '@/types';
import * as admin from 'firebase-admin';

// Vercel Function 설정: 메모리와 실행 시간 증가
export const maxDuration = 60; // 최대 60초
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { keywordSetId } = await request.json();

    if (!keywordSetId) {
      return NextResponse.json({ error: 'Keyword set ID is required' }, { status: 400 });
    }

    console.log('Starting crawling for keyword set:', keywordSetId);

    // 키워드 세트 조회
    let keywordSet: KeywordSet;
    try {
      const keywordSetDoc = await adminDb.collection('keywordSets').doc(keywordSetId).get();
      console.log('KeywordSet document exists:', keywordSetDoc.exists);
      
      if (!keywordSetDoc.exists) {
        // 모든 키워드 세트 조회해서 디버깅
        const allSets = await adminDb.collection('keywordSets').get();
        console.log('Available keyword sets:', allSets.docs.map(d => ({ id: d.id, name: d.data().name })));
        
        return NextResponse.json({ 
          error: 'Keyword set not found',
          requestedId: keywordSetId,
          availableIds: allSets.docs.map(d => d.id)
        }, { status: 404 });
      }

      keywordSet = { id: keywordSetDoc.id, ...keywordSetDoc.data() } as KeywordSet;
      console.log('Found keyword set:', keywordSet.name, 'with', keywordSet.keywords.length, 'keywords');
    } catch (dbError) {
      console.error('Database error while fetching keyword set:', dbError);
      return NextResponse.json({ 
        error: 'Database error',
        details: (dbError as any)?.message || 'Failed to access database'
      }, { status: 500 });
    }

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

  } catch (error: any) {
    console.error('Crawling API error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}

