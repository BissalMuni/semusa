"""
한컴 OpenDataLoader JSON → 구조화 문제 데이터 변환
입력: 재정학/YYYY_재정학.json (OpenDataLoader 출력)
출력: web/data/parsed/parsed_YYYY_재정학.json (기존 parsed 포맷과 호환)
"""
import json, re
from pathlib import Path

ODL_DIR = Path("d:/Coding/semusa/재정학")
OUT_DIR = Path("d:/Coding/semusa/web/data/parsed")
YEARS = [2022, 2023, 2024, 2025, 2026]

CHOICE_MARKERS = "①②③④⑤"
SUB_MARKERS = re.compile(r"^[ㄱ-ㅎ]\.")


def flatten_elements(node, result=None):
    """JSON 트리를 평탄화하여 모든 요소 순서대로 추출"""
    if result is None:
        result = []

    if isinstance(node, dict):
        t = node.get("type", "")
        if t in ("list item", "paragraph", "heading", "text block"):
            content = node.get("content", "")
            if content and content.strip():
                result.append({
                    "type": t,
                    "content": content.strip(),
                    "level": node.get("level", ""),
                    "numbering_style": "",
                    "page": node.get("page number", 0),
                    "bbox_y": node.get("bounding box", [0, 0, 0, 0])[1],
                })

        if t == "list":
            ns = node.get("numbering style", "")
            for item in node.get("list items", []):
                item["_parent_numbering"] = ns
                flatten_elements(item, result)
                for kid in item.get("kids", []):
                    flatten_elements(kid, result)
        else:
            for kid in node.get("kids", []):
                flatten_elements(kid, result)

    elif isinstance(node, list):
        for item in node:
            flatten_elements(item, result)

    return result


def split_inline_choices(text: str) -> list[str]:
    """① ㄱ, ㄴ ② ㄱ, ㄷ 같은 한 줄 선지를 분리"""
    parts = re.split(r"([①②③④⑤])", text)
    choices = []
    for i in range(1, len(parts), 2):
        marker = parts[i]
        body = parts[i + 1].strip() if i + 1 < len(parts) else ""
        if body:
            choices.append(body)
    return choices


def is_question_start(content: str) -> int | None:
    """문제 번호 추출 (1~40)"""
    m = re.match(r"^(\d{1,2})\.\s", content)
    if m:
        num = int(m.group(1))
        if 1 <= num <= 40:
            return num
    return None


def parse_odl_json(filepath: Path) -> list[dict]:
    """OpenDataLoader JSON을 문제 리스트로 변환"""
    data = json.loads(filepath.read_text(encoding="utf-8"))
    elements = flatten_elements(data.get("kids", []))

    questions = []
    current_q = None
    collecting_sub = False

    for el in elements:
        content = el["content"]

        # 문제 시작
        qnum = is_question_start(content)
        if qnum and el["type"] == "list item":
            if current_q:
                questions.append(current_q)
            q_text = re.sub(r"^\d{1,2}\.\s*", "", content)
            current_q = {
                "number": qnum,
                "questionText": q_text,
                "subItems": [],
                "choices": [],
            }
            collecting_sub = False
            continue

        if not current_q:
            continue

        # 선지: ①②③④⑤ 포함 요소
        marker_count = sum(1 for c in content if c in CHOICE_MARKERS)
        if content and content[0] in CHOICE_MARKERS:
            if marker_count >= 2:
                inline = split_inline_choices(content)
                if inline:
                    current_q["choices"].extend(inline)
                    continue
            choice_text = content[1:].strip()
            if choice_text:
                current_q["choices"].append(choice_text)
            continue

        # 선지 마커가 텍스트 중간에 있는 경우 (이전 선지와 합쳐진 케이스)
        if current_q["choices"] and marker_count >= 1:
            for m in CHOICE_MARKERS:
                idx = content.find(m)
                if idx > 0:
                    current_q["choices"][-1] += " " + content[:idx].strip()
                    remaining = content[idx:]
                    if sum(1 for c in remaining if c in CHOICE_MARKERS) >= 2:
                        current_q["choices"].extend(split_inline_choices(remaining))
                    else:
                        current_q["choices"].append(remaining[1:].strip())
                    break
            else:
                if content[0] in CHOICE_MARKERS:
                    current_q["choices"].append(content[1:].strip())
            continue

        # ㄱ~ㅎ 보기 항목
        if SUB_MARKERS.match(content):
            current_q["subItems"].append(content)
            collecting_sub = True
            continue

        # 줄바꿈으로 이어지는 텍스트 (이전 줄의 연속)
        if el["type"] == "paragraph" and current_q:
            # 선지가 이미 있으면 마지막 선지에 이어붙이기
            if current_q["choices"] and not content[0] in CHOICE_MARKERS and not SUB_MARKERS.match(content):
                # 선지 본문 연속인지 확인 (들여쓰기 위치로 판별)
                if el.get("level", "") != "1" and not is_question_start(content):
                    current_q["choices"][-1] += " " + content
                    continue

            # 보기 항목 연속
            if collecting_sub and current_q["subItems"]:
                if not content.startswith("ㄱ") and not content.startswith("ㄴ") and not content.startswith("ㄷ") and not content.startswith("ㄹ") and not content.startswith("ㅁ"):
                    current_q["subItems"][-1] += " " + content
                    continue

            # 문제 텍스트 연속
            if not current_q["choices"] and not collecting_sub:
                current_q["questionText"] += " " + content
                continue

    if current_q:
        questions.append(current_q)

    # 정리
    for q in questions:
        if not q["subItems"]:
            q["subItems"] = None

        # 선지가 부족하면 문제 텍스트에서 추출 시도
        if len(q["choices"]) < 5 and "①" in q["questionText"]:
            idx = q["questionText"].index("①")
            choice_part = q["questionText"][idx:]
            q["questionText"] = q["questionText"][:idx].strip()
            inline = split_inline_choices(choice_part)
            if len(inline) >= 5:
                q["choices"] = inline[:5]

        # 중복 제거 (동일 텍스트가 반복된 경우)
        if len(q["choices"]) > 5:
            seen = []
            for c in q["choices"]:
                if c not in seen:
                    seen.append(c)
            q["choices"] = seen[:5]

    return questions


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for year in YEARS:
        odl_path = ODL_DIR / f"{year}_재정학.json"
        if not odl_path.exists():
            print(f"  {year}: 파일 없음")
            continue

        questions = parse_odl_json(odl_path)
        out = {
            "year": year,
            "subject": "재정학",
            "totalQuestions": len(questions),
            "source": "opendataloader-pdf",
            "questions": questions,
        }

        out_path = OUT_DIR / f"parsed_{year}_재정학.json"
        out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{year}: {len(questions)}문제 파싱 → {out_path.name}")

        # 선지 부족 문제 리포트
        for q in questions:
            if len(q.get("choices", [])) < 5:
                print(f"  [!] Q{q['number']:02d}: choices {len(q['choices'])}")


if __name__ == "__main__":
    main()
