'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';
import { SurveySubmission, DispatchBatch, ProductMapping } from '@/types';
import {
  ArrowDownTrayIcon,
  CheckIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function DispatchPage() {
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
  const [batches, setBatches] = useState<DispatchBatch[]>([]);
  const [mappings, setMappings] = useState<ProductMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [showMappingForm, setShowMappingForm] = useState(false);
  const [newMapping, setNewMapping] = useState({
    country: '',
    simType: 'esim' as 'sim' | 'esim',
    planName: '',
    days: 0,
    sellerProductCode: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 설문 제출 조회
      const submissionsResponse = await fetch('/api/survey-submissions');
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData);
      }

      // 발송 배치 조회
      const batchesResponse = await fetch('/api/dispatch/batches');
      if (batchesResponse.ok) {
        const batchesData = await batchesResponse.json();
        setBatches(batchesData);
      }

      // 상품 매핑 조회
      const mappingsResponse = await fetch('/api/product-mappings');
      if (mappingsResponse.ok) {
        const mappingsData = await mappingsResponse.json();
        setMappings(mappingsData);
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

  const handleGenerateExcel = async () => {
    if (selectedSubmissions.length === 0) {
      toast.error('선택된 설문이 없습니다.');
      return;
    }

    try {
      toast.loading('엑셀 파일 생성 중...', { id: 'excel-gen' });

      const response = await fetch('/api/dispatch/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionIds: selectedSubmissions,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`엑셀 파일이 생성되었습니다 (${result.submissionCount}건)`, { id: 'excel-gen' });
        
        // 배치 목록 새로고침
        fetchData();
        
        // 선택 초기화
        setSelectedSubmissions([]);
      } else {
        const error = await response.json();
        toast.error(error.error || '엑셀 생성 실패', { id: 'excel-gen' });
      }
    } catch (error) {
      console.error('Failed to generate excel:', error);
      toast.error('엑셀 생성 실패', { id: 'excel-gen' });
    }
  };

  const handleDownloadExcel = async (batchId: string) => {
    try {
      toast.loading('다운로드 중...', { id: 'download' });
      
      const response = await fetch(`/api/dispatch/excel?batchId=${batchId}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dispatch_${batchId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success('엑셀 파일이 다운로드되었습니다.', { id: 'download' });
        
        // 배치 상태 업데이트
        setBatches(batches.map(batch => 
          batch.id === batchId ? { ...batch, status: 'downloaded' } : batch
        ));
      } else {
        const error = await response.json();
        toast.error(error.error || '다운로드 실패', { id: 'download' });
      }
    } catch (error) {
      console.error('Failed to download excel:', error);
      toast.error('다운로드 실패', { id: 'download' });
    }
  };

  const handleMarkAsProcessed = async (batchId: string) => {
    try {
      const response = await fetch(`/api/dispatch/batches/${batchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'done' }),
      });

      if (response.ok) {
        setBatches(batches.map(batch => 
          batch.id === batchId ? { ...batch, status: 'done', processedAt: new Date() as any } : batch
        ));
        toast.success('발송 처리가 완료되었습니다.');
      } else {
        const error = await response.json();
        toast.error(error.error || '처리 완료 실패');
      }
    } catch (error) {
      console.error('Failed to mark as processed:', error);
      toast.error('처리 완료 실패');
    }
  };

  const handleCreateMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/product-mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMapping),
      });

      if (response.ok) {
        const result = await response.json();
        setMappings([...mappings, result.mapping]);
        setNewMapping({ country: '', simType: 'esim', planName: '', days: 0, sellerProductCode: '' });
        setShowMappingForm(false);
        toast.success('매핑이 생성되었습니다.');
      } else {
        const error = await response.json();
        toast.error(error.error || '매핑 생성 실패');
      }
    } catch (error) {
      console.error('Failed to create mapping:', error);
      toast.error('매핑 생성 실패');
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/product-mappings/${mappingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMappings(mappings.filter(mapping => mapping.id !== mappingId));
        toast.success('매핑이 삭제되었습니다.');
      } else {
        const error = await response.json();
        toast.error(error.error || '삭제 실패');
      }
    } catch (error) {
      console.error('Failed to delete mapping:', error);
      toast.error('삭제 실패');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'status-info';
      case 'downloaded': return 'status-warning';
      case 'done': return 'status-success';
      default: return 'status-info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return '생성완료';
      case 'downloaded': return '다운로드됨';
      case 'done': return '처리완료';
      default: return status;
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout title="발송 관리">
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
      <MainLayout title="발송 관리" subtitle="상품 발송 처리 및 엑셀 관리">
        <div className="space-y-6">
          {/* 발송 대상 선택 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  발송 대상 선택
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="btn-secondary"
                  >
                    {selectedSubmissions.length === submissions.length ? '전체 해제' : '전체 선택'}
                  </button>
                  <button
                    onClick={handleGenerateExcel}
                    disabled={selectedSubmissions.length === 0}
                    className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    엑셀 생성
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
                          {submission.desiredStartDate.toLocaleDateString()}
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

          {/* 발송 배치 관리 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                발송 배치 관리
              </h3>
              <div className="overflow-hidden">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">배치 ID</th>
                      <th className="table-header-cell">처리 건수</th>
                      <th className="table-header-cell">상태</th>
                      <th className="table-header-cell">생성일</th>
                      <th className="table-header-cell">처리일</th>
                      <th className="table-header-cell">작업</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {batches.map((batch) => (
                      <tr key={batch.id}>
                        <td className="table-cell font-medium">{batch.id}</td>
                        <td className="table-cell">{batch.submissionIds.length}</td>
                        <td className="table-cell">
                          <span className={`status-badge ${getStatusColor(batch.status)}`}>
                            {getStatusText(batch.status)}
                          </span>
                        </td>
                        <td className="table-cell">
                          {batch.createdAt?.toDate ? batch.createdAt.toDate().toLocaleDateString() : '날짜 없음'}
                        </td>
                        <td className="table-cell">
                          {batch.processedAt ? (batch.processedAt?.toDate ? batch.processedAt.toDate().toLocaleDateString() : '날짜 없음') : '-'}
                        </td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            {batch.status === 'ready' && (
                              <button
                                onClick={() => handleDownloadExcel(batch.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="다운로드"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              </button>
                            )}
                            {batch.status === 'downloaded' && (
                              <button
                                onClick={() => handleMarkAsProcessed(batch.id)}
                                className="text-green-600 hover:text-green-900"
                                title="처리 완료"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 상품 매핑 관리 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  상품 매핑 관리
                </h3>
                <button
                  onClick={() => setShowMappingForm(true)}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  새 매핑
                </button>
              </div>

              {showMappingForm && (
                <form onSubmit={handleCreateMapping} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        국가 코드
                      </label>
                      <input
                        type="text"
                        value={newMapping.country}
                        onChange={(e) => setNewMapping({ ...newMapping, country: e.target.value })}
                        className="input-field"
                        placeholder="예: JP"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        심 종류
                      </label>
                      <select
                        value={newMapping.simType}
                        onChange={(e) => setNewMapping({ ...newMapping, simType: e.target.value as 'sim' | 'esim' })}
                        className="input-field"
                        required
                      >
                        <option value="esim">eSIM</option>
                        <option value="sim">SIM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        플랜명
                      </label>
                      <input
                        type="text"
                        value={newMapping.planName}
                        onChange={(e) => setNewMapping({ ...newMapping, planName: e.target.value })}
                        className="input-field"
                        placeholder="예: KDDI 7일"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이용일수
                      </label>
                      <input
                        type="number"
                        value={newMapping.days}
                        onChange={(e) => setNewMapping({ ...newMapping, days: parseInt(e.target.value) })}
                        className="input-field"
                        min="1"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        판매자 상품코드
                      </label>
                      <input
                        type="text"
                        value={newMapping.sellerProductCode}
                        onChange={(e) => setNewMapping({ ...newMapping, sellerProductCode: e.target.value })}
                        className="input-field"
                        placeholder="예: ESAZB-JPKD007D_003GD"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowMappingForm(false)}
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
                      <th className="table-header-cell">국가</th>
                      <th className="table-header-cell">심 종류</th>
                      <th className="table-header-cell">플랜명</th>
                      <th className="table-header-cell">이용일수</th>
                      <th className="table-header-cell">상품코드</th>
                      <th className="table-header-cell">작업</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {mappings.map((mapping) => (
                      <tr key={mapping.id}>
                        <td className="table-cell">{getCountryName(mapping.country)}</td>
                        <td className="table-cell">
                          <span className="status-badge status-info">
                            {mapping.simType === 'esim' ? 'eSIM' : 'SIM'}
                          </span>
                        </td>
                        <td className="table-cell">{mapping.planName}</td>
                        <td className="table-cell">{mapping.days}일</td>
                        <td className="table-cell font-mono text-sm">{mapping.sellerProductCode}</td>
                        <td className="table-cell">
                          <button
                            onClick={() => handleDeleteMapping(mapping.id)}
                            className="text-red-600 hover:text-red-900"
                            title="삭제"
                          >
                            <TrashIcon className="h-4 w-4" />
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

