import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { SurveySubmission } from '@/types';
import * as admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

// GET: 모든 설문 제출 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = adminDb.collection('surveySubmissions').orderBy('createdAt', 'desc');

    if (status && status !== 'all') {
      query = query.where('status', '==', status) as any;
    }

    const submissionsSnapshot = await query.limit(100).get();

    const submissions: SurveySubmission[] = [];
    submissionsSnapshot.forEach((doc) => {
      const data = doc.data();
      submissions.push({ 
        id: doc.id, 
        ...data,
        desiredStartDate: data.desiredStartDate?.toDate?.() || data.desiredStartDate,
        expectedPostDate: data.expectedPostDate?.toDate?.() || data.expectedPostDate,
      } as SurveySubmission);
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Failed to fetch survey submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: 새 설문 제출
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      influencerEmail, 
      naverId, 
      name, 
      country, 
      days, 
      desiredStartDate, 
      expectedPostDate, 
      adDisclosureAgree 
    } = body;

    if (!influencerEmail || !naverId || !name || !country || !days || !desiredStartDate || !expectedPostDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!adDisclosureAgree) {
      return NextResponse.json(
        { error: 'Ad disclosure agreement is required' },
        { status: 400 }
      );
    }

    const now = admin.firestore.Timestamp.now();
    const newSubmission = {
      influencerEmail,
      naverId,
      name,
      country,
      days,
      desiredStartDate: admin.firestore.Timestamp.fromDate(new Date(desiredStartDate)),
      expectedPostDate: admin.firestore.Timestamp.fromDate(new Date(expectedPostDate)),
      adDisclosureAgree,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection('surveySubmissions').add(newSubmission);

    return NextResponse.json(
      { 
        success: true, 
        id: docRef.id,
        submission: { id: docRef.id, ...newSubmission }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create survey submission:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: (error as any)?.message 
    }, { status: 500 });
  }
}
