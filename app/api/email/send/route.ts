import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email';
import { adminDb } from '@/lib/firebase-admin';
import { EmailCampaign, EmailTemplate } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { campaignId, recipients, templateId, variables } = await request.json();

    if (!campaignId || !recipients || !templateId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 템플릿 조회
    const templateDoc = await adminDb.collection('emailTemplates').doc(templateId).get();
    if (!templateDoc.exists) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const template = { id: templateDoc.id, ...templateDoc.data() } as EmailTemplate;

    // 캠페인 상태 업데이트
    await adminDb.collection('emailCampaigns').doc(campaignId).update({
      status: 'sending',
      updatedAt: new Date(),
    });

    // 이메일 발송
    const emailService = new EmailService();
    const logs = await emailService.sendBatchEmails(
      recipients,
      template,
      variables || [],
      [] // 첨부파일은 추후 구현
    );

    // 발송 로그 저장
    const batch = adminDb.batch();
    logs.forEach(log => {
      const docRef = adminDb.collection('emailLogs').doc();
      batch.set(docRef, {
        ...log,
        campaignId,
        ts: new Date(),
      });
    });
    await batch.commit();

    // 캠페인 상태 업데이트
    const successCount = logs.filter(log => log.status === 'sent').length;
    const failedCount = logs.filter(log => log.status === 'bounce').length;

    await adminDb.collection('emailCampaigns').doc(campaignId).update({
      status: successCount > 0 ? 'sent' : 'failed',
      updatedAt: new Date(),
    });

    return NextResponse.json({ 
      success: true, 
      sent: successCount,
      failed: failedCount,
      logs: logs.map(log => ({
        id: log.id,
        recipientEmail: log.recipientEmail,
        status: log.status,
      }))
    });

  } catch (error) {
    console.error('Email sending API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





