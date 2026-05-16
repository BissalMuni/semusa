'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { allQuestions } from '@/lib/data'

const YEARS = [2022, 2023, 2024, 2025, 2026]

const TOP_NAV = [
  { href: '/',       label: '기출 지도',      icon: '🗺️' },
  { href: '/study',  label: '학습 목차',      icon: '📚' },
  { href: '/topics', label: '주제별 중요도',  icon: '📊' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [openYears, setOpenYears] = useState<Set<number>>(new Set([2026]))

  // 상세 입력된 문제 ID 집합 (PDF 미입력 문제와 구분)
  const detailedIds = new Set(
    allQuestions
      .filter(q => !q.questionText.startsWith('[PDF 입력 필요]'))
      .map(q => q.id)
  )

  function toggleYear(year: number) {
    setOpenYears(prev => {
      const next = new Set(prev)
      next.has(year) ? next.delete(year) : next.add(year)
      return next
    })
  }

  // 현재 열린 문제 ID (경로에서 추출)
  const activeQuestionId = pathname.startsWith('/questions/')
    ? pathname.split('/questions/')[1]
    : null

  return (
    <aside
      className={`
        flex-shrink-0 h-screen sticky top-0 flex flex-col
        bg-white border-r border-slate-200 transition-all duration-200 overflow-hidden
        ${collapsed ? 'w-12' : 'w-52'}
      `}
    >
      {/* 로고 + 접기 버튼 */}
      <div className="flex items-center h-12 px-2 border-b border-slate-100 shrink-0">
        {!collapsed && (
          <Link href="/" className="flex-1 font-bold text-indigo-700 text-sm leading-tight px-1">
            세무사 1차
            <span className="block text-[10px] text-slate-400 font-normal">재정학</span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(v => !v)}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-xs font-bold"
          title={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* 스크롤 가능한 네비 영역 */}
      <div className="flex-1 overflow-y-auto py-2">

        {/* 상단 메뉴 */}
        <div className="px-2 space-y-0.5 mb-2">
          {TOP_NAV.map(item => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`
                  flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-semibold transition-all
                  ${isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <span className="text-sm leading-none shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </div>

        {/* 구분선 */}
        {!collapsed && (
          <div className="mx-3 mb-2 border-t border-slate-100" />
        )}

        {/* 기출 문제 - 연도별 목차 */}
        {collapsed ? (
          <div className="px-2">
            <Link
              href="/questions"
              title="문제 목록"
              className={`flex items-center justify-center px-2 py-2 rounded-lg text-xs font-semibold transition-all
                ${pathname.startsWith('/questions')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              📋
            </Link>
          </div>
        ) : (
          <div className="px-2 space-y-0.5">
            {/* "기출 문제" 헤더 */}
            <div className="px-2 py-1.5 flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">기출 문제</span>
              <Link
                href="/questions"
                className="ml-auto text-[10px] text-indigo-500 hover:underline"
              >
                전체
              </Link>
            </div>

            {/* 연도별 아코디언 */}
            {YEARS.map(year => {
              const isOpen = openYears.has(year)
              // 해당 연도 문제 40개
              const yearQs = allQuestions
                .filter(q => q.year === year)
                .sort((a, b) => a.number - b.number)

              return (
                <div key={year}>
                  {/* 연도 헤더 버튼 */}
                  <button
                    type="button"
                    onClick={() => toggleYear(year)}
                    className={`
                      w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold transition-all
                      ${isOpen ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:bg-slate-100'}
                    `}
                  >
                    <span className={`transition-transform duration-200 text-[10px] ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                    <span>{year}년</span>
                    <span className="ml-auto text-[10px] font-normal text-slate-400">
                      {yearQs.filter(q => detailedIds.has(q.id)).length}/{yearQs.length}
                    </span>
                  </button>

                  {/* 문제 번호 그리드 */}
                  {isOpen && (
                    <div className="px-2 pb-1">
                      <div className="grid grid-cols-8 gap-0.5">
                        {yearQs.map(q => {
                          const isActive = activeQuestionId === q.id
                          const hasDetail = detailedIds.has(q.id)
                          return (
                            <Link
                              key={q.id}
                              href={`/questions/${q.id}`}
                              title={`${year}년 ${q.number}번`}
                              className={`
                                h-6 w-full rounded text-[10px] font-bold flex items-center justify-center transition-all
                                ${isActive
                                  ? 'bg-indigo-600 text-white'
                                  : hasDetail
                                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                                }
                              `}
                            >
                              {q.number}
                            </Link>
                          )
                        })}
                      </div>
                      {/* 범례 */}
                      <div className="mt-1.5 flex items-center gap-2 text-[9px] text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <span className="w-2.5 h-2.5 rounded bg-indigo-100 inline-block" />
                          입력됨
                        </span>
                        <span className="flex items-center gap-0.5">
                          <span className="w-2.5 h-2.5 rounded bg-slate-100 inline-block" />
                          PDF 필요
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 하단 과목 표시 */}
      {!collapsed && (
        <div className="px-3 py-2 border-t border-slate-100 shrink-0">
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">
            재정학
          </span>
        </div>
      )}
    </aside>
  )
}
