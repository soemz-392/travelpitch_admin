'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';
import { EmailLog, DispatchBatch } from '@/types';
import {
  EyeIcon,
  LinkIcon,
  EnvelopeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function LinkTrackingPage() {
  const [linkSends, setLinkSends] = useState<EmailLog[]>([]);
  const [batches, setBatches] = useState<DispatchBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [showLinkDetail, setShowLinkDetail] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const fetchData = async () => {
    try {
      // TODO: 실제 데이터 로딩 구현
      setLinkSends([
        {
          id: '1',
          recipientEmail: 'example1@naver.com',
          campaignId: 'link_campaign_1',
          providerMsgId: 'msg_link_123',
          status: 'click',
          meta: {
            naverId: 'jdh11830',
            country: 'JP',
            simType: 'esim',
            dispatchCount: 1,
            linkUrl: 'https://example.com/link/abc?nt_source=jdh11830&nt_medium=jpesim1',
            clickCount: 3,
            lastClickAt: new Date('2024-01-15T10:30:00'),
          },
          ts: { toDate: () => new Date('2024-01-15T09:00:00') } as any,
        },
        {
          id: '2',
          recipientEmail: 'example2@naver.com',
          campaignId: 'link_campaign_1',
          providerMsgId: 'msg_link_124',
          status: 'open',
          meta: {
            naverId: 'traveler_kr',
            country: 'TW',
            simType: 'esim',
            dispatchCount: 1,
            linkUrl: 'https://example.com/link/def?nt_source=traveler_kr&nt_medium=twesim1',
            clickCount: 0,
          },
          ts: { toDate: () => new Date('2024-01-15T09:15:00') } as any,
        },
        {
          id: '3',
          recipientEmail: 'example3@naver.com',
          campaignId: 'link_campaign_1',
          providerMsgId: 'msg_link_125',
          status: 'sent',
          meta: {
            naverId: 'backpacker_jp',
            country: 'JP',
            simType: 'esim',
            dispatchCount: 1,
            linkUrl: 'https://example.com/link/ghi?nt_source=backpacker_jp&nt_medium=jpesim1',
            clickCount: 0,
          },
          ts: { toDate: () => new Date('2024-01-15T09:30:00') } as any,
        },
      ]);

      setBatches([
        {
          id: '1',
          submissionIds: ['1', '2', '3'],
          status: 'done',
          processedAt: { toDate: () => new Date('2024-01-15T08:00:00') } as any,
          createdAt: { toDate: () => new Date('2024-01-15T08:00:00') } as any,
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async (logId: string) => {
    try {
      // TODO: 실제 재발송 API 호출
      toast.success('링크가 재발송되었습니다.');
    } catch (error) {
      toast.error('재발송 실패');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'status-info';
      case 'open': return 'status-warning';
      case 'click': return 'status-success';
      case 'bounce': return 'status-error';
      default: return 'status-info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return '발송완료';
      case 'open': return '열람';
      case 'click': return '클릭';
      case 'bounce': return '반송';
      default: return status;
    }
  };

  const getCountryName = (countryCode: string) => {
    const countries: Record<string, string> = {
      'JP': '일본',
      'TW': '대만',
      'KR': '한국',
      'US': '미국',
      'CN': '중국',
    };
    return countries[countryCode] || countryCode;
  };

  const getSimTypeName = (simType: string) => {
    return simType === 'esim' ? 'eSIM' : 'SIM';
  };

  const generateTrackingLink = (meta: any) => {
    if (!meta) return '';
    return `https://example.com/link/abc?nt_source=${meta.naverId}&nt_medium=${meta.country}${meta.simType}${meta.dispatchCount}`;
  };

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout title="링크 발송 이력">
          <div className="animate-pulse space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
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
      <MainLayout title="링크 발송 이력" subtitle="마케팅 링크 발송 및 추적 현황">
        <div className="space-y-6">
          {/* 통계 요약 */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        총 발송
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {linkSends.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EyeIcon className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        열람
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {linkSends.filter(log => log.status === 'open' || log.status === 'click').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <LinkIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        클릭
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {linkSends.filter(log => log.status === 'click').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        클릭률
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {linkSends.length > 0 
                          ? Math.round((linkSends.filter(log => log.status === 'click').length / linkSends.length) * 100)
                          : 0}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 기간 필터 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  링크 발송 이력
                </h3>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="input-field w-auto"
                >
                  <option value="1d">최근 1일</option>
                  <option value="7d">최근 7일</option>
                  <option value="30d">최근 30일</option>
                  <option value="90d">최근 90일</option>
                </select>
              </div>

              <div className="overflow-hidden">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">수신자</th>
                      <th className="table-header-cell">네이버 ID</th>
                      <th className="table-header-cell">국가/심종류</th>
                      <th className="table-header-cell">상태</th>
                      <th className="table-header-cell">클릭수</th>
                      <th className="table-header-cell">발송일</th>
                      <th className="table-header-cell">작업</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {linkSends.map((log) => (
                      <tr key={log.id}>
                        <td className="table-cell">{log.recipientEmail}</td>
                        <td className="table-cell font-medium">{log.meta?.naverId}</td>
                        <td className="table-cell">
                          {getCountryName(log.meta?.country)} / {getSimTypeName(log.meta?.simType)}
                        </td>
                        <td className="table-cell">
                          <span className={`status-badge ${getStatusColor(log.status)}`}>
                            {getStatusText(log.status)}
                          </span>
                        </td>
                        <td className="table-cell">
                          {log.meta?.clickCount || 0}
                        </td>
                        <td className="table-cell">
                          {log.ts?.toDate ? log.ts.toDate().toLocaleDateString() : '날짜 없음'}
                        </td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setShowLinkDetail(log.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="상세 보기"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleResendLink(log.id)}
                              className="text-green-600 hover:text-green-900"
                              title="재발송"
                            >
                              <EnvelopeIcon className="h-4 w-4" />
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

          {/* 링크 상세 모달 */}
          {showLinkDetail && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowLinkDetail(null)} />
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">링크 상세 정보</h3>
                  </div>
                  <div className="px-6 py-4">
                    {(() => {
                      const log = linkSends.find(l => l.id === showLinkDetail);
                      if (!log) return null;
                      
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">수신자</label>
                              <p className="mt-1 text-sm text-gray-900">{log.recipientEmail}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">네이버 ID</label>
                              <p className="mt-1 text-sm text-gray-900">{log.meta?.naverId}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">국가</label>
                              <p className="mt-1 text-sm text-gray-900">{getCountryName(log.meta?.country)}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">심 종류</label>
                              <p className="mt-1 text-sm text-gray-900">{getSimTypeName(log.meta?.simType)}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">발송 횟수</label>
                              <p className="mt-1 text-sm text-gray-900">{log.meta?.dispatchCount}회</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">클릭 수</label>
                              <p className="mt-1 text-sm text-gray-900">{log.meta?.clickCount || 0}회</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">발송일</label>
                              <p className="mt-1 text-sm text-gray-900">{log.ts.toDate().toLocaleString()}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">마지막 클릭</label>
                              <p className="mt-1 text-sm text-gray-900">
                                {log.meta?.lastClickAt ? new Date(log.meta.lastClickAt).toLocaleString() : '-'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">추적 링크</label>
                            <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-900 break-all">
                                {log.meta?.linkUrl || generateTrackingLink(log.meta)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={() => setShowLinkDetail(null)}
                      className="btn-secondary"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </AuthGuard>
  );
}

