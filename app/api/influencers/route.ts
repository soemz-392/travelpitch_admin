import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Influencer } from '@/types';
import * as admin from 'firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const influencersSnapshot = await adminDb
      .collection('influencers')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    const influencers: any[] = [];
    
    influencersSnapshot.forEach((doc: any) => {
      influencers.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json(influencers);
  } catch (error) {
    console.error('Failed to fetch influencers:', error);
    return NextResponse.json({ error: 'Failed to fetch influencers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, blogUrl, country, tags } = body;

    // 필수 필드 검증
    if (!email || !blogUrl) {
      return NextResponse.json(
        { error: 'Email and blog URL are required' },
        { status: 400 }
      );
    }

    // 이메일 중복 체크
    const existingInfluencer = await adminDb
      .collection('influencers')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingInfluencer.empty) {
      return NextResponse.json(
        { error: 'Influencer with this email already exists' },
        { status: 409 }
      );
    }

    // 새 인플루언서 생성
    const now = admin.firestore.Timestamp.now();
    const newInfluencer = {
      name: name || '',
      email,
      blogUrl,
      platform: 'naver',
      country: country || '',
      tags: tags || [],
      suppression: {
        unsub: false,
        bounce: false,
      },
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection('influencers').add(newInfluencer);
    
    return NextResponse.json(
      { 
        success: true, 
        id: docRef.id,
        influencer: { id: docRef.id, ...newInfluencer }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create influencer:', error);
    return NextResponse.json({ error: 'Failed to create influencer' }, { status: 500 });
  }
}

