import type { Metadata } from 'next'
import { Sidebar } from '@/components/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: '세무사 1차 기출 학습',
  description: '세무사 1차 시험 기출문제 기반 효율적 학습 앱',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full flex bg-slate-50 overflow-hidden">
        {/* 왼쪽 사이드바 네비게이션 */}
        <Sidebar />

        {/* 오른쪽 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto">
          <main className="max-w-5xl mx-auto px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
