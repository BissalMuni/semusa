"""
MD 파일 → TypeScript 데이터 파일 생성
questions.ts + topics.ts를 MD 파일 + _mapping.json 기반으로 재생성
"""
import json, re, yaml
from pathlib import Path
from collections import Counter, defaultdict

ROOT = Path(__file__).resolve().parents[2]
QUESTIONS_DIR = ROOT / "web" / "data" / "questions"
MAPPING_PATH = QUESTIONS_DIR / "_mapping.json"
OUT_DIR = ROOT / "web" / "lib" / "data" / "jaejeonghak"

TAXONOMY = {
    "micro_basic":          ("1편", "소비자·생산자이론", "수요공급, 효용극대화, 비용함수, 규모의경제"),
    "market_structure":     ("1편", "시장구조", "완전경쟁, 독점, 과점, 게임이론"),
    "welfare":              ("2편", "후생경제학", "파레토효율, 사회후생함수, 기본정리, 분배정의론"),
    "public_goods":         ("3편", "공공재", "비배제성, 비경합성, 사무엘슨조건, 린달균형"),
    "externality":          ("3편", "외부성", "피구세, 코즈정리, 배출권거래, 사회적비용"),
    "public_choice":        ("3편", "공공선택이론", "투표이론, 애로불가능성, 니스카넨, 렌트추구"),
    "tax_principle":        ("4편", "조세의 기초·원칙", "공평과세, 조세원칙, 직접세·간접세"),
    "tax_incidence":        ("4편", "조세의 귀착", "탄력성과부담, 하버거모형, 물품세귀착"),
    "excess_burden":        ("4편", "초과부담·최적과세", "사중손실, 램지규칙, 코렛-헤이그, 미를리스"),
    "income_tax":           ("4편", "소득세", "누진세, 노동공급, 탈세모형, 이자소득세"),
    "corporate_tax":        ("4편", "법인세", "이중과세, 배당정책, 투자이론, 사용자비용"),
    "consumption_tax":      ("4편", "소비세·부가가치세", "부가가치세유형, 전단계세액공제, 영세율"),
    "tax_reform":           ("4편", "조세제도 개혁", "세제개편, 법인세통합, 지방세연계"),
    "income_distribution":  ("5편", "소득분배", "로렌츠곡선, 지니계수, 앳킨슨지수, 불평등도"),
    "social_security":      ("5편", "사회보장", "공적연금, 건강보험, 근로장려세제, 부의소득세"),
    "fiscal_policy":        ("6편", "재정정책·거시경제", "IS-LM, AD-AS, 통화정책, 경제성장"),
    "local_finance":        ("7편", "지방재정", "티부가설, 분권화, 교부세, 보조금"),
    "budget":               ("8편", "예산제도·비용편익", "예산제도, 비용편익분석, 조세지출"),
    "govt_spending":        ("8편", "정부지출이론·공공요금", "바그너, 전위효과, 보몰, 공공요금"),
}


def parse_md(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    fm_match = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.DOTALL)
    if not fm_match:
        return {}
    meta = yaml.safe_load(fm_match.group(1))
    body = fm_match.group(2).strip()

    sections = re.split(r"\n## ", body)
    main_text = sections[0]

    # 제목 줄 제거, 문제 텍스트 추출
    lines = main_text.strip().split("\n")
    question_lines = []
    choices = []
    past_title = False
    for line in lines:
        if line.startswith("# "):
            past_title = True
            continue
        if not past_title:
            continue
        stripped = line.strip()
        if not stripped:
            continue
        if stripped[0] in "①②③④⑤":
            choices.append(stripped[1:].strip())
        else:
            question_lines.append(stripped)

    basic = ""
    detailed = ""
    sub_items = None
    for sec in sections[1:]:
        if sec.startswith("기본 해설"):
            basic = sec.split("\n", 1)[1].strip() if "\n" in sec else ""
        elif sec.startswith("상세 해설"):
            detailed = sec.split("\n", 1)[1].strip() if "\n" in sec else ""
        elif sec.startswith("보기"):
            content = sec.split("\n", 1)[1].strip() if "\n" in sec else ""
            sub_items = [l.lstrip("- ").strip() for l in content.split("\n") if l.strip()]

    return {
        "year": meta.get("year", 0),
        "number": meta.get("number", 0),
        "topicId": meta.get("topicId", ""),
        "keywords": meta.get("keywords", []),
        "answer": meta.get("answer", 1),
        "difficulty": meta.get("difficulty", 2),
        "coreStatement": meta.get("coreStatement", ""),
        "questionText": "\n".join(question_lines),
        "choices": choices,
        "basicExplanation": basic,
        "detailedExplanation": detailed,
        "subItems": sub_items,
    }


def load_all_questions():
    questions = []
    for md in sorted(QUESTIONS_DIR.glob("????-Q??.md")):
        q = parse_md(md)
        if q:
            questions.append(q)
    return questions


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")


def generate_topics_ts(questions: list) -> str:
    topic_questions = defaultdict(list)
    for q in questions:
        topic_questions[q["topicId"]].append(q)

    lines = [
        "import type { Topic } from '@/lib/types'",
        "",
        "// 재정학 교재 목차 기반 주제 정의 (19개)",
        "// scripts/generate_ts.py 로 자동 생성",
        "export const jaejeonghakTopics: Topic[] = [",
    ]

    for tid, (chapter_num, name, desc) in TAXONOMY.items():
        qs = topic_questions.get(tid, [])
        total = len(qs)

        kw_counter = Counter()
        for q in qs:
            for kw in q.get("keywords", []):
                kw_counter[kw] += 1
        top_kw = [k for k, _ in kw_counter.most_common(6)]

        exam_types = set()
        for q in qs:
            qt = q.get("questionText", "")
            if any(x in qt for x in ["계산", "구하", "얼마", "단위당", "함수"]):
                exam_types.add("계산형")
            if any(x in qt for x in ["설명으로", "옳은것", "옳지않은"]):
                exam_types.add("개념형")
            if any(x in qt for x in ["그래프", "곡선", "이동"]):
                exam_types.add("그래프형")
        exam_types_list = sorted(exam_types) or ["개념형"]

        core = qs[0].get("coreStatement", desc) if qs else desc
        detailed_parts = []
        for q in qs[:3]:
            de = q.get("detailedExplanation", "")
            if de and len(de) > 20:
                detailed_parts.append(de[:300])
        detailed = "\n\n---\n\n".join(detailed_parts) if detailed_parts else desc

        lines.append(f"  {{")
        lines.append(f"    id: '{tid}',")
        lines.append(f"    subject: '재정학',")
        lines.append(f"    chapter: `{chapter_num}. {name}`,")
        lines.append(f"    section: `{name}`,")
        lines.append(f"    keywords: {json.dumps(top_kw, ensure_ascii=False)},")
        lines.append(f"    coreText: `{esc(core)}`,")
        lines.append(f"    examTypes: {json.dumps(exam_types_list, ensure_ascii=False)},")
        lines.append(f"    examPattern: `5년간 {total}문제 출제. {esc(desc)}`,")
        lines.append(f"    detailedContent: `{esc(detailed)}`,")
        lines.append(f"  }},")
        lines.append("")

    lines.append("]")
    lines.append("")
    lines.append("// topicId → Topic 빠른 조회")
    lines.append("export const topicMap = new Map(jaejeonghakTopics.map(t => [t.id, t]))")
    lines.append("")
    return "\n".join(lines)


def generate_questions_ts(questions: list) -> str:
    mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8")) if MAPPING_PATH.exists() else {}
    similar = mapping.get("similarQuestions", {})

    def md_id_to_ts_id(md_id: str) -> str:
        # "2022-Q01" → "2022-01"
        parts = md_id.split("-Q")
        return f"{parts[0]}-{parts[1]}" if len(parts) == 2 else md_id

    lines = [
        "import type { Question } from '@/lib/types'",
        "",
        "// 재정학 5개년 200문제 (scripts/generate_ts.py 로 자동 생성, 소스: data/questions/*.md)",
        "export const jaejeonghakQuestions: Question[] = [",
    ]

    for q in sorted(questions, key=lambda x: (x.get("year", 0), x.get("number", 0))):
        year = q.get("year", 0)
        num = q.get("number", 0)
        qid = f"{year}-{num:02d}"
        md_id = f"{year}-Q{num:02d}"
        qt = esc(q.get("questionText", ""))
        choices = json.dumps(q.get("choices", []), ensure_ascii=False)
        sub_items = q.get("subItems")
        kw = json.dumps(q.get("keywords", []), ensure_ascii=False)
        core = esc(q.get("coreStatement", ""))
        basic = esc(q.get("basicExplanation", ""))
        detailed = esc(q.get("detailedExplanation", ""))

        related_md = similar.get(md_id, [])
        related_ts = [md_id_to_ts_id(r) for r in related_md[:3]]
        related_json = json.dumps(related_ts, ensure_ascii=False)

        lines.append(f"  {{")
        lines.append(f"    id: '{qid}',")
        lines.append(f"    year: {year},")
        lines.append(f"    examPaper: 1,")
        lines.append(f"    subject: '재정학',")
        lines.append(f"    number: {num},")
        lines.append(f"    topicId: '{q.get('topicId', '')}',")
        lines.append(f"    relatedQuestionIds: {related_json},")
        lines.append(f"    keywords: {kw},")
        lines.append(f"    coreStatement: `{core}`,")
        lines.append(f"    questionText: `{qt}`,")
        if sub_items:
            lines.append(f"    subItems: {json.dumps(sub_items, ensure_ascii=False)},")
        lines.append(f"    choices: {choices},")
        lines.append(f"    answer: {q.get('answer', 1)},")
        lines.append(f"    basicExplanation: `{basic}`,")
        lines.append(f"    detailedExplanation: `{detailed}`,")
        lines.append(f"    difficulty: {q.get('difficulty', 2)},")
        lines.append(f"    isMostFrequent: false,")
        lines.append(f"  }},")

    lines.append("]")
    lines.append("")
    return "\n".join(lines)


def main():
    questions = load_all_questions()
    print(f"로드: {len(questions)}문제")

    topics_code = generate_topics_ts(questions)
    (OUT_DIR / "topics.ts").write_text(topics_code, encoding="utf-8")
    print(f"생성: topics.ts ({len(topics_code):,} bytes)")

    questions_code = generate_questions_ts(questions)
    (OUT_DIR / "questions.ts").write_text(questions_code, encoding="utf-8")
    print(f"생성: questions.ts ({len(questions_code):,} bytes)")

    tid_counts = Counter(q["topicId"] for q in questions)
    print(f"\n주제 {len(tid_counts)}개, 문제 {len(questions)}개")


if __name__ == "__main__":
    main()
