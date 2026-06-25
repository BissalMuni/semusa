// 세무사 1차 시험 학습 데이터 타입 정의

export type Subject = '재정학' | '세법학개론' | '회계학개론' | '상법'

export type DifficultyLevel = 1 | 2 | 3  // 1: 쉬움, 2: 보통, 3: 어려움

export type ExamQuestionType = '계산형' | '개념형' | '그래프형' | '추론형' | '비교형'

// 목차 주제 - 계층 구조
export interface Topic {
  id: string
  subject: Subject
  chapter: string       // 예: "1장. 시장과 가격"
  section: string       // 예: "1.2 수요와 공급의 법칙"
  keywords: string[]    // 핵심 키워드
  coreText: string      // 핵심 요약 (1-2문장)

  // 기출 출제 패턴
  examTypes: ExamQuestionType[]   // 출제 유형 태그
  examPattern: string             // 출제 방식 설명 (어떻게 묻는지)
  detailedContent: string         // 상세 설명 (이론 전체)
}

// 문제 데이터 - 5단계 확장 구조
export interface Question {
  id: string            // "2024_1_재정학_15"
  year: number
  examPaper: 1 | 2      // 1교시/2교시
  subject: Subject
  number: number        // 문제 번호 (해당 과목 내)

  topicId: string       // 연결된 목차 주제 ID
  relatedQuestionIds: string[]  // 유사 기출 문제 IDs

  // 5단계 확장 구조 (핵심 → 상세)
  keywords: string[]           // Level 1: 핵심 키워드 2-3개
  coreStatement: string        // Level 2: 핵심 문장 1-2문장
  questionText: string         // Level 3: 전체 문제
  subItems?: string[]          // 보기(ㄱ·ㄴ·ㄷ…) 항목 — "모두 고른 것" 유형
  choices: string[]            // 객관식 보기 (보통 5지선다)
  answer: number               // 정답 번호 (1-5)
  choiceAnalysis?: string[]    // 각 선지별 분석 (선지 개수와 동일)
  basicExplanation: string     // Level 4: 쉬운 해설
  detailedExplanation: string  // Level 5: 상세 해설 (이론 연결)

  difficulty: DifficultyLevel
  isMostFrequent: boolean      // 반복 출제 여부
}

// 기출 지도용 - 주제별 출제 빈도
export interface TopicFrequency {
  topicId: string
  topicLabel: string
  counts: Record<number, number>  // 연도별 출제 횟수
  total: number
  relatedQuestionIds: string[]
}

// 연도별 시험 정보
export interface ExamInfo {
  year: number
  paper: 1 | 2
  subject: Subject
  totalQuestions: number
  date: string
}
