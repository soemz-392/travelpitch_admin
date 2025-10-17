'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';
import { KeywordSet, Influencer } from '@/types';
import {
  PlusIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  EyeIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CrawlingPage() {
  const [keywordSets, setKeywordSets] = useState<KeywordSet[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKeywordForm, setShowKeywordForm] = useState(false);
  const [showInfluencerForm, setShowInfluencerForm] = useState(false);
  const [newKeywordSet, setNewKeywordSet] = useState({
    name: '',
    country: '',
    keywords: '',
  });
  const [newInfluencer, setNewInfluencer] = useState({
    name: '',
    email: '',
    blogUrl: '',
    country: '',
    tags: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // API를 통해 키워드 세트 로딩
      const response = await fetch('/api/keyword-sets');
      if (response.ok) {
        const keywordSetsData = await response.json();
        setKeywordSets(keywordSetsData);
      }

      // 인플루언서 로딩
      const influencerResponse = await fetch('/api/influencers');
      if (influencerResponse.ok) {
        const influencersData = await influencerResponse.json();
        setInfluencers(influencersData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKeywordSet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const keywords = newKeywordSet.keywords.split(',').map(k => k.trim()).filter(k => k);
      
      const keywordSetData = {
        name: newKeywordSet.name,
        country: newKeywordSet.country,
        keywords,
        isActive: true,
        createdAt: { toDate: () => new Date() } as any,
        updatedAt: { toDate: () => new Date() } as any,
      };

      // API를 통해 저장
      const response = await fetch('/api/keyword-sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(keywordSetData),
      });

      if (response.ok) {
        const savedKeywordSet = await response.json();
        console.log('Created keyword set with ID:', savedKeywordSet.id);
        setKeywordSets([...keywordSets, savedKeywordSet]);
        setNewKeywordSet({ name: '', country: '', keywords: '' });
        setShowKeywordForm(false);
        toast.success('키워드 세트가 생성되었습니다.');
      } else {
        toast.error('키워드 세트 생성 실패');
      }
    } catch (error) {
      toast.error('키워드 세트 생성 실패');
    }
  };

  const handleToggleKeywordSet = async (id: string) => {
    try {
      const updatedSet = keywordSets.find(set => set.id === id);
      if (updatedSet) {
        const newStatus = !updatedSet.isActive;
        
        const response = await fetch(`/api/keyword-sets/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isActive: newStatus }),
        });

        if (response.ok) {
          setKeywordSets(keywordSets.map(set => 
            set.id === id ? { ...set, isActive: newStatus } : set
          ));
          toast.success('키워드 세트 상태가 변경되었습니다.');
        } else {
          toast.error('상태 변경 실패');
        }
      }
    } catch (error) {
      toast.error('상태 변경 실패');
    }
  };

  const handleDeleteKeywordSet = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/keyword-sets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setKeywordSets(keywordSets.filter(set => set.id !== id));
        toast.success('키워드 세트가 삭제되었습니다.');
      } else {
        toast.error('삭제 실패');
      }
    } catch (error) {
      toast.error('삭제 실패');
    }
  };

  const handleRunCrawling = async (keywordSetId: string) => {
    try {
      const keywordSet = keywordSets.find(set => set.id === keywordSetId);
      if (!keywordSet) {
        toast.error('키워드 세트를 찾을 수 없습니다');
        return;
      }

      toast.loading('크롤링 실행 중... 완료 후 CSV 파일이 자동 다운로드됩니다.', { id: 'crawling' });
      
      const response = await fetch('/api/crawling/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywordSetId }),
      });

      if (response.ok) {
        // CSV 파일 다운로드
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // 파일명 생성
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        a.download = `${keywordSet.name}_${today}.csv`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success(`크롤링 완료! CSV 파일이 다운로드되었습니다.`, { id: 'crawling' });
        
        // 데이터 새로고침
        fetchData();
      } else {
        const errorText = await response.text();
        let errorMsg = '크롤링 실패';
        try {
          const errorData = JSON.parse(errorText);
          console.error('Crawling error:', errorData);
          errorMsg = errorData.details 
            ? `${errorData.error}: ${errorData.details}` 
            : errorData.error || '크롤링 시작 실패';
        } catch (e) {
          console.error('Error parsing error response:', errorText);
        }
        toast.error(errorMsg, { id: 'crawling' });
      }
    } catch (error) {
      console.error('Crawling request failed:', error);
      toast.error('크롤링 시작 실패: 네트워크 오류', { id: 'crawling' });
    }
  };

  const handleCreateInfluencer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tags = newInfluencer.tags.split(',').map(t => t.trim()).filter(t => t);
      
      const response = await fetch('/api/influencers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newInfluencer.name,
          email: newInfluencer.email,
          blogUrl: newInfluencer.blogUrl,
          country: newInfluencer.country,
          tags,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setInfluencers([result.influencer, ...influencers]);
        setNewInfluencer({ name: '', email: '', blogUrl: '', country: '', tags: '' });
        setShowInfluencerForm(false);
        toast.success('인플루언서가 추가되었습니다.');
      } else {
        const error = await response.json();
        console.error('API Error:', error);
        const errorMessage = error.details 
          ? `${error.error}: ${error.details}` 
          : error.error || '인플루언서 추가 실패';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to create influencer:', error);
      toast.error('인플루언서 추가 실패: 네트워크 오류');
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout title="크롤링 관리">
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
      <MainLayout title="크롤링 관리" subtitle="키워드 세트 및 크롤링 결과 관리">
        <div className="space-y-6">
          {/* 키워드 세트 관리 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  키워드 세트
                </h3>
                <button
                  onClick={() => setShowKeywordForm(true)}
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  새 키워드 세트
                </button>
              </div>

              {showKeywordForm && (
                <form onSubmit={handleCreateKeywordSet} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        세트 이름
                      </label>
                      <input
                        type="text"
                        value={newKeywordSet.name}
                        onChange={(e) => setNewKeywordSet({ ...newKeywordSet, name: e.target.value })}
                        className="input-field"
                        placeholder="예: 일본 유심"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        국가 코드
                      </label>
                      <input
                        type="text"
                        value={newKeywordSet.country}
                        onChange={(e) => setNewKeywordSet({ ...newKeywordSet, country: e.target.value })}
                        className="input-field"
                        placeholder="예: JP"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        키워드 (쉼표로 구분)
                      </label>
                      <input
                        type="text"
                        value={newKeywordSet.keywords}
                        onChange={(e) => setNewKeywordSet({ ...newKeywordSet, keywords: e.target.value })}
                        className="input-field"
                        placeholder="예: 일본, 유심, 여행"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowKeywordForm(false)}
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
                      <th className="table-header-cell">국가</th>
                      <th className="table-header-cell">키워드</th>
                      <th className="table-header-cell">상태</th>
                      <th className="table-header-cell">작업</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {keywordSets.map((set) => (
                      <tr key={set.id}>
                        <td className="table-cell font-medium">{set.name}</td>
                        <td className="table-cell">{set.country}</td>
                        <td className="table-cell">
                          <div className="flex flex-wrap gap-1">
                            {set.keywords.map((keyword, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={`status-badge ${set.isActive ? 'status-success' : 'status-error'}`}>
                            {set.isActive ? '활성' : '비활성'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRunCrawling(set.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="크롤링 실행"
                            >
                              <PlayIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleKeywordSet(set.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title={set.isActive ? '비활성화' : '활성화'}
                            >
                              <PauseIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteKeywordSet(set.id)}
                              className="text-red-600 hover:text-red-900"
                              title="삭제"
                            >
                              <TrashIcon className="h-4 w-4" />
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

          {/* 크롤링 사용 안내 */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">크롤링 사용 방법</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>키워드 세트의 <strong>▶ 버튼</strong>을 클릭하면 크롤링이 시작됩니다</li>
                    <li>크롤링 완료 후 <strong>CSV 파일이 자동 다운로드</strong>됩니다</li>
                    <li>파일명: <code className="bg-blue-100 px-1 rounded">키워드세트명_YYYYMMDD.csv</code></li>
                    <li>CSV에는 키워드 세트, 블로그 URL, 제목, 이메일, 수집일이 포함됩니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 인플루언서 수동 추가 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  인플루언서 관리
                </h3>
                <button
                  onClick={() => setShowInfluencerForm(true)}
                  className="btn-primary flex items-center"
                >
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  인플루언서 추가
                </button>
              </div>

              {showInfluencerForm && (
                <form onSubmit={handleCreateInfluencer} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이름
                      </label>
                      <input
                        type="text"
                        value={newInfluencer.name}
                        onChange={(e) => setNewInfluencer({ ...newInfluencer, name: e.target.value })}
                        className="input-field"
                        placeholder="예: 홍길동"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이메일 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={newInfluencer.email}
                        onChange={(e) => setNewInfluencer({ ...newInfluencer, email: e.target.value })}
                        className="input-field"
                        placeholder="예: example@naver.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SNS 주소 (블로그 URL) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={newInfluencer.blogUrl}
                        onChange={(e) => setNewInfluencer({ ...newInfluencer, blogUrl: e.target.value })}
                        className="input-field"
                        placeholder="예: https://blog.naver.com/example"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        국가 코드
                      </label>
                      <input
                        type="text"
                        value={newInfluencer.country}
                        onChange={(e) => setNewInfluencer({ ...newInfluencer, country: e.target.value })}
                        className="input-field"
                        placeholder="예: KR, JP, US"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        태그 (쉼표로 구분)
                      </label>
                      <input
                        type="text"
                        value={newInfluencer.tags}
                        onChange={(e) => setNewInfluencer({ ...newInfluencer, tags: e.target.value })}
                        className="input-field"
                        placeholder="예: 여행, 유심, 리뷰"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowInfluencerForm(false)}
                      className="btn-secondary"
                    >
                      취소
                    </button>
                    <button type="submit" className="btn-primary">
                      추가
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-hidden">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">이름</th>
                      <th className="table-header-cell">이메일</th>
                      <th className="table-header-cell">SNS 주소</th>
                      <th className="table-header-cell">국가</th>
                      <th className="table-header-cell">태그</th>
                      <th className="table-header-cell">등록일</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {influencers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="table-cell text-center text-gray-500">
                          등록된 인플루언서가 없습니다. 위 버튼을 클릭하여 추가해주세요.
                        </td>
                      </tr>
                    ) : (
                      influencers.map((influencer) => (
                        <tr key={influencer.id}>
                          <td className="table-cell font-medium">{influencer.name || '-'}</td>
                          <td className="table-cell">{influencer.email}</td>
                          <td className="table-cell">
                            <a
                              href={influencer.blogUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 truncate max-w-xs block"
                            >
                              {influencer.blogUrl}
                            </a>
                          </td>
                          <td className="table-cell">{influencer.country || '-'}</td>
                          <td className="table-cell">
                            <div className="flex flex-wrap gap-1">
                              {influencer.tags && influencer.tags.length > 0 ? (
                                influencer.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                          <td className="table-cell">
                            {influencer.createdAt?.toDate ? influencer.createdAt.toDate().toLocaleDateString() : '날짜 없음'}
                          </td>
                        </tr>
                      ))
                    )}
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

