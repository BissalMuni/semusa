import Link from 'next/link'
import { allQuestions, jaejeonghakTopics, computeTopicFrequency, getYears } from '@/lib/data'
import { topicMap } from '@/lib/data/jaejeonghak'

export default function HomePage() {
  const questions = allQuestions
  const years = getYears(questions)
  const topicFreqs = computeTopicFrequency(questions)

  // 주제 레이블 주입
  const freqsWithLabel = topicFreqs.map(f => ({
    ...f,
    topicLabel: topicMap.get(f.topicId)?.section ?? f.topicId,
    chapter: topicMap.get(f.topicId)?.chapter ?? '',
  }))

  // 중요도 상위 15개만 지도에 표시
  const topTopics = freqsWithLabel.slice(0, 15)

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">기출 지도</h1>
        <p className="text-sm text-slate-500 mt-1">
          연도별 출제 주제와 반복 빈도를 한눈에 파악합니다.
          셀이 진할수록 자주 출제된 주제입니다.
        </p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="전체 문제" value={`${questions.length}문제`} color="indigo" />
        <StatCard label="수록 연도" value={`${years[0]}~${years[years.length - 1]}`} color="blue" />
        <StatCard
          label="반복 출제 주제"
          value={`${topicFreqs.filter(f => f.total >= 3).length}개`}
          color="amber"
        />
        <StatCard
          label="최고 반복"
          value={`${topicFreqs[0]?.total ?? 0}회`}
          color="rose"
        />
      </div>

      {/* 기출 지도 히트맵 */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 overflow-x-auto">
        <h2 className="font-semibold text-slate-700 mb-4 text-base">주제 × 연도 출제 빈도</h2>
        <div className="min-w-[600px]">
          {/* 헤더 행 */}
          <div className={`grid gap-1 mb-1 heatmap-grid-${years.length}`}>
            <div />
            {years.map(y => (
              <div key={y} className="text-center text-xs font-semibold text-slate-500 pb-1">
                {y}
              </div>
            ))}
            <div className="text-center text-xs font-semibold text-slate-500 pb-1">합계</div>
          </div>

          {/* 데이터 행 */}
          {topTopics.map(f => (
            <div
              key={f.topicId}
              className={`grid gap-1 mb-1 items-center heatmap-grid-${years.length}`}
            >
              {/* 주제 레이블 */}
              <Link
                href={`/topics#${f.topicId}`}
                className="text-xs text-slate-700 hover:text-indigo-600 truncate pr-2 font-medium"
                title={`${f.chapter} · ${f.topicLabel}`}
              >
                {f.topicLabel}
              </Link>

              {/* 연도별 셀 */}
              {years.map(y => {
                const count = f.counts[y] ?? 0
                const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4
                return (
                  <div
                    key={y}
                    className={`h-8 w-10 rounded flex items-center justify-center text-xs font-bold heatmap-cell-${level} ${count > 0 ? 'text-slate-700' : 'text-slate-300'}`}
                    title={count > 0 ? `${y}년 ${count}문제` : '출제 없음'}
                  >
                    {count > 0 ? count : ''}
                  </div>
                )
              })}

              {/* 합계 */}
              <div className="h-8 w-11 rounded flex items-center justify-center text-xs font-bold text-indigo-700 bg-indigo-50">
                {f.total}
              </div>
            </div>
          ))}
        </div>

        {/* 범례 */}
        <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
          <span>출제 빈도:</span>
          {(['없음', '1회', '2회', '3회', '4+회'] as const).map((label, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`w-4 h-4 rounded heatmap-cell-${i}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 반복 출제 TOP 주제 */}
      <section>
        <h2 className="font-semibold text-slate-700 mb-3 text-base">⭐ 반복 출제 TOP 주제</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {freqsWithLabel.slice(0, 6).map(f => (
            <Link
              key={f.topicId}
              href={`/questions?topic=${f.topicId}`}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 mb-0.5 truncate">{f.chapter}</p>
                  <p className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 truncate">
                    {f.topicLabel}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  {f.total}회
                </span>
              </div>
              {/* 연도별 미니 바 */}
              <div className="mt-3 flex gap-1">
                {years.map(y => {
                  const count = f.counts[y] ?? 0
                  // count 0→h-1(4px), 1→h-2(8px), 2→h-4(16px), 3+→h-6(24px)
                  const barH = count === 0 ? 'h-1' : count === 1 ? 'h-2' : count === 2 ? 'h-4' : 'h-6'
                  return (
                    <div key={y} className="flex-1 flex flex-col items-center gap-0.5">
                      <div
                        className={`w-full rounded-sm transition-all ${barH} ${count > 0 ? 'bg-indigo-400' : 'bg-slate-100'}`}
                      />
                      <span className="text-[10px] text-slate-400">{y.toString().slice(2)}</span>
                    </div>
                  )
                })}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 최근 기출 문제 바로가기 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-700 text-base">최근 기출 문제</h2>
          <Link href="/questions" className="text-sm text-indigo-600 hover:underline">
            전체 보기 →
          </Link>
        </div>
        <div className="space-y-2">
          {questions
            .filter(q => q.year === Math.max(...years))
            .slice(0, 5)
            .map(q => {
              const topic = topicMap.get(q.topicId)
              return (
                <Link
                  key={q.id}
                  href={`/questions/${q.id}`}
                  className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-all group"
                >
                  <span className="shrink-0 text-xs font-mono font-bold text-slate-400 w-12">
                    {q.year}/{q.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-700">
                      {q.questionText}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{topic?.section}</p>
                  </div>
                  <div className="shrink-0 flex flex-wrap gap-1 justify-end max-w-[140px]">
                    {q.keywords.slice(0, 2).map(k => (
                      <span key={k} className="keyword-badge">{k}</span>
                    ))}
                  </div>
                  {q.isMostFrequent && (
                    <span className="shrink-0 freq-badge">반복</span>
                  )}
                </Link>
              )
            })}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: 'indigo' | 'blue' | 'amber' | 'rose'
}) {
  const styles: Record<string, string> = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    rose: 'bg-rose-50 border-rose-100 text-rose-700',
  }
  return (
    <div className={`rounded-xl border p-4 ${styles[color]}`}>
      <p className="text-xs opacity-70 font-medium">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  )
}
