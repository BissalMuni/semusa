'use client'

import { use } from 'react'
import Link from 'next/link'
import { allQuestions } from '@/lib/data'
import { topicMap } from '@/lib/data/jaejeonghak'
import type { DifficultyLevel } from '@/lib/types'

const DIFF_LABEL: Record<DifficultyLevel, string> = { 1: '쉬움', 2: '보통', 3: '어려움' }
const DIFF_COLOR: Record<DifficultyLevel, string> = {
  1: 'text-emerald-600 bg-emerald-50',
  2: 'text-amber-600 bg-amber-50',
  3: 'text-rose-600 bg-rose-50',
}

export default function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; year?: string; freq?: string }>
}) {
  const params = use(searchParams)
  const topicFilter = params.topic ?? ''
  const yearFilter = params.year ? Number(params.year) : 0
  const freqOnly = params.freq === '1'

  let questions = allQuestions

  if (topicFilter) questions = questions.filter(q => q.topicId === topicFilter)
  if (yearFilter) questions = questions.filter(q => q.year === yearFilter)
  if (freqOnly) questions = questions.filter(q => q.isMostFrequent)

  // 연도 목록
  const years = [...new Set(allQuestions.map(q => q.year))].sort()

  // 주제 목록
  const topics = [...new Set(allQuestions.map(q => q.topicId))].map(id => ({
    id,
    label: topicMap.get(id)?.section ?? id,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">문제 목록</h1>
        <p className="text-sm text-slate-500 mt-1">
          {questions.length}문제 · 클릭하면 5단계 펼치기/줄이기 학습 페이지로 이동합니다.
        </p>
      </div>

      {/* 필터 바 */}
      <div className="flex flex-wrap gap-2">
        {/* 연도 필터 */}
        <div className="flex items-center gap-1 flex-wrap">
          <FilterChip href="/questions" active={yearFilter === 0} label="전체" />
          {years.map(y => (
            <FilterChip
              key={y}
              href={`/questions?year=${y}${topicFilter ? `&topic=${topicFilter}` : ''}${freqOnly ? '&freq=1' : ''}`}
              active={yearFilter === y}
              label={`${y}년`}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-slate-200 self-center" />

        {/* 반복 출제 */}
        <FilterChip
          href={`/questions?freq=${freqOnly ? '' : '1'}${yearFilter ? `&year=${yearFilter}` : ''}${topicFilter ? `&topic=${topicFilter}` : ''}`}
          active={freqOnly}
          label="⭐ 반복 출제만"
          activeColor="amber"
        />
      </div>

      {/* 주제 필터 */}
      <div className="flex flex-wrap gap-1.5">
        <FilterChip href="/questions" active={!topicFilter} label="주제 전체" />
        {topics.map(t => (
          <FilterChip
            key={t.id}
            href={`/questions?topic=${t.id}${yearFilter ? `&year=${yearFilter}` : ''}${freqOnly ? '&freq=1' : ''}`}
            active={topicFilter === t.id}
            label={t.label}
          />
        ))}
      </div>

      {/* 문제 리스트 */}
      {questions.length === 0 ? (
        <p className="text-center text-slate-400 py-16">조건에 맞는 문제가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {questions.map(q => {
            const topic = topicMap.get(q.topicId)
            return (
              <Link
                key={q.id}
                href={`/questions/${q.id}`}
                className="flex items-start gap-4 bg-white rounded-xl border border-slate-200 px-5 py-4 hover:border-indigo-300 hover:shadow-sm transition-all group"
              >
                {/* 번호 + 연도 */}
                <div className="shrink-0 text-center">
                  <div className="text-xs text-slate-400 font-mono">{q.year}</div>
                  <div className="text-lg font-bold text-slate-300 leading-tight">{String(q.number).padStart(2, '0')}</div>
                </div>

                {/* 핵심 문장 + 문제 텍스트 */}
                <div className="min-w-0 flex-1 space-y-1">
                  {/* Level 2: 핵심 문장 */}
                  <p className="text-xs text-indigo-600 font-medium leading-snug">
                    {q.coreStatement}
                  </p>
                  {/* Level 3: 문제 텍스트 (미리보기) */}
                  <p className="text-sm text-slate-700 group-hover:text-slate-900 leading-snug truncate">
                    {q.questionText}
                  </p>
                  {/* 주제 */}
                  <p className="text-xs text-slate-400">
                    {topic?.chapter} · {topic?.section}
                  </p>
                </div>

                {/* 키워드 + 배지 */}
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <div className="flex flex-wrap gap-1 justify-end max-w-[160px]">
                    {q.keywords.map(k => (
                      <span key={k} className="keyword-badge">{k}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLOR[q.difficulty]}`}>
                      {DIFF_LABEL[q.difficulty]}
                    </span>
                    {q.isMostFrequent && <span className="freq-badge">반복</span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FilterChip({
  href,
  active,
  label,
  activeColor = 'indigo',
}: {
  href: string
  active: boolean
  label: string
  activeColor?: 'indigo' | 'amber'
}) {
  const activeStyles: Record<string, string> = {
    indigo: 'bg-indigo-600 text-white border-indigo-600',
    amber: 'bg-amber-500 text-white border-amber-500',
  }
  return (
    <Link
      href={href}
      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
        ${active
          ? activeStyles[activeColor]
          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
        }`}
    >
      {label}
    </Link>
  )
}
