'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';
import { DashboardStats } from '@/types';
import {
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 실제 데이터 로딩 구현
    const fetchStats = async () => {
      try {
        // 임시 데이터
        setStats({
          newCrawlResults: 15,
          newSurveySubmissions: 8,
          pendingDispatches: 3,
          recentCampaigns: [],
          recentLinkSends: [],
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      name: '신규 크롤링 결과',
      value: stats?.newCrawlResults || 0,
      icon: MagnifyingGlassIcon,
      href: '/crawling',
      color: 'bg-blue-500',
    },
    {
      name: '신규 설문 제출',
      value: stats?.newSurveySubmissions || 0,
      icon: ClipboardDocumentListIcon,
      href: '/survey',
      color: 'bg-green-500',
    },
    {
      name: '미발송 건수',
      value: stats?.pendingDispatches || 0,
      icon: TruckIcon,
      href: '/dispatch',
      color: 'bg-yellow-500',
    },
    {
      name: '최근 캠페인',
      value: stats?.recentCampaigns?.length || 0,
      icon: EnvelopeIcon,
      href: '/email',
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout title="대시보드">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-gray-300 rounded"></div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="mt-2 h-6 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout title="대시보드" subtitle="인플루언서 관리 현황">
        <div className="space-y-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <Link
                key={card.name}
                href={card.href}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-8 w-8 rounded-md ${card.color} flex items-center justify-center`}>
                        <card.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {card.name}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {card.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 최근 활동 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                최근 활동
              </h3>
              <div className="text-center py-8">
                <p className="text-gray-500">최근 활동이 없습니다.</p>
              </div>
            </div>
          </div>

          {/* 빠른 작업 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                빠른 작업
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  href="/crawling"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                      <MagnifyingGlassIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">
                      크롤링 실행
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      새로운 인플루언서를 발굴합니다.
                    </p>
                  </div>
                </Link>

                <Link
                  href="/email"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                      <EnvelopeIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">
                      이메일 발송
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      제휴 제안 메일을 발송합니다.
                    </p>
                  </div>
                </Link>

                <Link
                  href="/dispatch"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                      <TruckIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">
                      발송 처리
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      상품 발송을 처리합니다.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  );
}





