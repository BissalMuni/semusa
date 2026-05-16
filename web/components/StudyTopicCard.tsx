'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Topic, TopicFrequency } from '@/lib/types'
import type { Question } from '@/lib/types'

type CardLevel = 0 | 1 | 2   // 0: 최소, 1: 중간, 2: 상세

const EXAM_TYPE_COLOR: Record<string, string> = {
  '계산형':  'bg-blue-100 text-blue-700',
  '개념형':  'bg-violet-100 text-violet-700',
  '그래프형':'bg-emerald-100 text-emerald-700',
  '추론형':  'bg-amber-100 text-amber-700',
  '비교형':  'bg-rose-100 text-rose-700',
}

interface Props {
  rank: number
  topic: Topic
  freq: TopicFrequency
  relatedQuestions: Question[]
  years: number[]
}

export function StudyTopicCard({ rank, topic, freq, relatedQuestions, years }: Props) {
  const [level, setLevel] = useState<CardLevel>(0)

  const maxBar = Math.max(freq.total, 1)

  return (
    <div
      id={topic.id}
      className={`
        bg-white rounded-2xl border transition-all duration-200
        ${level === 0 ? 'border-slate-200' : level === 1 ? 'border-indigo-200 shadow-sm' : 'border-indigo-300 shadow-md'}
      `}
    >
      {/* ── Level 0: 한 줄 요약 (항상 표시) ───────────────────── */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
        onClick={() => setLevel(l => (l === 0 ? 1 : 0))}
      >
        {/* 순위 */}
        <span
          className={`
            shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
            ${rank <= 3 ? 'bg-indigo-600 text-white' : rank <= 6 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}
          `}
        >
          {rank}
        </span>

        {/* 주제명 + 챕터 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-800 text-sm">{topic.section}</span>
            <span className="text-xs text-slate-400 hidden sm:inline">{topic.chapter}</span>
          </div>
          {/* 핵심 키워드 (항상 표시) */}
          <div className="flex flex-wrap gap-1 mt-1">
            {topic.keywords.map(k => (
              <span key={k} className="keyword-badge">{k}</span>
            ))}
          </div>
        </div>

        {/* 오른쪽: 빈도 + 연도 도트 + 펼치기 */}
        <div className="shrink-0 flex items-center gap-3">
          {/* 연도별 출제 도트 */}
          <div className="hidden sm:flex gap-1">
            {years.map(y => (
              <div
                key={y}
                className={`w-2 h-2 rounded-full ${(freq.counts[y] ?? 0) > 0 ? 'bg-indigo-500' : 'bg-slate-200'}`}
                title={`${y}년${(freq.counts[y] ?? 0) > 0 ? ` ${freq.counts[y]}회` : ' 미출제'}`}
              />
            ))}
          </div>
          {/* 총 빈도 배지 */}
          <span className={`
            shrink-0 text-xs font-bold px-2.5 py-1 rounded-full
            ${freq.total >= 4 ? 'bg-indigo-600 text-white' : freq.total >= 2 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}
          `}>
            {freq.total}회
          </span>
          {/* 펼치기 화살표 */}
          <span className={`text-slate-400 text-sm transition-transform duration-200 ${level > 0 ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {/* ── Level 1: 중간 (핵심 문장 + 출제 패턴) ─────────────── */}
      <div className={`expand-content ${level >= 1 ? 'expanded' : 'collapsed'}`}>
        <div className="px-5 pb-4 space-y-4 border-t border-slate-100 pt-4">
          {/* 출제 유형 태그 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">출제 유형</span>
            {topic.examTypes.map(t => (
              <span key={t} className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${EXAM_TYPE_COLOR[t] ?? 'bg-slate-100 text-slate-600'}`}>
                {t}
              </span>
            ))}
          </div>

          {/* 핵심 문장 */}
          <div className="bg-indigo-50 rounded-xl border border-indigo-100 px-4 py-3">
            <p className="text-sm font-medium text-indigo-900 leading-relaxed">{topic.coreText}</p>
          </div>

          {/* 출제 패턴 */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1.5">시험에 어떻게 나오나</p>
            <p className="text-sm text-slate-700 leading-relaxed">{topic.examPattern}</p>
          </div>

          {/* 연도별 기출 미니 표 */}
          <div className="flex gap-2 flex-wrap">
            {years.map(y => {
              const count = freq.counts[y] ?? 0
              const qs = relatedQuestions.filter(q => q.year === y)
              return (
                <div key={y} className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-xs
                  ${count > 0 ? 'border-indigo-200 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}>
                  <span className={`font-bold ${count > 0 ? 'text-indigo-700' : 'text-slate-300'}`}>{y}</span>
                  {qs.map(q => (
                    <Link
                      key={q.id}
                      href={`/questions/${q.id}`}
                      onClick={e => e.stopPropagation()}
                      className="text-[10px] bg-white border border-indigo-200 text-indigo-600 px-1.5 py-0.5 rounded hover:bg-indigo-100 transition-colors"
                    >
                      {q.number}번
                    </Link>
                  ))}
                  {count === 0 && <span className="text-slate-300">-</span>}
                </div>
              )
            })}
          </div>

          {/* 상세 보기 버튼 */}
          <button
            onClick={e => { e.stopPropagation(); setLevel(l => l < 2 ? 2 : 1) }}
            className={`text-xs px-4 py-1.5 rounded-full font-medium transition-colors
              ${level >= 2
                ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
          >
            {level >= 2 ? '↑ 상세 접기' : '↓ 상세 설명 펼치기'}
          </button>
        </div>
      </div>

      {/* ── Level 2: 상세 (이론 전체 설명) ──────────────────────── */}
      <div className={`expand-content ${level >= 2 ? 'expanded' : 'collapsed'}`}>
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          <p className="text-xs font-bold text-slate-400 mb-3">상세 이론</p>
          <pre className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 rounded-xl px-4 py-4 border border-slate-200">
            {topic.detailedContent}
          </pre>

          {/* 관련 기출 문제 링크 */}
          {relatedQuestions.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-400 mb-2">관련 기출 문제</p>
              <div className="space-y-1.5">
                {relatedQuestions.map(q => (
                  <Link
                    key={q.id}
                    href={`/questions/${q.id}`}
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-indigo-300 hover:shadow-sm transition-all group"
                  >
                    <span className="shrink-0 text-xs font-mono text-slate-400 w-16">{q.year}년 {q.number}번</span>
                    <span className="text-xs text-slate-600 truncate group-hover:text-indigo-700">{q.coreStatement}</span>
                    {q.isMostFrequent && <span className="shrink-0 freq-badge">반복</span>}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
