"""
enriched JSON → 개별 MD 파일 변환 (1문제 = 1파일)
출력: web/data/questions/YYYY-QNN.md
"""
import json
from pathlib import Path

ENRICHED_DIR = Path("d:/Coding/semusa/web/data/enriched")
OUTPUT_DIR = Path("d:/Coding/semusa/web/data/questions")
YEARS = [2022, 2023, 2024, 2025, 2026]


def escape_yaml(s: str) -> str:
    if not s:
        return '""'
    if any(c in s for c in [":", "#", "'", '"', "\n", "{", "}", "[", "]", ",", "&", "*", "?", "|", "-", "<", ">", "=", "!", "%", "@", "`"]):
        escaped = s.replace("\\", "\\\\").replace('"', '\\"')
        return f'"{escaped}"'
    return s


def question_to_md(year: int, q: dict) -> str:
    num = q["number"]
    lines = ["---"]
    lines.append(f"id: {year}-Q{num:02d}")
    lines.append(f"year: {year}")
    lines.append(f"number: {num}")
    lines.append(f"topicId: {q['topicId']}")
    lines.append(f"answer: {q['answer']}")
    lines.append(f"difficulty: {q.get('difficulty', 0)}")

    kw_list = ", ".join(q.get("keywords", []))
    lines.append(f"keywords: [{kw_list}]")

    lines.append(f"coreStatement: {escape_yaml(q.get('coreStatement', ''))}")
    lines.append("---")
    lines.append("")

    lines.append(f"# {year}년 제{num}번")
    lines.append("")
    lines.append(q.get("questionText", ""))
    lines.append("")

    choices = q.get("choices", [])
    if choices:
        for i, c in enumerate(choices, 1):
            marker = chr(0x2460 + i - 1)  # ①②③④⑤
            lines.append(f"{marker} {c}")
        lines.append("")

    sub_items = q.get("subItems")
    if sub_items:
        lines.append("## 보기")
        lines.append("")
        if isinstance(sub_items, list):
            for item in sub_items:
                lines.append(f"- {item}")
        elif isinstance(sub_items, str):
            lines.append(sub_items)
        lines.append("")

    basic = q.get("basicExplanation", "")
    if basic:
        lines.append("## 기본 해설")
        lines.append("")
        lines.append(basic)
        lines.append("")

    detailed = q.get("detailedExplanation", "")
    if detailed:
        lines.append("## 상세 해설")
        lines.append("")
        lines.append(detailed)
        lines.append("")

    return "\n".join(lines)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    total = 0

    for y in YEARS:
        fpath = ENRICHED_DIR / f"enriched_{y}_재정학.json"
        data = json.loads(fpath.read_text(encoding="utf-8"))

        for q in data["questions"]:
            md = question_to_md(y, q)
            out = OUTPUT_DIR / f"{y}-Q{q['number']:02d}.md"
            out.write_text(md, encoding="utf-8")
            total += 1

    print(f"{total}개 MD 파일 생성 → {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
