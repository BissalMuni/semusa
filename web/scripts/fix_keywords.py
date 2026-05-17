"""
불일치 26건의 keywords를 questionText 기반으로 재생성.
topicId는 유지하고, keywords만 문제 텍스트에서 추출.
"""
import json, re
from pathlib import Path

# topicId별 대표 키워드 풀 (문제 텍스트에서 매칭하여 추출)
TOPIC_KEYWORD_POOL = {
    "income_tax": ["소득세", "누진세", "한계세율", "평균세율", "세수함수", "탈세", "알링햄", "샌드모",
                   "노동공급", "근로소득세", "이자소득세", "소득공제", "세액공제", "감면", "과세표준",
                   "인플레이션", "브래킷", "시점간", "저축", "합산과세", "분리과세", "조세지출"],
    "corporate_tax": ["법인세", "배당", "이중과세", "모딜리아니", "밀러", "경제적이윤",
                      "사용자비용", "조겐슨", "투자", "감가상각", "가속상각", "사내유보",
                      "투자세액공제", "준비금", "인플레이션", "명목이자", "실질이자"],
    "tax_incidence": ["귀착", "전가", "하버거", "부담", "물품세", "종량세", "종가세",
                      "탄력성", "소비자부담", "생산자부담", "초과부담", "보상수요"],
    "excess_burden": ["초과부담", "사중손실", "램지", "역탄력성", "코렛", "헤이그",
                      "최적과세", "최적소득세", "미를리스", "보상수요곡선"],
    "tax_principle": ["조세원칙", "공평", "수평적", "수직적", "편익원칙", "능력원칙",
                      "직접세", "간접세", "누진세", "바람직한조세", "목적세", "보통세"],
    "consumption_tax": ["부가가치세", "소비세", "순소득형", "총소득형", "전단계세액공제", "영세율"],
    "welfare": ["파레토", "사회후생", "에지워스", "계약곡선", "기본정리", "효용가능",
                "공리주의", "벤담", "롤스", "노직", "분배", "최적분배",
                "유기체적", "기계론적", "자원배분", "효율성", "재정이론", "재정기능"],
    "public_goods": ["공공재", "비배제", "비경합", "무임승차", "사무엘슨", "린달",
                     "수직합산", "클라크세", "소방", "가로등"],
    "externality": ["외부성", "외부효과", "피구세", "코즈", "배출권", "오염",
                    "저감비용", "사회적비용", "피해", "목장", "농작물"],
    "public_choice": ["투표", "중위투표자", "콩도르세", "보르다", "애로",
                      "니스카넨", "관료", "렌트추구", "공공선택"],
    "social_security": ["사회보험", "국민연금", "건강보험", "연금", "공적연금",
                        "근로장려", "EITC", "부의소득세", "공공부조", "재분배정책", "사회보장"],
    "fiscal_policy": ["IS", "LM", "재정정책", "통화정책", "구축효과", "승수",
                      "AD", "AS", "GDP", "국채", "재정적자", "리카도",
                      "솔로우", "먼델", "플레밍", "감세", "화폐수요", "항상소득"],
    "local_finance": ["지방", "교부세", "보조금", "티부", "분권", "국고보조금"],
    "budget": ["예산", "비용편익", "NPV", "IRR", "할인율", "품목별", "성과주의", "PPBS", "영기준", "조세지출예산"],
    "govt_spending": ["바그너", "공공요금", "자연독점", "정부지출", "보몰", "피콕",
                      "이부가격", "램지가격", "최대부하", "한계비용가격", "평균비용가격",
                      "독점기업", "사회후생손실", "최고가격제"],
    "income_distribution": ["로렌츠", "지니", "앳킨슨", "달톤", "불평등", "5분위", "십분위",
                            "소득분배", "균등분배"],
}

def extract_keywords(question_text: str, choices: list, topic_id: str) -> list[str]:
    """문제 텍스트에서 topicId에 맞는 키워드 추출"""
    full = question_text + " " + " ".join(choices)
    full = full.replace(" ", "")

    pool = TOPIC_KEYWORD_POOL.get(topic_id, [])
    found = []
    for kw in pool:
        if kw.replace(" ", "") in full:
            found.append(kw)

    # 최소 3개, 최대 5개
    if len(found) < 3:
        # 부족하면 풀에서 topicId 관련 일반 키워드 추가
        for kw in pool[:5]:
            if kw not in found:
                found.append(kw)
            if len(found) >= 4:
                break

    return found[:5]


def main():
    enriched_dir = Path("d:/Coding/semusa/web/data/enriched")

    # 불일치 목록 (위 분석 결과)
    MISMATCHES = [
        (2022, 6), (2022, 12), (2022, 31),
        (2023, 2), (2023, 20), (2023, 21), (2023, 32),
        (2024, 1), (2024, 20), (2024, 21), (2024, 30), (2024, 31), (2024, 40),
        (2025, 1), (2025, 3), (2025, 4), (2025, 5), (2025, 20), (2025, 22),
        (2025, 25), (2025, 30), (2025, 32), (2025, 35), (2025, 38),
        (2026, 20), (2026, 23),
    ]
    mismatch_set = set(MISMATCHES)

    fixed = 0
    for y in [2022, 2023, 2024, 2025, 2026]:
        fpath = enriched_dir / f"enriched_{y}_재정학.json"
        data = json.loads(fpath.read_text(encoding="utf-8"))

        for q in data["questions"]:
            if (y, q["number"]) in mismatch_set:
                old_kw = q.get("keywords", [])
                new_kw = extract_keywords(
                    q.get("questionText", ""),
                    q.get("choices", []),
                    q["topicId"]
                )
                if new_kw:
                    q["keywords"] = new_kw
                    fixed += 1
                    print(f'{y} Q{q["number"]:02d} [{q["topicId"]:20s}] {old_kw[:3]} → {new_kw[:3]}')

        fpath.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n총 {fixed}건 keywords 수정 완료")


if __name__ == "__main__":
    main()
