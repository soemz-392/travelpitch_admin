'use client';

import { Bars3Icon } from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
}

export default function Header({ onMenuClick, title, subtitle }: HeaderProps) {
  return (
    <div className="lg:pl-64">
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={onMenuClick}
        >
          <span className="sr-only">사이드바 열기</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex flex-1">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              {subtitle && (
                <span className="ml-2 text-sm text-gray-500">{subtitle}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





