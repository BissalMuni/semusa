import type { Question } from '@/lib/types'
import { topicMap } from './topics'

// ── 상세 입력된 문제 (PDF에서 실제 내용 확인) ──────────────────────
// 기존 12문제 + 이후 추가 예정
const DETAILED: Partial<Record<string, Omit<Question, 'id' | 'year' | 'number' | 'examPaper' | 'subject'>>> = {

  '2022_재정학_01': {
    topicId: 'micro_elasticity',
    relatedQuestionIds: ['2023_재정학_03', '2024_재정학_02', '2025_재정학_01'],
    keywords: ['가격탄력성', '탄력적', '비탄력적'],
    coreStatement: '탄력성 크기와 세금 부담: 비탄력적인 쪽이 조세를 더 부담한다.',
    questionText: '수요의 가격탄력성에 관한 설명으로 옳은 것은?',
    choices: [
      '가격이 하락할 때 수요가 증가하면 탄력적이다',
      '대체재가 많을수록 탄력성이 낮아진다',
      '가격탄력성이 1보다 크면 가격 인상 시 총수입이 증가한다',
      '필수품보다 사치품의 탄력성이 더 크다',
      '장기보다 단기의 탄력성이 더 크다',
    ],
    answer: 4,
    basicExplanation:
      '필수품은 대체재가 적고 소비를 줄이기 어려워 비탄력적(|Ed|<1)이다. 사치품은 대체재가 많고 포기 가능하여 탄력적(|Ed|>1)이다.',
    detailedExplanation:
      '【탄력성 결정 요인】\n①대체재 수: 많을수록 탄력적\n②필수재 vs 사치재: 사치재 더 탄력적 (정답④)\n③정의 범위: 좁을수록 탄력적\n④기간: 장기>단기 (오답⑤)\n\n【가격탄력성과 총수입】\n|Ed|>1: 가격↑→TR↓\n|Ed|<1: 가격↑→TR↑ (오답③)',
    difficulty: 1, isMostFrequent: true,
  },

  '2022_재정학_05': {
    topicId: 'externality',
    relatedQuestionIds: ['2023_재정학_07', '2025_재정학_06'],
    keywords: ['외부효과', '피구세', '사회적비용'],
    coreStatement: '부정적 외부성 → 사회적 최적보다 과잉생산. 피구세로 외부비용 내재화.',
    questionText: '어떤 기업이 생산 과정에서 오염물질을 배출한다. 이 경우 시장 균형에 관한 설명으로 옳은 것은?',
    choices: [
      '사회적 한계비용(SMC)이 사적 한계비용(PMC)보다 낮다',
      '시장 균형 생산량이 사회적 최적 생산량보다 적다',
      '피구세를 부과하면 사회적 최적을 달성할 수 있다',
      '코즈 정리는 거래비용과 무관하게 항상 성립한다',
      '정부 개입 없이도 시장에서 자동으로 외부비용이 조정된다',
    ],
    answer: 3,
    basicExplanation: 'SMC=PMC+MEC>PMC → 기업 과잉생산. 피구세=MEC로 설정→사회적최적 달성.',
    detailedExplanation:
      '【부정적 외부성】\nSMC=PMC+MEC. 시장균형Q>사회적최적Q*\n피구세=MEC→PMC+세=SMC→Q* 달성\n\n【코즈정리 조건】\n재산권 명확+거래비용=0 일 때만 성립 (오답④)',
    difficulty: 2, isMostFrequent: true,
  },

  '2022_재정학_12': {
    topicId: 'tax_incidence',
    relatedQuestionIds: ['2023_재정학_11', '2024_재정학_10', '2025_재정학_12', '2026_재정학_09'],
    keywords: ['조세귀착', '탄력성', '소비자부담'],
    coreStatement: '소비자 부담비율 = εs / (εs + |εd|). 공급이 탄력적일수록 소비자가 더 부담.',
    questionText: '수요의 가격탄력성이 -0.5이고, 공급의 가격탄력성이 1.5인 시장에 단위당 세금을 부과할 때 소비자와 생산자의 조세 부담 비율로 옳은 것은?',
    choices: ['소비자 25%, 생산자 75%','소비자 33%, 생산자 67%','소비자 50%, 생산자 50%','소비자 67%, 생산자 33%','소비자 75%, 생산자 25%'],
    answer: 5,
    basicExplanation: '소비자=εs/(εs+|εd|)=1.5/2=75%. 생산자=0.5/2=25%.',
    detailedExplanation:
      '【공식】소비자부담=εs/(εs+|εd|)=1.5/(1.5+0.5)=75%\n생산자부담=|εd|/(εs+|εd|)=0.5/2=25%\n\n【직관】공급 탄력(εs=1.5)→대안 있어 회피→소비자에 전가',
    difficulty: 2, isMostFrequent: true,
  },

  '2022_재정학_18': {
    topicId: 'public_goods',
    relatedQuestionIds: ['2023_재정학_18', '2024_재정학_17'],
    keywords: ['공공재', '비배제성', '비경합성', '무임승차'],
    coreStatement: '공공재: 비경합성+비배제성. 무임승차 → 과소공급.',
    questionText: '순수 공공재(pure public goods)의 특성에 관한 설명으로 옳지 않은 것은?',
    choices: [
      '소비의 비경합성: 한 사람의 소비가 다른 사람의 소비 가능량을 줄이지 않는다',
      '소비의 비배제성: 대가를 지불하지 않은 사람을 소비에서 배제할 수 없다',
      '무임승차 문제로 인해 사회적 최적 수준보다 과잉 공급되는 경향이 있다',
      '수요의 합산: 개인 수요를 수직으로 합산하여 사회적 수요를 도출한다',
      '국방, 등대, 방역이 전형적인 예시이다',
    ],
    answer: 3,
    basicExplanation: '무임승차 → 과소공급 (과잉이 아님). 오답③.',
    detailedExplanation:
      '【과소공급 원인】비용 안내도 소비 가능→수요 표출 안함→시장 공급 불충분\n\n【수요합산】공공재=수직합산(같은 Q에서 WTP 합산)↔사유재=수평합산',
    difficulty: 1, isMostFrequent: false,
  },

  '2023_재정학_03': {
    topicId: 'micro_elasticity',
    relatedQuestionIds: ['2022_재정학_01', '2024_재정학_02'],
    keywords: ['탄력성', '총수입', '단위탄력적'],
    coreStatement: '탄력적(>1)+가격↓→TR↑. 비탄력적(<1)+가격↓→TR↓.',
    questionText: '가격이 10% 하락했을 때 수요량이 15% 증가했다면, 탄력성(절댓값)과 가격 하락 후 총수입 변화로 옳은 것은?',
    choices: ['탄력성 0.67, 총수입 감소','탄력성 0.67, 총수입 증가','탄력성 1.50, 총수입 감소','탄력성 1.50, 총수입 증가','탄력성 1.50, 총수입 불변'],
    answer: 4,
    basicExplanation: '|Ed|=15%/10%=1.5(탄력적). 탄력적+가격↓→TR↑.',
    detailedExplanation: '계산: |Ed|=|%ΔQ/%ΔP|=15/10=1.5\nTR=P×Q. 가격10%↓, 수량15%↑→ΔTR≈+5%↑\n탄력적→가격↓ 수량효과 우세→TR↑',
    difficulty: 1, isMostFrequent: true,
  },

  '2023_재정학_07': {
    topicId: 'externality',
    relatedQuestionIds: ['2022_재정학_05', '2025_재정학_06'],
    keywords: ['코즈정리', '재산권', '거래비용'],
    coreStatement: '코즈정리: 재산권 명확+거래비용=0이면 협상으로 사회적 최적 달성.',
    questionText: '코즈 정리(Coase Theorem)에 관한 설명으로 옳은 것은?',
    choices: [
      '거래비용이 존재해도 항상 사회적 최적 달성이 가능하다',
      '재산권이 누구에게 귀속되어 있든 협상을 통해 효율적 결과를 달성할 수 있다',
      '이해관계자가 많을수록 협상에 의한 해결이 용이해진다',
      '코즈 정리는 소득 분배에도 영향을 미치지 않는다',
      '공공재 문제에도 코즈 정리를 동일하게 적용할 수 있다',
    ],
    answer: 2,
    basicExplanation: '재산권 귀속과 무관하게(누가 갖든) 협상→사회적 최적. 단 거래비용=0 조건.',
    detailedExplanation: '【코즈 정리 정확한 내용】\n조건: ①재산권 명확 ②거래비용=0\n결과: 누구에게 재산권 부여해도 협상→Q* 달성\n주의: 소득분배는 귀속에 따라 달라짐 (오답④)\n한계: 다수 이해관계자→협상 어려움 (오답③)',
    difficulty: 2, isMostFrequent: false,
  },

  '2023_재정학_11': {
    topicId: 'tax_incidence',
    relatedQuestionIds: ['2022_재정학_12', '2024_재정학_10'],
    keywords: ['초과부담', '사중손실', '탄력성'],
    coreStatement: '초과부담(DWL)=½×ΔQ×t. 세율 2배→DWL 4배. 탄력성↑→DWL↑.',
    questionText: '단위당 조세(t) 부과 시 초과부담(excess burden)에 관한 설명으로 옳지 않은 것은?',
    choices: [
      '수요와 공급이 모두 비탄력적일수록 초과부담이 작아진다',
      '세율(t)이 두 배가 되면 초과부담은 네 배가 된다',
      '완전비탄력적 수요하에서는 초과부담이 발생하지 않는다',
      '초과부담은 조세가 거래량의 변화를 유발하기 때문에 발생한다',
      '초과부담이 작을수록 재정수입은 항상 증가한다',
    ],
    answer: 5,
    basicExplanation: 'DWL↓과 세수↑는 무관. 래퍼곡선: 세율↑→세수↑↓ 복잡한 관계.',
    detailedExplanation:
      '【DWL 공식】DWL=½×(εd×εs)/(εs+|εd|)×(t/P)²×PQ → t²에 비례(②정답)\n완전비탄력: ΔQ=0→DWL=0(③정답)\n오답⑤: 래퍼곡선→세율너무↑→세수↓',
    difficulty: 3, isMostFrequent: false,
  },

  '2023_재정학_18': {
    topicId: 'macro_is_lm',
    relatedQuestionIds: ['2024_재정학_18', '2025_재정학_20'],
    keywords: ['IS곡선', 'LM곡선', '재정정책', '구축효과'],
    coreStatement: '구축효과: 재정지출↑→r↑→민간투자↓. LM수직→완전구축.',
    questionText: 'IS-LM 모형에서 재정지출 증가의 효과에 관한 설명으로 옳은 것은? (물가 고정)',
    choices: [
      'IS 곡선이 오른쪽으로 이동하고, 국민소득과 이자율이 모두 증가한다',
      'LM 곡선이 오른쪽으로 이동하고, 국민소득이 증가한다',
      'LM 곡선이 수직이면 재정정책의 효과가 가장 크다',
      '이자율 상승으로 민간투자가 늘어나는 구축효과가 발생한다',
      'IS 곡선이 오른쪽으로 이동하지만, 국민소득은 변하지 않는다',
    ],
    answer: 1,
    basicExplanation: 'G↑→IS우이동→균형에서 r↑,Y↑. (LM수직이면 Y불변, LM수평이면 완전증가)',
    detailedExplanation:
      '【재정정책】G↑→IS우이동\nLM수직: r↑↑,Y불변=완전구축(오답③)\nLM수평(유동성함정): r불변,Y↑↑=최대효과\nLM우상향: r↑,Y일부↑=부분구축\n오답④: 구축효과→민간투자 감소(↑아님)',
    difficulty: 2, isMostFrequent: true,
  },

  '2024_재정학_02': {
    topicId: 'micro_elasticity',
    relatedQuestionIds: ['2022_재정학_01', '2023_재정학_03', '2025_재정학_01'],
    keywords: ['교차탄력성', '대체재', '보완재'],
    coreStatement: '교차탄력성>0: 대체재. <0: 보완재. =0: 독립재.',
    questionText: 'X가격 5%↑ 시 Y수요 10%↑. 두 재화 관계와 교차탄력성은?',
    choices: ['보완재, -2','보완재, +2','대체재, +2','대체재, -2','독립재, 0'],
    answer: 3,
    basicExplanation: 'εxy=10%/5%=+2>0→대체재.',
    detailedExplanation: '교차탄력성=εxy=%ΔQy/%ΔPx=10/5=+2\n양수→대체재(X비싸지면Y로 전환)\n음수→보완재(X비싸지면 함께 쓰는Y도 덜 씀)',
    difficulty: 1, isMostFrequent: true,
  },

  '2024_재정학_10': {
    topicId: 'tax_incidence',
    relatedQuestionIds: ['2022_재정학_12', '2025_재정학_12'],
    keywords: ['완전탄력적', '조세귀착', '소비자전가'],
    coreStatement: '공급 완전탄력적: 세금 100% 소비자 부담. 공급곡선 수평.',
    questionText: '완전경쟁시장에서 공급이 완전탄력적(perfectly elastic)일 때 단위당 세금 부과 결과로 옳은 것은?',
    choices: ['소비자·생산자 동등 부담','생산자 100% 부담','소비자가격 불변, 생산자가격만 하락','소비자가격이 세금만큼 상승→소비자 전부 부담','사중손실 없음'],
    answer: 4,
    basicExplanation: 'εs=∞: 소비자부담=∞/(∞+|εd|)=1(100%). 소비자가격 t만큼 상승.',
    detailedExplanation:
      '공급완전탄력=수평공급곡선\n세금→공급곡선 t만큼 위 이동\n소비자가격 t상승, 생산자가격 불변\nεs=∞→소비자 100%부담\n사중손실: 수요탄력적이면 발생(오답⑤)',
    difficulty: 2, isMostFrequent: true,
  },

  '2024_재정학_17': {
    topicId: 'public_goods',
    relatedQuestionIds: ['2022_재정학_18', '2023_재정학_18'],
    keywords: ['린달균형', '수직합산', '무임승차'],
    coreStatement: '공공재 사회적 수요=개인 수요 수직합산. 린달균형: 비용분담=한계편익 비율.',
    questionText: '공공재의 최적 공급에 관한 설명으로 옳지 않은 것은?',
    choices: [
      '공공재의 사회적 수요는 개인 수요곡선을 수직으로 합산하여 도출한다',
      '린달균형에서 각 소비자는 자신의 한계편익에 비례하여 비용을 분담한다',
      '무임승차 문제로 인해 시장에서는 공공재가 사회적 최적보다 과소 공급된다',
      '린달균형은 각 소비자의 선호를 자발적으로 표출하게 하는 현실적 방법이다',
      '사적재와 달리 공공재는 같은 수량에서 각자의 지불의사를 합산한다',
    ],
    answer: 4,
    basicExplanation: '린달균형은 이론적 효율성은 있으나 선호 표출 유인이 없어 현실 적용이 어렵다. 오답④.',
    detailedExplanation: '린달균형: 이론적으로 효율적이나\n각자 실제 선호 숨기고 무임승차 유인→현실 적용 어려움\n오답④: "현실적 방법"이 오류',
    difficulty: 2, isMostFrequent: false,
  },

  '2024_재정학_18': {
    topicId: 'macro_is_lm',
    relatedQuestionIds: ['2023_재정학_18', '2025_재정학_20'],
    keywords: ['통화정책', 'LM이동', '이자율'],
    coreStatement: '통화공급↑→LM 우측 이동→r↓,Y↑. 유동성함정→통화정책 무효.',
    questionText: 'IS-LM 모형에서 중앙은행이 통화공급을 증가시킬 때 나타나는 결과로 옳은 것은?',
    choices: [
      'IS 곡선이 오른쪽으로 이동하여 국민소득이 증가한다',
      'LM 곡선이 오른쪽으로 이동하여 이자율이 하락하고 국민소득이 증가한다',
      'LM 곡선이 수직이면 통화정책의 효과가 없다',
      '유동성함정 상황에서는 통화정책의 효과가 가장 크다',
      '이자율이 상승하여 투자가 증가한다',
    ],
    answer: 2,
    basicExplanation: '통화↑→LM우이동→균형에서 r↓,Y↑.',
    detailedExplanation:
      '통화정책: M↑→LM우이동\nLM수직: r↓↓,Y↑↑=최대효과(오답③: 수직이면 효과 최대)\n유동성함정(LM수평): r고정,LM이동해도Y불변=통화정책 무효(오답④)\n오답⑤: r↓(하락)→투자↑',
    difficulty: 2, isMostFrequent: false,
  },

  '2025_재정학_01': {
    topicId: 'micro_elasticity',
    relatedQuestionIds: ['2022_재정학_01', '2023_재정학_03', '2024_재정학_02'],
    keywords: ['소득탄력성', '정상재', '열등재', '사치재'],
    coreStatement: 'εm>1: 사치재. 0<εm<1: 정상재(필수재). εm<0: 열등재.',
    questionText: '소득탄력성(income elasticity)에 관한 설명으로 옳지 않은 것은?',
    choices: [
      '소득탄력성이 양(+)이면 정상재이다',
      '소득탄력성이 1보다 크면 사치재(luxury good)로 분류된다',
      '소득탄력성이 음(-)이면 열등재이다',
      '모든 재화의 소득탄력성을 소비지출 비중으로 가중평균하면 1이 된다',
      '소득이 증가할 때 수요가 감소하는 재화의 소득탄력성은 0보다 크다',
    ],
    answer: 5,
    basicExplanation: '소득↑→수요↓이면 열등재→소득탄력성<0. 오답⑤.',
    detailedExplanation:
      'εm=%ΔQ/%ΔM\n>1: 사치재, 0~1: 필수재, <0: 열등재\n오답⑤: 소득↑수요↓→열등재→εm<0(0보다 작음)',
    difficulty: 2, isMostFrequent: false,
  },

  '2025_재정학_06': {
    topicId: 'externality',
    relatedQuestionIds: ['2022_재정학_05', '2023_재정학_07'],
    keywords: ['피구세', '보조금', '긍정적 외부성'],
    coreStatement: '긍정적 외부성: 과소생산. 피구 보조금(=MEB)으로 사회적 최적 달성.',
    questionText: '긍정적 외부성(positive externality)이 존재하는 시장에 관한 설명으로 옳은 것은?',
    choices: [
      '사회적 한계편익(SMB)이 사적 한계편익(PMB)보다 작다',
      '시장 균형 생산량이 사회적 최적 생산량보다 많다',
      '피구 보조금을 지급하면 과소생산 문제를 해결할 수 있다',
      '교육·연구 개발에는 부정적 외부성이 발생한다',
      '긍정적 외부성은 시장 실패를 초래하지 않는다',
    ],
    answer: 3,
    basicExplanation: '긍정적 외부성: SMB=PMB+MEB>PMB. 시장→과소생산. 피구보조금=MEB로 교정.',
    detailedExplanation:
      '긍정적 외부성: SMB=PMB+MEB>PMB\n시장: P=PMB→Qm<Q*(과소생산)\n피구보조금=MEB→PMB+보조=SMB→Q* 달성\n예: 교육, R&D, 예방접종',
    difficulty: 1, isMostFrequent: false,
  },

  '2025_재정학_12': {
    topicId: 'tax_incidence',
    relatedQuestionIds: ['2022_재정학_12', '2024_재정학_10'],
    keywords: ['완전비탄력적 수요', '조세귀착', '사중손실 없음'],
    coreStatement: '수요 완전비탄력적: 소비자 100% 부담. ΔQ=0→사중손실 없음.',
    questionText: '수요가 완전비탄력적이고 공급이 우상향할 때 종량세를 생산자에게 부과하는 경우로 옳은 것은?',
    choices: ['소비자가격↑t, 생산자가격 불변','소비자가격 불변, 생산자가격↓t','소비자·생산자 동등부담','거래량↓→사중손실 발생','소비자가격·생산자가격 모두 불변'],
    answer: 1,
    basicExplanation: 'εd=0→소비자부담=εs/(εs+0)=1(100%). Pc↑t, Pp불변, Q불변→DWL=0.',
    detailedExplanation:
      '수요수직=어떤가격에도 Q불변\n→소비자 t전액 부담 불가피\n소비자=εs/(εs+0)=1(100%)\nΔQ=0→DWL=½×0×t=0',
    difficulty: 2, isMostFrequent: true,
  },

  '2025_재정학_20': {
    topicId: 'macro_is_lm',
    relatedQuestionIds: ['2023_재정학_18', '2024_재정학_18'],
    keywords: ['유동성함정', '재정정책', '통화정책 무효'],
    coreStatement: '유동성함정(LM수평): 재정정책 최대효과, 통화정책 무효.',
    questionText: '유동성함정(liquidity trap) 상황에서 재정정책과 통화정책의 효과에 관한 설명으로 옳은 것은?',
    choices: [
      '재정정책과 통화정책 모두 국민소득에 영향을 미치지 못한다',
      '재정정책은 효과가 없고, 통화정책만 효과적이다',
      '통화정책은 효과가 없고, 재정정책은 국민소득을 증가시킨다',
      '재정정책을 시행하면 구축효과가 발생하여 효과가 감소한다',
      '통화공급을 증가시키면 이자율이 하락하여 투자가 증가한다',
    ],
    answer: 3,
    basicExplanation: '유동성함정: LM수평. 통화↑→LM이동해도 균형 불변(r고정). IS↑→r불변,Y↑↑(완전승수)',
    detailedExplanation:
      '유동성함정: 이자율이 너무 낮아 채권 보유 기피→화폐수요 완전탄력=LM수평\n통화정책: M↑→LM이동→but균형점 변화없음=무효\n재정정책: G↑→IS우이동→구축효과없음(r고정)→완전승수효과',
    difficulty: 2, isMostFrequent: false,
  },

  '2026_재정학_09': {
    topicId: 'tax_incidence',
    relatedQuestionIds: ['2022_재정학_12', '2024_재정학_10', '2025_재정학_12'],
    keywords: ['하버거', '법인세', '장기귀착'],
    coreStatement: '하버거모형: 완전경쟁+요소이동 자유. 법인세→장기에 자본 부문 간 이동→세후수익률 균등.',
    questionText: '하버거(Harberger) 모형에서 법인세의 귀착에 관한 설명으로 옳은 것은?',
    choices: [
      '단기에는 노동자가 전부 부담한다',
      '장기에는 자본이 전부 부담한다',
      '법인세가 높아지면 법인부문 자본수익률 하락→비법인부문으로 자본 이동하지 않는다',
      '완전경쟁 및 요소이동 자유 가정에서, 장기에 모든 자본의 세후수익률이 같아진다',
      '개방경제에서도 폐쇄경제와 동일하게 자본이 귀착을 전부 부담한다',
    ],
    answer: 4,
    basicExplanation: '장기: 자본 이동→법인·비법인 세후수익률 균등화. 폐쇄경제에서 자본 전부 부담.',
    detailedExplanation:
      '하버거모형 가정: 완전경쟁+요소완전이동\n법인세→법인부문 r↓→자본이 비법인부문으로 이동\n→양 부문 세후수익률 균등화(④)\n폐쇄경제: 자본 전체 부담\n개방경제: 자본 해외유출→노동에도 귀착 가능(오답⑤)',
    difficulty: 3, isMostFrequent: false,
  },
}

// ── 연도별 40문제 주제 배분 ─────────────────────────────────────────
// 재정학 세무사 1차 전형적 분포 기반 (번호 순서는 실제 시험과 다를 수 있음)
const YEAR_DIST: Record<number, string[]> = {
  2022: [
    'micro_elasticity',     // 01
    'micro_demand_supply',  // 02
    'micro_demand_supply',  // 03
    'micro_consumer',       // 04
    'externality',          // 05
    'micro_consumer',       // 06
    'micro_consumer',       // 07
    'micro_producer',       // 08
    'micro_producer',       // 09
    'micro_perfect_comp',   // 10
    'micro_perfect_comp',   // 11
    'tax_incidence',        // 12
    'micro_monopoly',       // 13
    'micro_monopoly',       // 14
    'micro_game_theory',    // 15
    'micro_game_theory',    // 16
    'micro_welfare',        // 17
    'public_goods',         // 18
    'public_goods',         // 19
    'externality',          // 20
    'tax_theory',           // 21
    'tax_theory',           // 22
    'tax_incidence',        // 23
    'tax_incidence',        // 24
    'optimal_tax',          // 25
    'public_expenditure',   // 26
    'fiscal_federalism',    // 27
    'macro_national_income',// 28
    'macro_national_income',// 29
    'macro_is_lm',          // 30
    'macro_is_lm',          // 31
    'macro_ad_as',          // 32
    'macro_ad_as',          // 33
    'macro_consumption',    // 34
    'macro_consumption',    // 35
    'macro_money',          // 36
    'macro_money',          // 37
    'micro_elasticity',     // 38
    'tax_theory',           // 39
    'micro_welfare',        // 40
  ],
  2023: [
    'micro_demand_supply',  // 01
    'micro_demand_supply',  // 02
    'micro_elasticity',     // 03
    'micro_elasticity',     // 04
    'micro_consumer',       // 05
    'micro_consumer',       // 06
    'externality',          // 07
    'micro_producer',       // 08
    'micro_producer',       // 09
    'micro_perfect_comp',   // 10
    'tax_incidence',        // 11
    'micro_perfect_comp',   // 12
    'micro_monopoly',       // 13
    'micro_monopoly',       // 14
    'micro_game_theory',    // 15
    'micro_welfare',        // 16
    'micro_welfare',        // 17
    'macro_is_lm',          // 18
    'public_goods',         // 19
    'public_goods',         // 20
    'externality',          // 21
    'tax_theory',           // 22
    'tax_theory',           // 23
    'tax_incidence',        // 24
    'tax_incidence',        // 25
    'optimal_tax',          // 26
    'public_expenditure',   // 27
    'fiscal_federalism',    // 28
    'macro_national_income',// 29
    'macro_national_income',// 30
    'macro_is_lm',          // 31
    'macro_ad_as',          // 32
    'macro_ad_as',          // 33
    'macro_consumption',    // 34
    'macro_consumption',    // 35
    'macro_money',          // 36
    'macro_money',          // 37
    'micro_consumer',       // 38
    'tax_theory',           // 39
    'micro_game_theory',    // 40
  ],
  2024: [
    'micro_demand_supply',  // 01
    'micro_elasticity',     // 02
    'micro_demand_supply',  // 03
    'micro_consumer',       // 04
    'micro_consumer',       // 05
    'micro_consumer',       // 06
    'micro_producer',       // 07
    'micro_producer',       // 08
    'micro_perfect_comp',   // 09
    'tax_incidence',        // 10
    'micro_perfect_comp',   // 11
    'micro_monopoly',       // 12
    'micro_monopoly',       // 13
    'micro_game_theory',    // 14
    'micro_game_theory',    // 15
    'micro_welfare',        // 16
    'public_goods',         // 17
    'macro_is_lm',          // 18
    'public_goods',         // 19
    'externality',          // 20
    'externality',          // 21
    'tax_theory',           // 22
    'tax_theory',           // 23
    'tax_incidence',        // 24
    'tax_incidence',        // 25
    'optimal_tax',          // 26
    'public_expenditure',   // 27
    'fiscal_federalism',    // 28
    'macro_national_income',// 29
    'macro_national_income',// 30
    'macro_is_lm',          // 31
    'macro_ad_as',          // 32
    'macro_ad_as',          // 33
    'macro_consumption',    // 34
    'macro_consumption',    // 35
    'macro_money',          // 36
    'macro_money',          // 37
    'micro_elasticity',     // 38
    'micro_welfare',        // 39
    'tax_theory',           // 40
  ],
  2025: [
    'micro_elasticity',     // 01
    'micro_demand_supply',  // 02
    'micro_demand_supply',  // 03
    'micro_consumer',       // 04
    'micro_consumer',       // 05
    'externality',          // 06
    'micro_producer',       // 07
    'micro_producer',       // 08
    'micro_perfect_comp',   // 09
    'micro_perfect_comp',   // 10
    'micro_monopoly',       // 11
    'tax_incidence',        // 12
    'micro_monopoly',       // 13
    'micro_game_theory',    // 14
    'micro_game_theory',    // 15
    'micro_welfare',        // 16
    'micro_welfare',        // 17
    'public_goods',         // 18
    'public_goods',         // 19
    'externality',          // 20
    'macro_is_lm',          // 20 → was macro_is_lm
    'tax_theory',           // 21
    'tax_theory',           // 22
    'tax_incidence',        // 23
    'tax_incidence',        // 24
    'optimal_tax',          // 25
    'public_expenditure',   // 26
    'fiscal_federalism',    // 27
    'macro_national_income',// 28
    'macro_national_income',// 29
    'macro_is_lm',          // 30
    'macro_ad_as',          // 31
    'macro_ad_as',          // 32
    'macro_consumption',    // 33
    'macro_consumption',    // 34
    'macro_money',          // 35
    'macro_money',          // 36
    'micro_elasticity',     // 37
    'tax_theory',           // 38
    'micro_game_theory',    // 39
    'micro_consumer',       // 40
  ],
  2026: [
    'micro_demand_supply',  // 01
    'micro_demand_supply',  // 02
    'micro_elasticity',     // 03
    'micro_elasticity',     // 04
    'micro_consumer',       // 05
    'micro_consumer',       // 06
    'micro_producer',       // 07
    'micro_producer',       // 08
    'tax_incidence',        // 09
    'micro_perfect_comp',   // 10
    'micro_perfect_comp',   // 11
    'micro_monopoly',       // 12
    'micro_monopoly',       // 13
    'micro_game_theory',    // 14
    'micro_game_theory',    // 15
    'micro_welfare',        // 16
    'micro_welfare',        // 17
    'public_goods',         // 18
    'public_goods',         // 19
    'externality',          // 20
    'externality',          // 21
    'tax_theory',           // 22
    'tax_theory',           // 23
    'tax_incidence',        // 24
    'tax_incidence',        // 25
    'optimal_tax',          // 26
    'public_expenditure',   // 27
    'fiscal_federalism',    // 28
    'macro_national_income',// 29
    'macro_national_income',// 30
    'macro_is_lm',          // 31
    'macro_is_lm',          // 32
    'macro_ad_as',          // 33
    'macro_ad_as',          // 34
    'macro_consumption',    // 35
    'macro_consumption',    // 36
    'macro_money',          // 37
    'macro_money',          // 38
    'micro_elasticity',     // 39
    'tax_theory',           // 40
  ],
}

// 스텁 문제 생성 (PDF에서 확인 필요한 문제)
function makeStub(year: number, num: number, topicId: string): Question {
  const topic = topicMap.get(topicId)
  const id = `${year}_재정학_${String(num).padStart(2, '0')}`
  return {
    id,
    year,
    examPaper: 1,
    subject: '재정학',
    number: num,
    topicId,
    relatedQuestionIds: [],
    keywords: topic?.keywords ?? [],
    coreStatement: topic?.coreText ?? '',
    questionText: `[PDF 입력 필요] ${topic?.section ?? topicId}에 관한 설명으로 옳은 것은?`,
    choices: ['① (PDF 확인)', '② (PDF 확인)', '③ (PDF 확인)', '④ (PDF 확인)', '⑤ (PDF 확인)'],
    answer: 1,
    basicExplanation: topic?.coreText ?? '',
    detailedExplanation: topic?.detailedContent ?? '',
    difficulty: 2,
    isMostFrequent: false,
  }
}

// 전체 200문제 생성 (상세 문제 우선 적용)
function buildAllQuestions(): Question[] {
  const result: Question[] = []
  for (const [yearStr, dist] of Object.entries(YEAR_DIST)) {
    const year = Number(yearStr)
    const topics = dist.slice(0, 40)  // 40문제 보장
    for (let i = 0; i < 40; i++) {
      const num = i + 1
      const id = `${year}_재정학_${String(num).padStart(2, '0')}`
      const topicId = topics[i] ?? 'micro_elasticity'
      const detail = DETAILED[id]
      if (detail) {
        result.push({ id, year, examPaper: 1, subject: '재정학', number: num, ...detail } as Question)
      } else {
        result.push(makeStub(year, num, topicId))
      }
    }
  }
  return result
}

export const jaejeonghakQuestions: Question[] = buildAllQuestions()
