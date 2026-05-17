"""
전체 자동화 파이프라인: PDF 소스 → 파싱 → LLM 해설 → TypeScript 생성

사용법:
  python pipeline.py                          # 모든 PDF 처리
  python pipeline.py --subject 재정학          # 특정 과목만
  python pipeline.py --year 2026              # 특정 연도만
  python pipeline.py --skip-enrich            # 파싱만 (API 호출 없이)
  python pipeline.py --force                  # 기존 결과 덮어쓰기

디렉토리 구조:
  semusa/
  ├── 재정학/2026_재정학.pdf       ← PDF 소스 (불변)
  ├── web/
  │   ├── scripts/pipeline.py     ← 이 파일
  │   └── data/
  │       ├── parsed/             ← 1단계: 파싱 결과 JSON
  │       ├── enriched/           ← 2단계: LLM 해설 JSON
  │       └── generated/          ← 3단계: TypeScript 출력
"""

import sys
import os
import json
from pathlib import Path

# 스크립트 위치 기준 경로 설정
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent  # semusa/
WEB_ROOT = SCRIPT_DIR.parent             # semusa/web/

# 디렉토리
PDF_DIRS = {
    '재정학': PROJECT_ROOT / '재정학',
    '세법학개론': PROJECT_ROOT / '세법학개론',
    '회계학개론': PROJECT_ROOT / '회계학개론',
    '상법': PROJECT_ROOT / '상법',
}
PARSED_DIR = WEB_ROOT / 'data' / 'parsed'
ENRICHED_DIR = WEB_ROOT / 'data' / 'enriched'
GENERATED_DIR = WEB_ROOT / 'lib' / 'data'

# 로컬 모듈 임포트
sys.path.insert(0, str(SCRIPT_DIR))
from parse_pdf import parse_pdf
from enrich import enrich_all
from generate_ts import generate_ts


def find_pdfs(subject: str | None = None, year: int | None = None) -> list[tuple[str, Path]]:
    """처리할 PDF 목록 반환: [(subject, path), ...]"""
    results = []
    dirs = {subject: PDF_DIRS[subject]} if subject else PDF_DIRS

    for subj, pdf_dir in dirs.items():
        if not pdf_dir.exists():
            continue
        for pdf_file in sorted(pdf_dir.glob('*.pdf')):
            # 파일명에서 연도 추출
            try:
                file_year = int(pdf_file.stem.split('_')[0])
            except (ValueError, IndexError):
                continue
            if year and file_year != year:
                continue
            results.append((subj, pdf_file))

    return results


def run_pipeline(
    subject: str | None = None,
    year: int | None = None,
    skip_enrich: bool = False,
    force: bool = False,
):
    """전체 파이프라인 실행"""
    # 출력 디렉토리 생성
    PARSED_DIR.mkdir(parents=True, exist_ok=True)
    ENRICHED_DIR.mkdir(parents=True, exist_ok=True)

    pdfs = find_pdfs(subject, year)
    if not pdfs:
        print('❌ 처리할 PDF가 없습니다.')
        return

    print(f'📋 처리 대상: {len(pdfs)}개 PDF')
    print('=' * 60)

    for subj, pdf_path in pdfs:
        file_year = int(pdf_path.stem.split('_')[0])
        base_name = f'{file_year}_{subj}'

        parsed_path = PARSED_DIR / f'parsed_{base_name}.json'
        enriched_path = ENRICHED_DIR / f'enriched_{base_name}.json'

        # ── 1단계: PDF 파싱 ──
        if parsed_path.exists() and not force:
            print(f'⏭️  파싱 건너뜀 (이미 존재): {parsed_path.name}')
        else:
            print(f'\n📄 [1/3] 파싱: {pdf_path.name}')
            result = parse_pdf(str(pdf_path))
            parsed_path.write_text(
                json.dumps(result, ensure_ascii=False, indent=2),
                encoding='utf-8',
            )
            print(f'   ✅ {result["totalQuestions"]}문제 추출 → {parsed_path.name}')

        # ── 2단계: LLM 해설 생성 ──
        if skip_enrich:
            print(f'⏭️  enrichment 건너뜀 (--skip-enrich)')
        elif enriched_path.exists() and not force:
            print(f'⏭️  enrichment 건너뜀 (이미 존재): {enriched_path.name}')
        else:
            print(f'\n🤖 [2/3] LLM 해설 생성: {base_name}')
            enrich_all(str(parsed_path), str(enriched_path))

    # ── 3단계: TypeScript 생성 ──
    # 과목별로 생성
    subjects_done = set(subj for subj, _ in pdfs)
    for subj in subjects_done:
        subj_enriched = ENRICHED_DIR
        # 해당 과목의 enriched 파일이 있는지 확인
        enriched_files = list(subj_enriched.glob(f'enriched_*_{subj}.json'))
        if not enriched_files:
            if not skip_enrich:
                print(f'⚠️  {subj}: enriched 파일 없음, TypeScript 생성 건너뜀')
            continue

        # 과목명 → 디렉토리명 매핑
        dir_map = {
            '재정학': 'jaejeonghak',
            '세법학개론': 'sebeophak',
            '회계학개론': 'hoegyehak',
            '상법': 'sangbeop',
        }
        ts_dir = GENERATED_DIR / dir_map.get(subj, subj)
        ts_dir.mkdir(parents=True, exist_ok=True)
        ts_path = ts_dir / 'generated_questions.ts'

        print(f'\n📝 [3/3] TypeScript 생성: {subj}')
        generate_ts(str(subj_enriched), str(ts_path))

    print('\n' + '=' * 60)
    print('🎉 파이프라인 완료!')
    print(f'   파싱 결과: {PARSED_DIR}')
    print(f'   해설 결과: {ENRICHED_DIR}')
    print(f'   TypeScript: {GENERATED_DIR}')


def main():
    import argparse
    parser = argparse.ArgumentParser(description='세무사 기출 PDF → 학습 데이터 파이프라인')
    parser.add_argument('--subject', type=str, help='특정 과목만 처리 (예: 재정학)')
    parser.add_argument('--year', type=int, help='특정 연도만 처리 (예: 2026)')
    parser.add_argument('--skip-enrich', action='store_true', help='LLM 해설 생성 건너뛰기')
    parser.add_argument('--force', action='store_true', help='기존 결과 덮어쓰기')
    args = parser.parse_args()

    run_pipeline(
        subject=args.subject,
        year=args.year,
        skip_enrich=args.skip_enrich,
        force=args.force,
    )


if __name__ == '__main__':
    main()
