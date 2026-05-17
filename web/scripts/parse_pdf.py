"""
PDF → 구조화된 문제 JSON 추출
사용법: python parse_pdf.py <pdf_path> [--output output.json]
"""

import fitz  # PyMuPDF
import re
import json
import sys
from pathlib import Path


# 페이지 헤더 패턴 (제거용)
HEADER_RE = re.compile(r'^\d{4}년도.*?$', re.MULTILINE)

# 문제 번호 패턴: "1." 또는 "10." 등 (줄 시작 또는 공백 뒤)
Q_START_RE = re.compile(r'(?:^|\n)\s*(\d{1,2})\.\s*\n?')

# 보기 패턴: ①②③④⑤
CHOICE_RE = re.compile(r'([①②③④⑤])')

# 보기 번호 → 숫자 매핑
CHOICE_MAP = {'①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5}


def extract_text(pdf_path: str) -> str:
    """PDF 전체 텍스트 추출 (헤더 제거)"""
    doc = fitz.open(pdf_path)
    pages = []
    for page in doc:
        text = page.get_text()
        # 페이지 헤더 제거
        text = HEADER_RE.sub('', text)
        # 페이지 번호 패턴 제거: ( 32 – 1 ) 등
        text = re.sub(r'\(\s*\d+\s*–\s*\d+\s*\)', '', text)
        pages.append(text.strip())
    doc.close()
    return '\n'.join(pages)


def split_questions(full_text: str) -> list[dict]:
    """전체 텍스트를 문제별로 분할"""
    # 문제 시작 위치 찾기
    matches = list(Q_START_RE.finditer(full_text))
    questions = []

    for i, match in enumerate(matches):
        q_num = int(match.group(1))
        # 1~40번만 처리
        if q_num < 1 or q_num > 40:
            continue

        start = match.end()
        # 다음 문제 시작 전까지가 이 문제의 범위
        if i + 1 < len(matches):
            end = matches[i + 1].start()
        else:
            end = len(full_text)

        q_text = full_text[start:end].strip()
        questions.append({
            'number': q_num,
            'raw_text': q_text,
        })

    return questions


def parse_question(q: dict) -> dict:
    """개별 문제 텍스트를 구조화"""
    raw = q['raw_text']

    # 보기 분리: ①~⑤ 기준으로 분할
    choice_positions = list(CHOICE_RE.finditer(raw))

    if len(choice_positions) >= 5:
        # 문제 본문: 첫 번째 보기 이전
        question_text = raw[:choice_positions[0].start()].strip()

        # 보기 추출
        choices = []
        for j in range(5):
            c_start = choice_positions[j].end()
            if j + 1 < len(choice_positions):
                c_end = choice_positions[j + 1].start()
            else:
                c_end = len(raw)
            choice_text = raw[c_start:c_end].strip()
            # 줄바꿈 정리
            choice_text = re.sub(r'\s+', ' ', choice_text)
            choices.append(choice_text)
    else:
        # 보기 분리 실패 → 전체를 본문으로
        question_text = raw
        choices = []

    # 본문 정리: 줄바꿈 → 공백, 다중 공백 축소
    question_text = re.sub(r'\n', ' ', question_text)
    question_text = re.sub(r'\s+', ' ', question_text)

    # ㄱ,ㄴ,ㄷ,ㄹ,ㅁ 보기가 있는 경우 보존
    sub_items = re.findall(r'[ㄱㄴㄷㄹㅁ]\.\s*[^ㄱㄴㄷㄹㅁ①②③④⑤]+', raw)
    sub_items = [re.sub(r'\s+', ' ', s.strip()) for s in sub_items]

    return {
        'number': q['number'],
        'questionText': question_text,
        'subItems': sub_items if sub_items else None,
        'choices': choices,
    }


def extract_metadata(pdf_path: str) -> dict:
    """파일명에서 연도/과목 추출"""
    name = Path(pdf_path).stem  # e.g. "2026_재정학"
    parts = name.split('_')
    year = int(parts[0]) if parts[0].isdigit() else 0
    subject = parts[1] if len(parts) > 1 else '재정학'
    return {'year': year, 'subject': subject}


def parse_pdf(pdf_path: str) -> dict:
    """메인 파싱 함수: PDF → 구조화된 JSON"""
    meta = extract_metadata(pdf_path)
    full_text = extract_text(pdf_path)
    raw_questions = split_questions(full_text)

    # 중복 번호 제거 (같은 번호가 여러 번 매칭될 수 있음)
    seen = set()
    unique = []
    for q in raw_questions:
        if q['number'] not in seen:
            seen.add(q['number'])
            unique.append(q)

    parsed = [parse_question(q) for q in unique]
    # 번호순 정렬
    parsed.sort(key=lambda x: x['number'])

    return {
        'year': meta['year'],
        'subject': meta['subject'],
        'totalQuestions': len(parsed),
        'questions': parsed,
    }


def main():
    if len(sys.argv) < 2:
        print('사용법: python parse_pdf.py <pdf_path> [--output output.json]')
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_path = None
    if '--output' in sys.argv:
        idx = sys.argv.index('--output')
        output_path = sys.argv[idx + 1]

    result = parse_pdf(pdf_path)
    json_str = json.dumps(result, ensure_ascii=False, indent=2)

    if output_path:
        Path(output_path).write_text(json_str, encoding='utf-8')
        print(f'✅ {result["year"]}년 {result["subject"]} — {result["totalQuestions"]}문제 → {output_path}')
    else:
        print(json_str)


if __name__ == '__main__':
    main()
