import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { EmailCampaign } from '@/types';
import * as admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

// GET: 모든 이메일 캠페인 조회
export async function GET(request: NextRequest) {
  try {
    const campaignsSnapshot = await adminDb
      .collection('emailCampaigns')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const campaigns: EmailCampaign[] = [];
    campaignsSnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() } as EmailCampaign);
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Failed to fetch email campaigns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: 새 이메일 캠페인 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, templateId, recipients, rateLimit, createdBy } = body;

    if (!name || !type || !templateId || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Name, type, templateId, and recipients are required' },
        { status: 400 }
      );
    }

    const now = admin.firestore.Timestamp.now();
    const newCampaign = {
      name,
      type,
      templateId,
      recipients,
      status: 'draft',
      rateLimit: rateLimit || 50,
      createdBy: createdBy || 'admin@example.com',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection('emailCampaigns').add(newCampaign);

    return NextResponse.json(
      { 
        success: true, 
        id: docRef.id,
        campaign: { id: docRef.id, ...newCampaign }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create email campaign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

