import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email';
import { adminDb } from '@/lib/firebase-admin';
import { SurveySubmission, Settings } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    // 설문 제출 데이터 조회
    const submissionDoc = await adminDb.collection('surveySubmissions').doc(submissionId).get();
    if (!submissionDoc.exists) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const submission = { id: submissionDoc.id, ...submissionDoc.data() } as SurveySubmission;

    // 설정 조회
    const settingsDoc = await adminDb.collection('settings').doc('main').get();
    const settings = settingsDoc.exists ? settingsDoc.data() as Settings : null;

    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    // 추적 링크 생성
    const trackingLink = `${settings.linkBaseUrl}/link/abc?nt_source=${submission.naverId}&nt_medium=${submission.country}${submission.simType || 'esim'}1`;

    // 링크 안내 메일 발송
    const emailService = new EmailService();
    const { subject, html } = EmailService.createLinkTemplate(
      submission.name,
      trackingLink,
      '회사 정보' // 실제로는 설정에서 가져와야 함
    );

    const messageId = await emailService.sendEmail(
      submission.influencerEmail,
      subject,
      html
    );

    // 발송 로그 저장
    await adminDb.collection('emailLogs').add({
      recipientEmail: submission.influencerEmail,
      campaignId: 'link_campaign',
      providerMsgId: messageId,
      status: 'sent',
      meta: {
        naverId: submission.naverId,
        country: submission.country,
        simType: submission.simType || 'esim',
        dispatchCount: 1,
        linkUrl: trackingLink,
        clickCount: 0,
      },
      ts: new Date(),
    });

    return NextResponse.json({ 
      success: true, 
      trackingLink,
      messageId,
    });

  } catch (error) {
    console.error('Link generation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





