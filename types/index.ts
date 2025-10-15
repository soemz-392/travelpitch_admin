import { Timestamp } from 'firebase/firestore';

// User roles
export type UserRole = 'admin' | 'staff';

// User interface
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Influencer interface
export interface Influencer {
  id: string;
  name?: string;
  email: string;
  blogUrl: string;
  platform: 'naver';
  country: string;
  tags: string[];
  lastContactedAt?: Timestamp;
  suppression: {
    unsub: boolean;
    bounce: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Crawl Result interface
export interface CrawlResult {
  id: string;
  keywordSetId: string;
  url: string;
  title: string;
  emails: string[];
  capturedAt: Timestamp;
  dedupKey: string;
}

// Keyword Set interface
export interface KeywordSet {
  id: string;
  name: string;
  country: string;
  keywords: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Email Campaign interface
export interface EmailCampaign {
  id: string;
  type: 'proposal' | 'link';
  templateId: string;
  attachmentId?: string;
  recipients: string[];
  status: 'draft' | 'sending' | 'sent' | 'failed';
  rateLimit: number;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Email Log interface
export interface EmailLog {
  id: string;
  recipientEmail: string;
  campaignId: string;
  providerMsgId?: string;
  status: 'queued' | 'sent' | 'open' | 'click' | 'bounce' | 'unsub';
  meta?: Record<string, any>;
  ts: Timestamp;
}

// Survey Submission interface
export interface SurveySubmission {
  id: string;
  influencerEmail: string;
  naverId: string;
  name: string;
  country: string;
  days: number;
  desiredStartDate: Date;
  expectedPostDate: Date;
  adDisclosureAgree: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // 추가 필드
  phone?: string;
  phoneModel?: string;
  snsLink?: string;
  simType?: string;
  address?: string;
  detailAddress?: string;
  postalCode?: string;
  departureDate?: string;
  arrivalDate?: string;
  f4Code?: string;
  adminMemo?: string;
  trackingLink?: string;
}

// Product Mapping interface
export interface ProductMapping {
  id: string;
  country: string;
  simType: 'sim' | 'esim';
  planName: string;
  days: number;
  sellerProductCode: string;
}

// Dispatch Batch interface
export interface DispatchBatch {
  id: string;
  submissionIds: string[];
  fileUrl?: string;
  status: 'ready' | 'downloaded' | 'done';
  processedAt?: Timestamp;
  createdAt: Timestamp;
}

// Settings interface
export interface Settings {
  id: string;
  proposalPdfId?: string;
  surveyBaseUrl: string;
  linkBaseUrl: string;
  countryCodes: Record<string, string>;
  emailRateLimit: {
    perMinute: number;
    perHour: number;
  };
  updatedAt: Timestamp;
}

// Dashboard Stats interface
export interface DashboardStats {
  newCrawlResults: number;
  newSurveySubmissions: number;
  pendingDispatches: number;
  recentCampaigns: EmailCampaign[];
  recentLinkSends: EmailLog[];
}

// Email Template interface
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'proposal' | 'link';
  variables: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Audit Log interface
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, any>;
  timestamp: Timestamp;
}

