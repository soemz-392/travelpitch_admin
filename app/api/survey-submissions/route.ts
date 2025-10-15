import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { TrackingLinkService } from '@/lib/marketing-links';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // ID 제거 (Firestore가 자동 생성)
    const { id, ...submissionData } = data;
    
    // 트래킹 링크 생성
    let trackingLink = null;
    try {
      trackingLink = TrackingLinkService.generateTrackingLink(
        submissionData.naverId,
        submissionData.country,
        submissionData.simType || 'esim',
        1 // 첫 번째 발송
      );
    } catch (error) {
      console.error('Failed to generate tracking link:', error);
      // 트래킹 링크 생성 실패해도 설문 제출은 계속 진행
    }
    
    const submissionWithTracking = {
      ...submissionData,
      trackingLink,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };
    
    const docRef = await adminDb.collection('surveySubmissions').add(submissionWithTracking);
    
    return NextResponse.json({ 
      id: docRef.id, 
      ...submissionWithTracking,
      trackingLink // 응답에 트래킹 링크 포함
    });
  } catch (error) {
    console.error('Failed to create survey submission:', error);
    return NextResponse.json({ error: 'Failed to create survey submission' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const submissionsSnapshot = await adminDb.collection('surveySubmissions').orderBy('createdAt', 'desc').get();
    const submissions: any[] = [];
    
    submissionsSnapshot.forEach(doc => {
      submissions.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Failed to fetch survey submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch survey submissions' }, { status: 500 });
  }
}

