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
      // TODO: 실제 데이터 로딩 구현
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
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
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
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
        },
      ]);

      setBatches([
        {
          id: '1',
          submissionIds: ['1', '2'],
          fileUrl: 'https://example.com/batch1.xlsx',
          status: 'downloaded',
          processedAt: { toDate: () => new Date() } as any,
          createdAt: { toDate: () => new Date() } as any,
        },
      ]);

      setMappings([
        {
          id: '1',
          country: 'JP',
          simType: 'esim',
          planName: 'KDDI 7일',
          days: 7,
          sellerProductCode: 'ESAZB-JPKD007D_003GD',
        },
        {
          id: '2',
          country: 'TW',
          simType: 'esim',
          planName: 'Chunghwa 5일',
          days: 5,
          sellerProductCode: 'ESAZB-TWCH005D_003GD',
        },
      ]);
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
      // 선택된 설문 데이터 가져오기
      const selectedData = submissions.filter(submission => 
        selectedSubmissions.includes(submission.id)
      );

      // XLSX 형태로 변환 (자사몰 업로드 포맷)
      const xlsxData = selectedData.map((submission, index) => ({
        '상품주문번호 / 주문번호': `RV${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(index + 1).padStart(3, '0')}`,
        '배송방법': '배송없음',
        '택배사/송장번호': '',
        '발송일': new Date().toISOString().slice(0, 10),
        '구매자명/ID/수취인명': submission.name,
        '주문상태/주문세부상태': '발송대기/신규주문',
        '결제위치/결제일': 'MOBILE / ' + new Date().toISOString().slice(0, 10),
        '상품번호/상품명': 'ESAZB-JPKD007D_003GD', // 매핑 테이블에서 가져와야 함
        '상품종류': '조합형옵션상품',
        '옵션정보1(연락처)': '',
        '옵션정보2(이메일)': submission.influencerEmail,
        '옵션정보3(출국일)': '',
        '옵션정보4(귀국일)': '',
        '옵션정보5(개통희망일)': submission.desiredStartDate.toISOString().slice(0, 10),
        '옵션정보6(수령방법)': '배송없음',
        '옵션정보7(요금플랜)': 'KDDI 7일',
        '옵션정보8(이용일수)': submission.days,
        '옵션정보9': '',
        '옵션정보10': '',
        '옵션관리코드': 'ESAZB-JPKD007D_003GD',
        '수량': 1,
        '가격': 0,
        '할인액': 0,
        '수취인연락처': '',
        '수취인주소': '',
        '우편번호': '',
        '배송메세지': '',
        '출고지': '',
        '결제수단': 'MOBILE',
        '개인통관고유부호': '',
        '주문일시': new Date().toISOString().slice(0, 19).replace('T', ' '),
        '판매채널': '스마트스토어',
      }));

      // CSV 형태로 다운로드 (XLSX 라이브러리 없이)
      const csvData = [
        Object.keys(xlsxData[0]),
        ...xlsxData.map(row => Object.values(row))
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `dispatch_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 배치 생성
      const batch: DispatchBatch = {
        id: Date.now().toString(),
        submissionIds: selectedSubmissions,
        status: 'ready',
        createdAt: { toDate: () => new Date() } as any,
      };

      setBatches([...batches, batch]);
      toast.success('엑셀 파일이 생성되었습니다.');
    } catch (error) {
      toast.error('엑셀 생성 실패');
    }
  };

  const handleDownloadExcel = async (batchId: string) => {
    try {
      // TODO: 실제 다운로드 API 호출
      setBatches(batches.map(batch => 
        batch.id === batchId ? { ...batch, status: 'downloaded' } : batch
      ));
      toast.success('엑셀 파일이 다운로드되었습니다.');
    } catch (error) {
      toast.error('다운로드 실패');
    }
  };

  const handleMarkAsProcessed = async (batchId: string) => {
    try {
      // TODO: 실제 처리 완료 API 호출
      setBatches(batches.map(batch => 
        batch.id === batchId ? { ...batch, status: 'done', processedAt: new Date() as any } : batch
      ));
      toast.success('발송 처리가 완료되었습니다.');
    } catch (error) {
      toast.error('처리 완료 실패');
    }
  };

  const handleCreateMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: 실제 API 호출
      const mapping: ProductMapping = {
        id: Date.now().toString(),
        country: newMapping.country,
        simType: newMapping.simType,
        planName: newMapping.planName,
        days: newMapping.days,
        sellerProductCode: newMapping.sellerProductCode,
      };

      setMappings([...mappings, mapping]);
      setNewMapping({ country: '', simType: 'esim', planName: '', days: 0, sellerProductCode: '' });
      setShowMappingForm(false);
      toast.success('매핑이 생성되었습니다.');
    } catch (error) {
      toast.error('매핑 생성 실패');
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      // TODO: 실제 API 호출
      setMappings(mappings.filter(mapping => mapping.id !== mappingId));
      toast.success('매핑이 삭제되었습니다.');
    } catch (error) {
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

