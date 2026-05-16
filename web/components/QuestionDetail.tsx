'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Question, Topic } from '@/lib/types'
import { allQuestions } from '@/lib/data'
import { topicMap } from '@/lib/data/jaejeonghak'

type ExpandLevel = 0 | 1 | 2 | 3 | 4

// 5단계 레벨 설명
const LEVELS = [
  { label: '핵심 키워드', icon: '🔑', color: 'indigo' },
  { label: '핵심 문장', icon: '💡', color: 'blue' },
  { label: '문제 전체', icon: '📋', color: 'violet' },
  { label: '기본 해설', icon: '📖', color: 'teal' },
  { label: '상세 해설', icon: '🔬', color: 'slate' },
]

export function QuestionDetail({ question }: { question: Question }) {
  const [level, setLevel] = useState<ExpandLevel>(0)
  const [showAnswer, setShowAnswer] = useState(false)

  const topic = topicMap.get(question.topicId)
  const relatedQuestions = question.relatedQuestionIds
    .map(id => allQuestions.find(q => q.id === id))
    .filter(Boolean) as Question[]

  return (
    <div className="space-y-6">
      {/* 상단 메타 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/questions" className="hover:text-indigo-600">← 문제 목록</Link>
          <span>·</span>
          <span>{question.year}년 재정학 {question.number}번</span>
          {question.isMostFrequent && <span className="freq-badge">반복 출제</span>}
        </div>
        {/* 이전/다음 */}
        <QuestionNav currentId={question.id} />
      </div>

      {/* 주제 경로 */}
      {topic && (
        <div className="text-xs text-slate-400 bg-slate-50 rounded-lg px-4 py-2 flex items-center gap-2">
          <Link href="/topics" className="hover:text-indigo-600 hover:underline">{topic.chapter}</Link>
          <span>›</span>
          <Link href={`/topics#${topic.id}`} className="hover:text-indigo-600 hover:underline font-medium">{topic.section}</Link>
        </div>
      )}

      {/* ── 5단계 확장 컨트롤 ────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* 레벨 탭 */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          {LEVELS.map((l, i) => (
            <button
              key={i}
              onClick={() => setLevel(i as ExpandLevel)}
              className={`flex-1 py-3 text-xs font-semibold transition-all flex flex-col items-center gap-0.5
                ${level >= i
                  ? 'bg-white text-indigo-700 border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <span className="text-base">{l.icon}</span>
              <span className="hidden sm:block leading-tight text-center">{l.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {/* Level 0: 핵심 키워드 (항상 표시) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">핵심 키워드</span>
              <div className="h-px flex-1 bg-indigo-100" />
            </div>
            <div className="flex flex-wrap gap-2">
              {question.keywords.map(k => (
                <span key={k} className="keyword-badge text-sm px-3 py-1">{k}</span>
              ))}
            </div>
          </div>

          {/* Level 1: 핵심 문장 */}
          <div className={`expand-content ${level >= 1 ? 'expanded' : 'collapsed'}`}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">핵심 문장</span>
                <div className="h-px flex-1 bg-blue-100" />
              </div>
              <p className="text-base text-slate-800 font-medium leading-relaxed bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                {question.coreStatement}
              </p>
            </div>
          </div>

          {/* Level 2: 전체 문제 */}
          <div className={`expand-content ${level >= 2 ? 'expanded' : 'collapsed'}`}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-violet-600 uppercase tracking-wide">문제</span>
                <div className="h-px flex-1 bg-violet-100" />
              </div>
              <div className="bg-violet-50 rounded-xl border border-violet-100 p-4 space-y-3">
                <p className="text-slate-800 font-medium leading-relaxed">{question.questionText}</p>
                <ol className="space-y-1.5 mt-3">
                  {question.choices.map((choice, i) => (
                    <li
                      key={i}
                      className={`text-sm flex gap-2 px-3 py-2 rounded-lg transition-all
                        ${showAnswer && i + 1 === question.answer
                          ? 'bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300'
                          : 'text-slate-700 hover:bg-white'
                        }`}
                    >
                      <span className="font-bold shrink-0 text-slate-400">{'①②③④⑤'[i]}</span>
                      <span>{choice}</span>
                    </li>
                  ))}
                </ol>
                <button
                  onClick={() => setShowAnswer(v => !v)}
                  className={`mt-2 text-xs font-semibold px-4 py-2 rounded-full transition-colors
                    ${showAnswer
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {showAnswer ? `✓ 정답: ${question.answer}번` : '정답 확인'}
                </button>
              </div>
            </div>
          </div>

          {/* Level 3: 기본 해설 */}
          <div className={`expand-content ${level >= 3 ? 'expanded' : 'collapsed'}`}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">기본 해설</span>
                <div className="h-px flex-1 bg-teal-100" />
              </div>
              <div className="bg-teal-50 rounded-xl border border-teal-100 p-4">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {question.basicExplanation}
                </p>
              </div>
            </div>
          </div>

          {/* Level 4: 상세 해설 */}
          <div className={`expand-content ${level >= 4 ? 'expanded' : 'collapsed'}`}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">상세 해설</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <pre className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {question.detailedExplanation}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 빠른 이동 버튼 */}
        <div className="px-6 pb-5 flex gap-2 flex-wrap">
          <button
            onClick={() => { setLevel(0); setShowAnswer(false) }}
            className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            ↑ 핵심만 보기
          </button>
          <button
            onClick={() => setLevel(4)}
            className="text-xs px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            ↓ 전부 펼치기
          </button>
        </div>
      </div>

      {/* 관련 기출 문제 */}
      {relatedQuestions.length > 0 && (
        <section>
          <h2 className="font-semibold text-slate-700 mb-3 text-sm">같은 주제 반복 기출</h2>
          <div className="space-y-2">
            {relatedQuestions.map(rq => (
              <Link
                key={rq.id}
                href={`/questions/${rq.id}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all group"
              >
                <span className="shrink-0 text-xs font-mono text-slate-400 w-16">{rq.year}년/{rq.number}번</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-indigo-600 font-medium truncate">{rq.coreStatement}</p>
                  <p className="text-sm text-slate-700 truncate group-hover:text-slate-900">{rq.questionText}</p>
                </div>
                {rq.isMostFrequent && <span className="shrink-0 freq-badge">반복</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 주제 핵심 요약 */}
      {topic && (
        <section className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
          <h2 className="font-semibold text-indigo-800 mb-2 text-sm">📚 주제 핵심 요약</h2>
          <p className="text-sm text-indigo-900 leading-relaxed">{topic.coreText}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {topic.keywords.map(k => (
              <span key={k} className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                {k}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// 이전/다음 문제 네비게이션
function QuestionNav({ currentId }: { currentId: string }) {
  const idx = allQuestions.findIndex(q => q.id === currentId)
  const prev = idx > 0 ? allQuestions[idx - 1] : null
  const next = idx < allQuestions.length - 1 ? allQuestions[idx + 1] : null

  return (
    <div className="flex gap-2 text-xs">
      {prev ? (
        <Link
          href={`/questions/${prev.id}`}
          className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
        >
          ← {prev.year}/{prev.number}번
        </Link>
      ) : <div />}
      {next && (
        <Link
          href={`/questions/${next.id}`}
          className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
        >
          {next.year}/{next.number}번 →
        </Link>
      )}
    </div>
  )
}
