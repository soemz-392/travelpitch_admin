import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { EmailTemplate } from '@/types';
import * as admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

// GET: 모든 이메일 템플릿 조회
export async function GET(request: NextRequest) {
  try {
    const templatesSnapshot = await adminDb
      .collection('emailTemplates')
      .where('isActive', '==', true)
      .get();

    const templates: EmailTemplate[] = [];
    templatesSnapshot.forEach((doc) => {
      templates.push({ id: doc.id, ...doc.data() } as EmailTemplate);
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to fetch email templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: 새 이메일 템플릿 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, subject, body: templateBody, type, variables } = body;

    if (!name || !subject || !templateBody || !type) {
      return NextResponse.json(
        { error: 'Name, subject, body, and type are required' },
        { status: 400 }
      );
    }

    const now = admin.firestore.Timestamp.now();
    const newTemplate = {
      name,
      subject,
      body: templateBody,
      type,
      variables: variables || [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection('emailTemplates').add(newTemplate);

    return NextResponse.json(
      { 
        success: true, 
        id: docRef.id,
        template: { id: docRef.id, ...newTemplate }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create email template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

