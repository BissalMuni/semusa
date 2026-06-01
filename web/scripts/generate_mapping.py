"""
매핑 파일 생성: 주제→문제, 연도→문제, 유사문제 관계
출력: web/data/questions/_mapping.json
"""
import json
from pathlib import Path
from collections import defaultdict

ENRICHED_DIR = Path("d:/Coding/semusa/web/data/enriched")
OUTPUT = Path("d:/Coding/semusa/web/data/questions/_mapping.json")
YEARS = [2022, 2023, 2024, 2025, 2026]


def main():
    topic_to_questions = defaultdict(list)
    year_to_questions = defaultdict(list)
    all_questions = []

    for y in YEARS:
        fpath = ENRICHED_DIR / f"enriched_{y}_재정학.json"
        data = json.loads(fpath.read_text(encoding="utf-8"))

        for q in data["questions"]:
            qid = f"{y}-Q{q['number']:02d}"
            entry = {
                "id": qid,
                "year": y,
                "number": q["number"],
                "topicId": q["topicId"],
                "keywords": q.get("keywords", []),
                "difficulty": q.get("difficulty", 0),
                "answer": q.get("answer"),
            }
            all_questions.append(entry)
            topic_to_questions[q["topicId"]].append(qid)
            year_to_questions[str(y)].append(qid)

    # 유사문제: 같은 topicId + keyword 2개 이상 겹침
    similar = {}
    for i, q1 in enumerate(all_questions):
        related = []
        kw1 = set(q1["keywords"])
        for j, q2 in enumerate(all_questions):
            if i == j:
                continue
            if q1["topicId"] != q2["topicId"]:
                continue
            overlap = kw1 & set(q2["keywords"])
            if len(overlap) >= 2:
                related.append({"id": q2["id"], "overlap": sorted(overlap)})
        if related:
            related.sort(key=lambda x: (-len(x["overlap"]), x["id"]))
            similar[q1["id"]] = [r["id"] for r in related[:5]]

    mapping = {
        "topicToQuestions": dict(topic_to_questions),
        "yearToQuestions": dict(year_to_questions),
        "similarQuestions": similar,
        "totalQuestions": len(all_questions),
    }

    OUTPUT.write_text(json.dumps(mapping, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"매핑 생성 완료: {OUTPUT}")
    print(f"  주제: {len(topic_to_questions)}개")
    print(f"  유사문제 그룹: {len(similar)}개")

    for tid, qids in sorted(topic_to_questions.items(), key=lambda x: -len(x[1])):
        print(f"  {tid:24s}: {len(qids)}문제")


if __name__ == "__main__":
    main()
