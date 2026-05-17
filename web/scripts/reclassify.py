"""
재정학 교재 목차 기반 200문제 주제 재분류 (v2)

핵심 수정: 특수 주제 키워드에 높은 가중치 부여, micro_basic은 최후 fallback
"""
import json, re
from pathlib import Path
from collections import Counter

# ── 재정학 교재 목차 → 태그 ──────────────────────────────────
# priority: 높을수록 우선 매칭 (특수 주제가 일반 주제보다 높아야 함)
TAXONOMY = {
    # ── 제1편: 미시경제 기초 (priority 낮음 = fallback) ──
    "micro_basic": {
        "name": "소비자·생산자이론",
        "chapter": "1편 미시경제 기초",
        "priority": 1,
        "keywords": ["효용극대", "무차별곡선", "예산제약", "한계효용",
                     "기펜재", "엥겔", "교차탄력",
                     "생산함수", "한계생산", "수확체감", "등량곡선", "MRTS",
                     "장기비용", "단기비용", "총비용", "고정비용", "가변비용",
                     "규모수익"],
    },
    "market_structure": {
        "name": "시장구조",
        "chapter": "1편 시장구조",
        "priority": 5,
        "keywords": ["완전경쟁.*장기균형", "완전경쟁시장.*균형",
                     "과점", "카르텔", "쿠르노", "베르트랑",
                     "게임이론", "내쉬균형", "죄수딜레마", "우월전략",
                     "역진귀납", "순차게임", "부분게임", "혼합전략",
                     "보수행렬", "지배전략"],
    },
    # ── 제2편: 후생경제학 ──
    "welfare": {
        "name": "후생경제학",
        "chapter": "2편 후생경제학",
        "priority": 5,
        "keywords": ["파레토", "사회후생함수", "효용가능경계",
                     "계약곡선", "에지워스", "순수교환경제",
                     "후생경제학", "기본정리", "제1정리", "제2정리",
                     "보상원리", "칼도", "쉬토프스키",
                     "공리주의", "벤담", "롤스.*최소극대", "롤스.*정의",
                     "노직", "분배.*정의", "최적분배",
                     "유기체적", "기계론적",
                     "자원배분.*효율"],
    },
    # ── 제3편: 공공지출이론 ──
    "public_goods": {
        "name": "공공재",
        "chapter": "3편 공공재",
        "priority": 8,
        "keywords": ["공공재", "비배제", "비경합", "무임승차", "순수공공재",
                     "사무엘슨.*조건", "린달", "수직합산", "클라크세",
                     "클럽재", "공유자원"],
    },
    "externality": {
        "name": "외부성",
        "chapter": "3편 외부성",
        "priority": 8,
        "keywords": ["외부성", "외부효과", "피구세", "피구.*보조금",
                     "코즈.*정리", "코즈.*정리", "재산권.*거래비용",
                     "배출권", "오염.*배출", "저감비용",
                     "사회적.*비용.*사적", "외부.*편익",
                     "한계피해", "한계.*저감"],
    },
    "public_choice": {
        "name": "공공선택이론",
        "chapter": "3편 공공선택",
        "priority": 8,
        "keywords": ["투표.*제도", "과반수.*투표", "중위투표자", "콩도르세", "보르다",
                     "애로.*불가능", "단봉선호", "투표.*역설",
                     "니스카넨", "관료.*예산", "예산극대화",
                     "렌트추구", "로그롤링", "공공선택"],
    },
    # ── 제4편: 조세이론 ──
    "tax_principle": {
        "name": "조세의 기초·원칙",
        "chapter": "4편 조세 기초",
        "priority": 6,
        "keywords": ["조세.*원칙", "공평.*과세", "수평적.*공평", "수직적.*공평",
                     "편익원칙", "능력원칙", "희생.*원칙",
                     "아담.*스미스.*조세", "확실성.*편의",
                     "직접세.*간접세", "물세.*인세",
                     "바람직한.*조세", "조세.*조건"],
    },
    "tax_incidence": {
        "name": "조세의 귀착",
        "chapter": "4편 조세 귀착",
        "priority": 7,
        "keywords": ["조세.*귀착", "조세.*전가", "전방전가", "후방전가",
                     "하버거.*모형", "하버거.*귀착", "일반균형.*귀착",
                     "소비자.*부담.*생산자", "생산자.*부담.*소비자",
                     "물품세.*귀착", "물품세.*부과.*부담",
                     "탄력성.*부담.*비율",
                     "법정.*귀착", "경제적.*귀착"],
    },
    "excess_burden": {
        "name": "초과부담·최적과세",
        "chapter": "4편 초과부담·최적",
        "priority": 8,
        "keywords": ["초과부담", "사중손실",
                     "램지.*규칙", "역탄력성.*규칙", "코렛.*헤이그",
                     "최적.*과세", "최적.*소득세", "미를리스",
                     "보상수요.*초과", "DWL"],
    },
    "income_tax": {
        "name": "소득세",
        "chapter": "4편 소득세",
        "priority": 7,
        "keywords": ["소득세.*설명", "소득세.*제도", "개인소득세",
                     "누진세", "한계세율.*평균세율", "세수함수", "세수탄력성",
                     "근로소득세.*노동", "비례소득세.*노동",
                     "이자소득세", "시점간.*소비.*이자",
                     "탈세.*모형", "알링햄", "샌드모",
                     "소득공제", "세액공제", "감면.*제도",
                     "인플레이션.*세금", "인플레이션.*과세", "브래킷",
                     "포괄적.*소득", "헤이그.*사이먼스",
                     "합산과세", "분리과세", "부부.*과세",
                     "조세지출.*사례", "조세지출.*설명"],
    },
    "corporate_tax": {
        "name": "법인세",
        "chapter": "4편 법인세",
        "priority": 8,
        "keywords": ["법인세", "이중과세.*배당",
                     "모딜리아니.*밀러", "배당.*무의미", "배당.*정책",
                     "경제적.*이윤.*과세", "경제적.*이윤.*법인",
                     "사내유보", "감가상각.*법인",
                     "신고전파.*투자", "조겐슨", "사용자비용",
                     "투자.*억제", "투자세액공제", "가속상각", "준비금제도",
                     "법인세.*소득세.*통합", "자본.*이득.*방식"],
    },
    "consumption_tax": {
        "name": "소비세·부가가치세",
        "chapter": "4편 소비세",
        "priority": 8,
        "keywords": ["부가가치세", "소비형.*부가", "소비세.*부가",
                     "순소득형", "총소득형", "전단계세액공제",
                     "영세율", "면세.*부가"],
    },
    "tax_reform": {
        "name": "조세제도 개혁",
        "chapter": "4편 조세 개혁",
        "priority": 6,
        "keywords": ["조세제도.*개혁", "조세.*개혁.*동향",
                     "법인세.*통합.*이루", "지방소비세.*지방소득세"],
    },
    # ── 제5편: 소득분배·사회보장 ──
    "income_distribution": {
        "name": "소득분배",
        "chapter": "5편 소득분배",
        "priority": 7,
        "keywords": ["로렌츠", "지니계수", "앳킨슨.*지수", "달톤.*지수",
                     "5분위", "십분위", "소득불평등", "불평등.*지수", "불평등도",
                     "소득분배.*상태", "소득분배.*이론",
                     "균등분배대등", "EDE",
                     "소득재분배.*정책"],
    },
    "social_security": {
        "name": "사회보장",
        "chapter": "5편 사회보장",
        "priority": 9,
        "keywords": ["사회보험", "국민연금", "건강보험", "고용보험", "산재보험",
                     "공적연금", "부과방식.*연금", "적립방식.*연금", "연금.*제도",
                     "근로장려.*세제", "근로장려.*설명", "EITC", "근로장려금",
                     "부의.*소득세", "NIT", "negative.*income",
                     "공공부조", "기초생활", "사회보장.*제도",
                     "재분배.*정책.*설명"],
    },
    # ── 제6편: 재정정책 ──
    "fiscal_policy": {
        "name": "재정정책·거시경제",
        "chapter": "6편 재정정책",
        "priority": 6,
        "keywords": ["IS.*LM", "재정정책.*효과", "통화정책.*효과",
                     "구축효과", "유동성함정", "승수.*효과",
                     "AD.*AS", "총수요.*총공급", "스태그플레이션",
                     "먼델.*플레밍", "개방경제.*정책",
                     "국채.*발행", "재정적자", "리카도.*동등",
                     "GDP.*GNI", "국민소득.*계정",
                     "항상소득.*가설", "생애주기.*가설", "소비.*함수.*이론",
                     "화폐수요.*이론", "통화승수", "본원통화", "공개시장",
                     "솔로우", "정상상태", "경제성장.*모형", "황금률",
                     "감세.*정책.*효과", "재정.*이론"],
    },
    # ── 제7편: 지방재정 ──
    "local_finance": {
        "name": "지방재정",
        "chapter": "7편 지방재정",
        "priority": 8,
        "keywords": ["티부", "발로.*투표", "오츠", "분권화.*정리",
                     "지방교부세", "보통교부세", "특별교부세", "부동산교부세",
                     "지방재정", "지방분권",
                     "국고보조금", "교부금.*유형",
                     "정액보조금", "정률보조금", "대응보조금"],
    },
    # ── 제8편: 예산·정부지출 ──
    "budget": {
        "name": "예산제도·비용편익",
        "chapter": "8편 예산·CBA",
        "priority": 8,
        "keywords": ["예산제도", "품목별.*예산", "성과주의.*예산", "PPBS", "영기준.*예산",
                     "비용.*편익.*분석", "NPV", "IRR", "순현재가치", "내부수익률",
                     "할인율.*사업", "사회적.*할인율",
                     "조세지출.*정당", "조세지출.*예산"],
    },
    "govt_spending": {
        "name": "정부지출이론·공공요금",
        "chapter": "8편 정부지출",
        "priority": 8,
        "keywords": ["바그너.*법칙", "바그너.*경비",
                     "피콕.*와이즈만", "전위효과",
                     "보몰.*비용병", "리바이어던", "재정착각",
                     "정부지출.*증가.*원인", "정부지출.*팽창",
                     "공공요금", "이부가격", "램지.*가격", "최대부하.*가격",
                     "한계비용.*가격.*설정", "평균비용.*가격.*설정",
                     "자연독점.*공기업", "자연독점.*규제", "자연독점.*요금"],
    },
}


def classify(question_text: str, choices: list[str], old_topic: str, keywords_field: list[str]) -> str:
    """문제 텍스트+선지+기존키워드로 최적 주제 분류 (priority 반영)"""
    full = question_text + " " + " ".join(choices) + " " + " ".join(keywords_field)
    full = full.replace(" ", "")

    scores: dict[str, float] = {}
    for tid, info in TAXONOMY.items():
        score = 0.0
        priority = info["priority"]
        for kw in info["keywords"]:
            pattern = kw.replace(" ", "")
            if ".*" in pattern:
                if re.search(pattern, full):
                    score += 3 * priority
            elif pattern in full:
                score += 2 * priority
        scores[tid] = score

    best = max(scores, key=scores.get)
    if scores[best] == 0:
        return old_topic

    # micro_basic은 다른 주제가 점수 있으면 양보
    if best == "micro_basic":
        second_scores = {k: v for k, v in scores.items() if k != "micro_basic" and v > 0}
        if second_scores:
            second_best = max(second_scores, key=second_scores.get)
            # micro_basic 점수의 50% 이상이면 특수주제 우선
            if second_scores[second_best] >= scores["micro_basic"] * 0.4:
                return second_best

    return best


def main():
    enriched_dir = Path("d:/Coding/semusa/web/data/enriched")
    changes = []

    for y in [2022, 2023, 2024, 2025, 2026]:
        fpath = enriched_dir / f"enriched_{y}_재정학.json"
        data = json.loads(fpath.read_text(encoding="utf-8"))

        for q in data["questions"]:
            old = q["topicId"]
            new = classify(
                q.get("questionText", ""),
                q.get("choices", []),
                old,
                q.get("keywords", []),
            )
            if old != new:
                changes.append((y, q["number"], old, new, q.get("questionText", "")[:50]))
            q["topicId"] = new

        fpath.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    # ── 변경 리포트 ──
    print(f"=== 재분류: {len(changes)}건 변경 ===\n")
    for y, num, old, new, txt in changes:
        print(f"{y} Q{num:2d}: {old:24s} → {new:24s} | {txt}")

    # ── 연도별 주제 분포 테이블 ──
    print("\n=== 연도별 주제 분포 ===")
    all_topics_set = set()
    year_data = {}
    for y in [2022, 2023, 2024, 2025, 2026]:
        fpath = enriched_dir / f"enriched_{y}_재정학.json"
        data = json.loads(fpath.read_text(encoding="utf-8"))
        topics = Counter(q["topicId"] for q in data["questions"])
        year_data[y] = topics
        all_topics_set |= set(topics.keys())

    ordered = [t for t in TAXONOMY if t in all_topics_set]
    for extra in sorted(all_topics_set - set(ordered)):
        ordered.append(extra)

    header = f"{'목차':14s} {'태그':22s}" + "".join(f" {y}" for y in [2022,2023,2024,2025,2026]) + "  합계"
    print(header)
    print("-" * len(header))
    grand = 0
    for t in ordered:
        info = TAXONOMY.get(t, {})
        row = f"{info.get('name', t):12s} {t:22s}"
        total = 0
        for y in [2022, 2023, 2024, 2025, 2026]:
            c = year_data[y].get(t, 0)
            total += c
            row += f"  {c:3d}" if c else "    -"
        row += f"  {total:3d}"
        grand += total
        print(row)
    print(f"\n주제 수: {len(all_topics_set)}개, 총 문제: {grand}")


if __name__ == "__main__":
    main()
