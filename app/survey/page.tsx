'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';
import { SurveySubmission } from '@/types';
import {
  EyeIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SurveyPage() {
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [showSubmissionDetail, setShowSubmissionDetail] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // API를 통해 설문 제출 데이터 로딩
      const response = await fetch('/api/survey-submissions');
      if (response.ok) {
        const submissionsData = await response.json();
        setSubmissions(submissionsData);
      } else {
        // API 실패 시 샘플 데이터 사용
        setSubmissions([
          {
            id: '1',
            influencerEmail: 'example1@naver.com',
            naverId: 'jdh11830',
            name: '홍길동',
            country: 'JP',
            days: 7,
            desiredStartDate: new Date('2024-01-15'),
            expectedPostDate: new Date('2024-01-20'),
            adDisclosureAgree: true,
            createdAt: { toDate: () => new Date() } as any,
            updatedAt: { toDate: () => new Date() } as any,
          },
          {
            id: '2',
            influencerEmail: 'example2@naver.com',
            naverId: 'traveler_kr',
            name: '김여행',
            country: 'TW',
            days: 5,
            desiredStartDate: new Date('2024-01-20'),
            expectedPostDate: new Date('2024-01-25'),
            adDisclosureAgree: true,
            createdAt: { toDate: () => new Date() } as any,
            updatedAt: { toDate: () => new Date() } as any,
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubmission = (submissionId: string) => {
    setSelectedSubmissions(prev => 
      prev.includes(submissionId) 
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubmissions.length === submissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(submissions.map(s => s.id));
    }
  };

  const handleExportSelected = async () => {
    if (selectedSubmissions.length === 0) {
      toast.error('선택된 설문이 없습니다.');
      return;
    }

    try {
      // 선택된 설문 데이터 가져오기
      const selectedData = submissions.filter(submission => 
        selectedSubmissions.includes(submission.id)
      );

      // CSV 형태로 변환
      const csvData = [
        ['이름', '네이버 ID', '이메일', '국가', '이용일수', '개통희망일', '예상 포스팅일', '광고성 표기 동의', '전화번호', '휴대폰 기종', 'SNS 링크', 'SIM 유형', '메모', '트래킹 링크'],
        ...selectedData.map(submission => [
          submission.name,
          submission.naverId,
          submission.influencerEmail,
          getCountryName(submission.country),
          submission.days,
          submission.desiredStartDate?.toLocaleDateString ? submission.desiredStartDate.toLocaleDateString() : new Date(submission.desiredStartDate).toLocaleDateString(),
          submission.expectedPostDate?.toLocaleDateString ? submission.expectedPostDate.toLocaleDateString() : new Date(submission.expectedPostDate).toLocaleDateString(),
          submission.adDisclosureAgree ? '동의' : '미동의',
          submission.phone || '',
          submission.phoneModel || '',
          submission.snsLink || '',
          submission.simType || '',
          submission.adminMemo || '',
          submission.trackingLink || ''
        ])
      ];

      // CSV 다운로드
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `survey_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${selectedSubmissions.length}개 설문이 내보내기되었습니다.`);
    } catch (error) {
      toast.error('내보내기 실패');
    }
  };

  const getCountryName = (countryCode: string) => {
    const countries: Record<string, string> = {
      'EU': '유럽',
      'VN': '베트남',
      'TH': '태국',
      'JP': '일본',
      'US': '미국',
      'CN': '중국',
      'TW': '대만',
      'PH': '필리핀',
      'ID': '인도네시아',
      'MY': '말레이시아',
      'HK': '홍콩마카오',
      'AU': '호주',
      'SG': '싱가포르',
      'IN': '인도',
      'LA': '라오스',
      'ETC': '기타',
    };
    return countries[countryCode] || countryCode;
  };

  const getStatusColor = (submission: SurveySubmission) => {
    if (!submission.adDisclosureAgree) return 'status-error';
     const startDate = submission.desiredStartDate instanceof Date ? submission.desiredStartDate : new Date(submission.desiredStartDate);
    if (startDate < new Date()) return 'status-warning';
    return 'status-success';
  };

  const getStatusText = (submission: SurveySubmission) => {
    if (!submission.adDisclosureAgree) return '광고성 표기 미동의';
     const startDate = submission.desiredStartDate instanceof Date ? submission.desiredStartDate : new Date(submission.desiredStartDate);
    if (startDate < new Date()) return '개통일 지남';
    return '정상';
  };

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout title="설문 관리">
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
      <MainLayout title="설문 관리" subtitle="인플루언서 설문 제출 현황 및 관리">
        <div className="space-y-6">
          {/* 설문 제출 목록 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  설문 제출 목록
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="btn-secondary"
                  >
                    {selectedSubmissions.length === submissions.length ? '전체 해제' : '전체 선택'}
                  </button>
                  <button
                    onClick={handleExportSelected}
                    disabled={selectedSubmissions.length === 0}
                    className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    선택 내보내기
                  </button>
                </div>
              </div>

              <div className="overflow-hidden">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">
                        <input
                          type="checkbox"
                          checked={selectedSubmissions.length === submissions.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </th>
                      <th className="table-header-cell">이름</th>
                      <th className="table-header-cell">네이버 ID</th>
                      <th className="table-header-cell">국가</th>
                      <th className="table-header-cell">이용일수</th>
                      <th className="table-header-cell">개통희망일</th>
                      <th className="table-header-cell">트래킹 링크</th>
                      <th className="table-header-cell">상태</th>
                      <th className="table-header-cell">제출일</th>
                      <th className="table-header-cell">작업</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td className="table-cell">
                          <input
                            type="checkbox"
                            checked={selectedSubmissions.includes(submission.id)}
                            onChange={() => handleSelectSubmission(submission.id)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                        <td className="table-cell font-medium">{submission.name}</td>
                        <td className="table-cell">{submission.naverId}</td>
                        <td className="table-cell">{getCountryName(submission.country)}</td>
                        <td className="table-cell">{submission.days}일</td>
                        <td className="table-cell">
                          {submission.desiredStartDate?.toLocaleDateString ? submission.desiredStartDate.toLocaleDateString() : new Date(submission.desiredStartDate).toLocaleDateString()}
                        </td>
                        <td className="table-cell">
                          {submission.trackingLink ? (
                            <a
                              href={submission.trackingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 underline text-sm"
                              title="트래킹 링크 열기"
                            >
                              링크 보기
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">링크 없음</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className={`status-badge ${getStatusColor(submission)}`}>
                            {getStatusText(submission)}
                          </span>
                        </td>
                        <td className="table-cell">
                          {submission.createdAt?.toDate ? submission.createdAt.toDate().toLocaleDateString() : '날짜 없음'}
                        </td>
                        <td className="table-cell">
                          <button
                            onClick={() => setShowSubmissionDetail(submission.id)}
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

          {/* 설문 상세 모달 */}
          {showSubmissionDetail && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowSubmissionDetail(null)} />
                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">설문 상세 정보</h3>
                  </div>
                  <div className="px-6 py-4">
                    {(() => {
                      const submission = submissions.find(s => s.id === showSubmissionDetail);
                      if (!submission) return null;
                      
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">이름</label>
                              <p className="mt-1 text-sm text-gray-900">{submission.name}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">네이버 ID</label>
                              <p className="mt-1 text-sm text-gray-900">{submission.naverId}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">이메일</label>
                              <p className="mt-1 text-sm text-gray-900">{submission.influencerEmail}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">국가</label>
                              <p className="mt-1 text-sm text-gray-900">{getCountryName(submission.country)}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">이용일수</label>
                              <p className="mt-1 text-sm text-gray-900">{submission.days}일</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">개통희망일</label>
                              <p className="mt-1 text-sm text-gray-900">
                                {submission.desiredStartDate?.toLocaleDateString ? submission.desiredStartDate.toLocaleDateString() : new Date(submission.desiredStartDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">예상 포스팅일</label>
                              <p className="mt-1 text-sm text-gray-900">
                                {submission.expectedPostDate?.toLocaleDateString ? submission.expectedPostDate.toLocaleDateString() : new Date(submission.expectedPostDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">광고성 표기 동의</label>
                              <p className="mt-1 text-sm text-gray-900">
                                {submission.adDisclosureAgree ? (
                                  <span className="inline-flex items-center text-green-600">
                                    <CheckIcon className="h-4 w-4 mr-1" />
                                    동의
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-red-600">
                                    <XMarkIcon className="h-4 w-4 mr-1" />
                                    미동의
                                  </span>
                                )}
                              </p>
                            </div>
                            {submission.phone && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700">전화번호</label>
                                <p className="mt-1 text-sm text-gray-900">{submission.phone}</p>
                              </div>
                            )}
                            {submission.phoneModel && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700">휴대폰 기종</label>
                                <p className="mt-1 text-sm text-gray-900">{submission.phoneModel}</p>
                              </div>
                            )}
                            {submission.snsLink && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700">SNS 링크</label>
                                <p className="mt-1 text-sm text-gray-900">{submission.snsLink}</p>
                              </div>
                            )}
                            {submission.simType && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700">SIM 유형</label>
                                <p className="mt-1 text-sm text-gray-900">{submission.simType === 'usim' ? '유심(USIM)' : '이심(eSIM)'}</p>
                              </div>
                            )}
                            {submission.adminMemo && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700">메모</label>
                                <p className="mt-1 text-sm text-gray-900">{submission.adminMemo}</p>
                              </div>
                            )}
                            {submission.trackingLink && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700">트래킹 링크</label>
                                <p className="mt-1 text-sm text-gray-900">
                                  <a
                                    href={submission.trackingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-900 underline break-all"
                                  >
                                    {submission.trackingLink}
                                  </a>
                                </p>
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">제출일</label>
                              <p className="mt-1 text-sm text-gray-900">
                                {submission.createdAt?.toDate ? submission.createdAt.toDate().toLocaleDateString() : '날짜 없음'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={() => setShowSubmissionDetail(null)}
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

