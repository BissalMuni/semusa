import { jaejeonghakQuestions } from './jaejeonghak/questions'
import { jaejeonghakTopics } from './jaejeonghak/topics'
import type { Question, TopicFrequency } from '@/lib/types'

// 전체 문제 모음
export const allQuestions: Question[] = [
  ...jaejeonghakQuestions,
]

export { jaejeonghakTopics }

// 문제 ID → 문제 빠른 조회
export const questionMap = new Map(allQuestions.map(q => [q.id, q]))

// 주제별 출제 빈도 계산
export function computeTopicFrequency(questions: Question[]): TopicFrequency[] {
  const map = new Map<string, TopicFrequency>()

  for (const q of questions) {
    const existing = map.get(q.topicId)
    if (existing) {
      existing.counts[q.year] = (existing.counts[q.year] ?? 0) + 1
      existing.total += 1
      existing.relatedQuestionIds.push(q.id)
    } else {
      map.set(q.topicId, {
        topicId: q.topicId,
        topicLabel: q.topicId,  // 실제 레이블은 topic 데이터에서 조회
        counts: { [q.year]: 1 },
        total: 1,
        relatedQuestionIds: [q.id],
      })
    }
  }

  // 총 출제수 내림차순 정렬
  return Array.from(map.values()).sort((a, b) => b.total - a.total)
}

// 연도 목록 (오름차순)
export function getYears(questions: Question[]): number[] {
  return [...new Set(questions.map(q => q.year))].sort()
}
