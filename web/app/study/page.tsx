import { allQuestions, computeTopicFrequency, getYears } from '@/lib/data'
import { jaejeonghakTopics, topicMap } from '@/lib/data/jaejeonghak'
import { StudyTopicCard } from '@/components/StudyTopicCard'

export default function StudyPage() {
  const questions = allQuestions
  const years = getYears(questions)
  const topicFreqs = computeTopicFrequency(questions)

  // 출제 빈도 내림차순 + 빈도 0인 주제도 마지막에 포함
  const allTopicIds = new Set(jaejeonghakTopics.map(t => t.id))
  const freqMap = new Map(topicFreqs.map(f => [f.topicId, f]))

  const sortedTopics = jaejeonghakTopics.slice().sort((a, b) => {
    const fa = freqMap.get(a.id)?.total ?? 0
    const fb = freqMap.get(b.id)?.total ?? 0
    return fb - fa
  })

  const totalQuestions = questions.length
  const totalTopics = sortedTopics.length
  const coveredTopics = sortedTopics.filter(t => (freqMap.get(t.id)?.total ?? 0) > 0).length

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">학습 목차</h1>
        <p className="text-sm text-slate-500 mt-1">
          기출 출제 빈도 높은 주제 순으로 정렬됩니다.
          클릭으로 3단계 펼치기 — 핵심 키워드 → 출제 패턴 → 상세 이론
        </p>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <p className="text-xs text-indigo-600 font-medium">수록 주제</p>
          <p className="text-xl font-bold text-indigo-700 mt-1">{totalTopics}개</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-medium">기출 확인된 주제</p>
          <p className="text-xl font-bold text-blue-700 mt-1">{coveredTopics}개</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-xs text-amber-600 font-medium">수록 문제</p>
          <p className="text-xl font-bold text-amber-700 mt-1">{totalQuestions}문제</p>
        </div>
      </div>

      {/* 사용 방법 안내 */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold">1</span>
          클릭 → 핵심 문장 + 출제 패턴
        </span>
        <span className="text-slate-300">→</span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">2</span>
          상세 펼치기 → 이론 전체
        </span>
        <span className="text-slate-300">→</span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">3</span>
          기출 문제 링크 → 실제 문제
        </span>
      </div>

      {/* 연도 범례 */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>연도 도트:</span>
        {years.map(y => (
          <span key={y} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            {y}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
          미출제
        </span>
      </div>

      {/* 주제 카드 목록 */}
      <div className="space-y-3">
        {sortedTopics.map((topic, index) => {
          const freq = freqMap.get(topic.id) ?? {
            topicId: topic.id,
            topicLabel: topic.section,
            counts: {},
            total: 0,
            relatedQuestionIds: [],
          }
          const relatedQuestions = freq.relatedQuestionIds
            .map(id => questions.find(q => q.id === id))
            .filter(Boolean) as typeof questions

          return (
            <StudyTopicCard
              key={topic.id}
              rank={index + 1}
              topic={topic}
              freq={freq}
              relatedQuestions={relatedQuestions}
              years={years}
            />
          )
        })}
      </div>
    </div>
  )
}
