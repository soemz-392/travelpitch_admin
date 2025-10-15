import nodemailer from 'nodemailer';
import { EmailTemplate, EmailLog } from '@/types';

export class EmailService {
  private transporter: nodemailer.Transporter;
  private rateLimit: number;
  private lastSent: number = 0;

  constructor() {
    // 이메일 서비스 설정 (SendGrid 또는 SES)
     this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_PROVIDER === 'sendgrid' ? 'SendGrid' : 'SES',
      auth: {
        user: process.env.EMAIL_PROVIDER === 'sendgrid' 
          ? 'apikey' 
          : process.env.SES_ACCESS_KEY_ID,
        pass: process.env.EMAIL_PROVIDER === 'sendgrid'
          ? process.env.SENDGRID_API_KEY
          : process.env.SES_SECRET_ACCESS_KEY,
      },
    });

    this.rateLimit = parseInt(process.env.EMAIL_RATE_LIMIT_PER_MINUTE || '50');
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    attachments?: Array<{ filename: string; path: string }>
  ): Promise<string> {
    // 레이트 리미팅
    await this.enforceRateLimit();

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@example.com',
      to,
      subject,
      html,
      attachments,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      return result.messageId;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendBatchEmails(
    recipients: string[],
    template: EmailTemplate,
    variables: Record<string, string>[],
    attachments?: Array<{ filename: string; path: string }>
  ): Promise<EmailLog[]> {
    const logs: EmailLog[] = [];
    const batchSize = Math.min(this.rateLimit, recipients.length);

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchPromises = batch.map(async (recipient, index) => {
        const recipientIndex = i + index;
        const recipientVariables = variables[recipientIndex] || {};

        try {
          const subject = this.replaceVariables(template.subject, recipientVariables);
          const html = this.replaceVariables(template.body, recipientVariables);

          const messageId = await this.sendEmail(recipient, subject, html, attachments);

          return {
            id: Date.now().toString() + recipientIndex,
            recipientEmail: recipient,
            campaignId: '', // 호출 시 설정
            providerMsgId: messageId,
            status: 'sent' as const,
            ts: new Date() as any,
          };
        } catch (error) {
          console.error(`Failed to send email to ${recipient}:`, error);
          return {
            id: Date.now().toString() + recipientIndex,
            recipientEmail: recipient,
            campaignId: '', // 호출 시 설정
            status: 'bounce' as const,
            ts: new Date() as any,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      logs.push(...batchResults);

      // 배치 간 대기
      if (i + batchSize < recipients.length) {
        await this.delay(60000); // 1분 대기
      }
    }

    return logs;
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastSent = now - this.lastSent;
    const minInterval = 60000 / this.rateLimit; // 분당 제한을 밀리초로 변환

    if (timeSinceLastSent < minInterval) {
      await this.delay(minInterval - timeSinceLastSent);
    }

    this.lastSent = Date.now();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private replaceVariables(text: string, variables: Record<string, string>): string {
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }

  // 이메일 템플릿 생성
  static createProposalTemplate(
    name: string,
    blogName: string,
    surveyUrl: string,
    companyInfo: string
  ): { subject: string; html: string } {
    const subject = `[제휴 제안] ${name}님, 해외 여행 유심 서비스 제안드립니다`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>제휴 제안</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">안녕하세요 ${name}님,</h2>
          
          <p>블로그 "<strong>${blogName}</strong>"을 통해 귀하를 알게 되었습니다.</p>
          
          <p>귀하의 훌륭한 콘텐츠를 보고, 해외 여행 유심 서비스 제휴를 제안드립니다.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2563eb; margin-top: 0;">제휴 혜택</h3>
            <ul>
              <li>무료 해외 여행 유심 제공</li>
              <li>제휴 수수료 지급</li>
              <li>마케팅 지원</li>
            </ul>
          </div>
          
          <p>자세한 내용은 첨부 파일을 참고해 주세요.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${surveyUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              설문 참여하기
            </a>
          </div>
          
          <p>문의사항이 있으시면 언제든지 연락주세요.</p>
          
          <p>감사합니다.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <div style="font-size: 12px; color: #6b7280;">
            <p><strong>${companyInfo}</strong></p>
            <p>본 메일은 제안 안내 메일이며, 수신거부를 원하시면 
               <a href="${process.env.UNSUBSCRIBE_URL}">여기를 클릭</a>하십시오.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  // 링크 안내 메일 템플릿
  static createLinkTemplate(
    name: string,
    trackingLink: string,
    companyInfo: string
  ): { subject: string; html: string } {
    const subject = `[링크 안내] ${name}님, 마케팅 링크를 안내드립니다`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>링크 안내</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">안녕하세요 ${name}님,</h2>
          
          <p>상품 발송이 완료되었습니다. 아래 링크를 통해 마케팅 활동을 진행해 주세요.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${trackingLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              마케팅 링크
            </a>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2563eb; margin-top: 0;">활동 가이드</h3>
            <ul>
              <li>위 링크를 통해 상품을 소개해 주세요</li>
              <li>사용 후기를 블로그에 포스팅해 주세요</li>
              <li>광고성 표기 문구를 포함해 주세요</li>
            </ul>
          </div>
          
          <p>문의사항이 있으시면 언제든지 연락주세요.</p>
          
          <p>감사합니다.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <div style="font-size: 12px; color: #6b7280;">
            <p><strong>${companyInfo}</strong></p>
            <p>본 메일은 링크 안내 메일이며, 수신거부를 원하시면 
               <a href="${process.env.UNSUBSCRIBE_URL}">여기를 클릭</a>하십시오.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }
}





