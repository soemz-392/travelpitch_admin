'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';
import { Settings } from '@/types';
import {
  Cog6ToothIcon,
  DocumentIcon,
  LinkIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // TODO: 실제 데이터 로딩 구현
      setSettings({
        id: '1',
        proposalPdfId: 'proposal.pdf',
        surveyBaseUrl: 'https://survey.example.com',
        linkBaseUrl: 'https://link.example.com',
        countryCodes: {
          'KR': 'kr',
          'JP': 'jp',
          'TW': 'tw',
          'US': 'us',
          'CN': 'cn',
        },
        emailRateLimit: {
          perMinute: 50,
          perHour: 1000,
        },
        updatedAt: new Date() as any,
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('설정 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // TODO: 실제 API 호출
      toast.success('설정이 저장되었습니다.');
    } catch (error) {
      toast.error('설정 저장 실패');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      // TODO: 실제 파일 업로드 구현
      toast.success('파일이 업로드되었습니다.');
    } catch (error) {
      toast.error('파일 업로드 실패');
    }
  };

  const tabs = [
    { id: 'general', name: '일반 설정', icon: Cog6ToothIcon },
    { id: 'email', name: '이메일 설정', icon: EnvelopeIcon },
    { id: 'files', name: '파일 관리', icon: DocumentIcon },
    { id: 'urls', name: 'URL 설정', icon: LinkIcon },
  ];

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <MainLayout title="설정">
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
    <AuthGuard requiredRole="admin">
      <MainLayout title="설정" subtitle="시스템 설정 및 관리">
        <div className="space-y-6">
          {/* 탭 네비게이션 */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* 일반 설정 */}
          {activeTab === 'general' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  일반 설정
                </h3>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이메일 발송 제한 (분당)
                      </label>
                      <input
                        type="number"
                        value={settings?.emailRateLimit.perMinute || 50}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          emailRateLimit: { ...prev.emailRateLimit, perMinute: parseInt(e.target.value) }
                        } : null)}
                        className="input-field"
                        min="1"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이메일 발송 제한 (시간당)
                      </label>
                      <input
                        type="number"
                        value={settings?.emailRateLimit.perHour || 1000}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          emailRateLimit: { ...prev.emailRateLimit, perHour: parseInt(e.target.value) }
                        } : null)}
                        className="input-field"
                        min="1"
                        max="10000"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 이메일 설정 */}
          {activeTab === 'email' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  이메일 설정
                </h3>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      발송자 이메일
                    </label>
                    <input
                      type="email"
                      value="noreply@example.com"
                      className="input-field"
                      readOnly
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      발송자 이메일은 이메일 서비스 제공업체에서 설정됩니다.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      회사 정보
                    </label>
                    <textarea
                      value="(주)예시회사\n대표: 홍길동\n주소: 서울시 강남구 테헤란로 123\n전화: 02-1234-5678"
                      className="input-field"
                      rows={4}
                      readOnly
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      이 정보는 이메일 하단에 자동으로 포함됩니다.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 파일 관리 */}
          {activeTab === 'files' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  파일 관리
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      제휴 제안서 PDF
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="input-field"
                      />
                      <span className="text-sm text-gray-500">
                        현재: {settings?.proposalPdfId || '없음'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      제휴 제안 메일에 첨부될 PDF 파일을 업로드하세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* URL 설정 */}
          {activeTab === 'urls' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  URL 설정
                </h3>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      설문 기본 URL
                    </label>
                    <input
                      type="url"
                      value={settings?.surveyBaseUrl || ''}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        surveyBaseUrl: e.target.value
                      } : null)}
                      className="input-field"
                      placeholder="https://survey.example.com"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      인플루언서가 설문에 참여할 수 있는 기본 URL입니다.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      링크 기본 URL
                    </label>
                    <input
                      type="url"
                      value={settings?.linkBaseUrl || ''}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        linkBaseUrl: e.target.value
                      } : null)}
                      className="input-field"
                      placeholder="https://link.example.com"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      마케팅 링크의 기본 URL입니다.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      국가 코드 매핑
                    </label>
                    <div className="space-y-2">
                      {Object.entries(settings?.countryCodes || {}).map(([code, name]) => (
                        <div key={code} className="flex items-center space-x-4">
                          <span className="w-8 text-sm font-medium text-gray-700">{code}</span>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setSettings(prev => prev ? {
                              ...prev,
                              countryCodes: { ...prev.countryCodes, [code]: e.target.value }
                            } : null)}
                            className="input-field flex-1"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      국가 코드와 표시명의 매핑을 설정합니다.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </AuthGuard>
  );
}





