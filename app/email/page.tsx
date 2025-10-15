'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';
import { EmailCampaign, EmailLog, EmailTemplate } from '@/types';
import {
  PlusIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function EmailPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    templateId: '',
    attachmentId: '',
    rateLimit: 50,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // TODO: 실제 데이터 로딩 구현
      setTemplates([
        {
          id: '1',
          name: '제휴 제안 템플릿',
          subject: '[제휴 제안] {name}님, 해외 여행 유심 서비스 제안드립니다',
          body: '안녕하세요 {name}님,\n\n블로그 "{blogName}"을 통해 귀하를 알게 되었습니다.\n\n해외 여행 유심 서비스 제휴를 제안드립니다.\n\n자세한 내용은 첨부 파일을 참고해 주세요.\n\n설문 참여: {surveyUrl}\n\n감사합니다.',
          type: 'proposal',
          variables: ['name', 'blogName', 'surveyUrl'],
          isActive: true,
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
        },
      ]);

      setCampaigns([
        {
          id: '1',
          type: 'proposal',
          templateId: '1',
          attachmentId: 'proposal.pdf',
          recipients: ['example1@naver.com', 'example2@naver.com'],
          status: 'sent',
          rateLimit: 50,
          createdBy: 'admin@example.com',
          createdAt: { toDate: () => new Date() } as any,
          updatedAt: { toDate: () => new Date() } as any,
        },
      ]);

      setEmailLogs([
        {
          id: '1',
          recipientEmail: 'example1@naver.com',
          campaignId: '1',
          providerMsgId: 'msg_123',
          status: 'sent',
          ts: { toDate: () => new Date() } as any,
        },
        {
          id: '2',
          recipientEmail: 'example2@naver.com',
          campaignId: '1',
          providerMsgId: 'msg_124',
          status: 'open',
          ts: { toDate: () => new Date() } as any,
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: 실제 API 호출
      const campaign: EmailCampaign = {
        id: Date.now().toString(),
        type: 'proposal',
        templateId: newCampaign.templateId,
        attachmentId: newCampaign.attachmentId || undefined,
        recipients: selectedRecipients,
        status: 'draft',
        rateLimit: newCampaign.rateLimit,
        createdBy: 'admin@example.com',
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      setCampaigns([...campaigns, campaign]);
      setNewCampaign({ name: '', templateId: '', attachmentId: '', rateLimit: 50 });
      setSelectedRecipients([]);
      setShowCampaignForm(false);
      toast.success('캠페인이 생성되었습니다.');
    } catch (error) {
      toast.error('캠페인 생성 실패');
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      // TODO: 실제 발송 API 호출
      setCampaigns(campaigns.map(campaign => 
        campaign.id === campaignId ? { ...campaign, status: 'sending' } : campaign
      ));
      toast.success('이메일 발송이 시작되었습니다.');
    } catch (error) {
      toast.error('발송 실패');
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      // TODO: 실제 일시정지 API 호출
      setCampaigns(campaigns.map(campaign => 
        campaign.id === campaignId ? { ...campaign, status: 'draft' } : campaign
      ));
      toast.success('캠페인이 일시정지되었습니다.');
    } catch (error) {
      toast.error('일시정지 실패');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'status-success';
      case 'sending': return 'status-warning';
      case 'draft': return 'status-info';
      case 'failed': return 'status-error';
      default: return 'status-info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return '발송완료';
      case 'sending': return '발송중';
      case 'draft': return '초안';
      case 'failed': return '실패';
      default: return status;
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout title="이메일 발송">
          <div className="animate-pulse space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout title="이메일 발송" subtitle="제휴 제안 메일 발송 및 관리">
        <div className="space-y-6">
          {/* 캠페인 관리 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  이메일 캠페인
                </h3>
                <button
                  onClick={() => setShowCampaignForm(true)}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  새 캠페인
                </button>
              </div>

              {showCampaignForm && (
                <form onSubmit={handleCreateCampaign} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        캠페인 이름
                      </label>
                      <input
                        type="text"
                        value={newCampaign.name}
                        onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                        className="input-field"
                        placeholder="예: 일본 유심 제휴 제안"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        템플릿
                      </label>
                      <select
                        value={newCampaign.templateId}
                        onChange={(e) => setNewCampaign({ ...newCampaign, templateId: e.target.value })}
                        className="input-field"
                        required
                      >
                        <option value="">템플릿 선택</option>
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        첨부파일
                      </label>
                      <input
                        type="text"
                        value={newCampaign.attachmentId}
                        onChange={(e) => setNewCampaign({ ...newCampaign, attachmentId: e.target.value })}
                        className="input-field"
                        placeholder="예: proposal.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        분당 발송 제한
                      </label>
                      <input
                        type="number"
                        value={newCampaign.rateLimit}
                        onChange={(e) => setNewCampaign({ ...newCampaign, rateLimit: parseInt(e.target.value) })}
                        className="input-field"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      수신자 이메일 (쉼표로 구분)
                    </label>
                    <textarea
                      value={selectedRecipients.join(', ')}
                      onChange={(e) => setSelectedRecipients(e.target.value.split(',').map(email => email.trim()).filter(email => email))}
                      className="input-field"
                      rows={3}
                      placeholder="example1@naver.com, example2@naver.com"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowCampaignForm(false)}
                      className="btn-secondary"
                    >
                      취소
                    </button>
                    <button type="submit" className="btn-primary">
                      생성
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-hidden">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">이름</th>
                      <th className="table-header-cell">타입</th>
                      <th className="table-header-cell">수신자 수</th>
                      <th className="table-header-cell">상태</th>
                      <th className="table-header-cell">생성일</th>
                      <th className="table-header-cell">작업</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id}>
                        <td className="table-cell font-medium">{campaign.id}</td>
                        <td className="table-cell">
                          <span className="status-badge status-info">
                            {campaign.type === 'proposal' ? '제휴 제안' : '링크 안내'}
                          </span>
                        </td>
                        <td className="table-cell">{campaign.recipients.length}</td>
                        <td className="table-cell">
                          <span className={`status-badge ${getStatusColor(campaign.status)}`}>
                            {getStatusText(campaign.status)}
                          </span>
                        </td>
                        <td className="table-cell">
                          {campaign.createdAt?.toDate ? campaign.createdAt.toDate().toLocaleDateString() : new Date(campaign.createdAt).toLocaleDateString()}
                        </td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            {campaign.status === 'draft' && (
                              <button
                                onClick={() => handleSendCampaign(campaign.id)}
                                className="text-green-600 hover:text-green-900"
                                title="발송"
                              >
                                <PlayIcon className="h-4 w-4" />
                              </button>
                            )}
                            {campaign.status === 'sending' && (
                              <button
                                onClick={() => handlePauseCampaign(campaign.id)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="일시정지"
                              >
                                <PauseIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              title="상세 보기"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 발송 이력 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                발송 이력
              </h3>
              <div className="overflow-hidden">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">수신자</th>
                      <th className="table-header-cell">캠페인</th>
                      <th className="table-header-cell">상태</th>
                      <th className="table-header-cell">발송일</th>
                      <th className="table-header-cell">작업</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {emailLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="table-cell">{log.recipientEmail}</td>
                        <td className="table-cell">{log.campaignId}</td>
                        <td className="table-cell">
                          <span className={`status-badge ${getStatusColor(log.status)}`}>
                            {getStatusText(log.status)}
                          </span>
                        </td>
                        <td className="table-cell">
                          {log.ts?.toDate ? log.ts.toDate().toLocaleDateString() : new Date(log.ts).toLocaleDateString()}
                        </td>
                        <td className="table-cell">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="상세 보기"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  );
}

