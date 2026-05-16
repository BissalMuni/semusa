import Link from 'next/link'
import { allQuestions, jaejeonghakTopics, computeTopicFrequency, getYears } from '@/lib/data'
import { topicMap } from '@/lib/data/jaejeonghak'

export default function TopicsPage() {
  const questions = allQuestions
  const years = getYears(questions)
  const topicFreqs = computeTopicFrequency(questions)

  const freqsWithLabel = topicFreqs.map(f => ({
    ...f,
    topic: topicMap.get(f.topicId),
  }))

  // 챕터별로 묶기
  const byChapter = new Map<string, typeof freqsWithLabel>()
  for (const f of freqsWithLabel) {
    const ch = f.topic?.chapter ?? '기타'
    if (!byChapter.has(ch)) byChapter.set(ch, [])
    byChapter.get(ch)!.push(f)
  }

  const maxTotal = Math.max(...topicFreqs.map(f => f.total), 1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">주제별 중요도</h1>
        <p className="text-sm text-slate-500 mt-1">
          반복 출제 횟수 기반. 막대가 길수록 시험에서 더 자주 나온 주제입니다.
        </p>
      </div>

      {/* 전체 중요도 차트 (상위 12개) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-700 mb-4 text-sm">출제 빈도 TOP 12</h2>
        <div className="space-y-2">
          {freqsWithLabel.slice(0, 12).map((f, rank) => {
            const pct = Math.round((f.total / maxTotal) * 100)
            return (
              <div key={f.topicId} id={f.topicId} className="flex items-center gap-3">
                {/* 순위 */}
                <span className="shrink-0 w-6 text-xs font-bold text-slate-300 text-right">
                  {rank + 1}
                </span>
                {/* 주제명 */}
                <Link
                  href={`/questions?topic=${f.topicId}`}
                  className="shrink-0 w-40 text-sm text-slate-700 hover:text-indigo-600 truncate font-medium"
                  title={f.topic?.section}
                >
                  {f.topic?.section ?? f.topicId}
                </Link>
                {/* 바 */}
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all flex items-center justify-end pr-2
                      ${rank === 0 ? 'bg-indigo-600' : rank < 3 ? 'bg-indigo-500' : rank < 6 ? 'bg-indigo-400' : 'bg-indigo-300'}`}
                    style={{ width: `${pct}%` }}
                  >
                    {pct > 15 && (
                      <span className="text-[10px] font-bold text-white">{f.total}회</span>
                    )}
                  </div>
                </div>
                {pct <= 15 && (
                  <span className="text-xs font-bold text-indigo-600 w-8">{f.total}회</span>
                )}
                {/* 연도 도트 */}
                <div className="shrink-0 flex gap-0.5">
                  {years.map(y => (
                    <div
                      key={y}
                      className={`w-2 h-2 rounded-full ${(f.counts[y] ?? 0) > 0 ? 'bg-indigo-500' : 'bg-slate-200'}`}
                      title={`${y}년`}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        {/* 연도 도트 범례 */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <span>연도 도트:</span>
          {years.map(y => (
            <span key={y} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
              {y}
            </span>
          ))}
        </div>
      </section>

      {/* 챕터별 주제 목록 */}
      {Array.from(byChapter.entries()).map(([chapter, items]) => (
        <section key={chapter} className="space-y-3">
          <h2 className="font-bold text-slate-700 text-sm border-l-4 border-indigo-500 pl-3">
            {chapter}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {items.map(f => {
              const topic = f.topic
              const pct = Math.round((f.total / maxTotal) * 100)
              return (
                <div
                  key={f.topicId}
                  id={f.topicId}
                  className="bg-white rounded-xl border border-slate-200 p-4 space-y-3"
                >
                  {/* 주제명 + 빈도 */}
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/questions?topic=${f.topicId}`}
                      className="font-semibold text-slate-800 hover:text-indigo-700 text-sm"
                    >
                      {topic?.section ?? f.topicId}
                    </Link>
                    <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full
                      ${f.total >= 4 ? 'bg-indigo-100 text-indigo-700' : f.total >= 2 ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                      {f.total}회
                    </span>
                  </div>

                  {/* 중요도 바 */}
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div
                      className="h-full rounded-full bg-indigo-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* 핵심 문장 */}
                  {topic && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {topic.coreText}
                    </p>
                  )}

                  {/* 키워드 */}
                  {topic && (
                    <div className="flex flex-wrap gap-1">
                      {topic.keywords.map(k => (
                        <span key={k} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                          {k}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 관련 문제 링크 */}
                  <div className="flex flex-wrap gap-1">
                    {f.relatedQuestionIds.map(qid => {
                      const q = allQuestions.find(x => x.id === qid)
                      return q ? (
                        <Link
                          key={qid}
                          href={`/questions/${qid}`}
                          className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 hover:bg-indigo-100 transition-colors"
                        >
                          {q.year}/{q.number}번
                        </Link>
                      ) : null
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
