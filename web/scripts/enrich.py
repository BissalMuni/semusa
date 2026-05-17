"""
파싱된 문제 JSON → Claude로 주제 분류 + 해설 생성
백엔드: claude CLI (Claude Code 로그인 사용) 또는 anthropic SDK

사용법: python enrich.py <parsed.json> [--output enriched.json] [--backend cli|sdk]
"""

import json
import subprocess
import sys
import os
from pathlib import Path


# .env 파일 자동 로드 (SDK 모드용)
def load_dotenv():
    for env_path in [
        Path(__file__).parent.parent / '.env',
        Path(__file__).parent.parent.parent / '.env',
    ]:
        if env_path.exists():
            for line in env_path.read_text(encoding='utf-8').splitlines():
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, _, value = line.partition('=')
                    os.environ.setdefault(key.strip(), value.strip())

load_dotenv()


# 재정학 주제 목록 (topicId → 한국어명)
TOPICS = {
    'micro_demand_supply': '수요·공급이론',
    'micro_elasticity': '탄력성',
    'micro_consumer': '소비자이론',
    'micro_producer': '생산자이론',
    'micro_perfect_comp': '완전경쟁시장',
    'micro_monopoly': '독점·과점',
    'micro_game_theory': '게임이론',
    'micro_welfare': '후생경제학',
    'public_goods': '공공재',
    'externality': '외부성',
    'tax_theory': '조세원칙·체계',
    'tax_incidence': '조세귀착·전가',
    'optimal_tax': '최적조세',
    'public_expenditure': '공공지출·비용편익',
    'fiscal_federalism': '재정연방주의·지방재정',
    'macro_national_income': '국민소득·경제성장',
    'macro_is_lm': 'IS-LM모형',
    'macro_ad_as': 'AD-AS모형',
    'macro_consumption': '소비·투자이론',
    'macro_money': '화폐·인플레이션',
    'public_choice': '공공선택론·투표',
    'income_distribution': '소득분배·불평등',
    'tax_reform': '조세개혁·제도',
    'social_insurance': '사회보험·복지',
}

TOPIC_LIST_STR = '\n'.join(f'- {tid}: {name}' for tid, name in TOPICS.items())

SYSTEM_PROMPT = f"""당신은 세무사 1차 시험 재정학 전문 튜터입니다.
주어진 기출문제를 분석하여 다음을 생성해주세요:

1. **topicId**: 아래 주제 목록에서 가장 적합한 하나를 선택
2. **keywords**: 핵심 키워드 3-5개 (배열)
3. **coreStatement**: 이 문제의 핵심을 한 문장으로 (시험 직전에 이것만 보고 기억해낼 수 있게)
4. **answer**: 정답 번호 (1-5)
5. **basicExplanation**: 핵심 해설 2-3줄 (왜 정답인지, 오답인 이유 간단히)
6. **detailedExplanation**: 상세 해설 (관련 이론, 공식, 오답 분석 포함, 줄바꿈 사용)
7. **difficulty**: 난이도 1(쉬움)-3(어려움)

주제 목록:
{TOPIC_LIST_STR}

반드시 JSON 형식으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만."""


def build_question_prompt(question: dict, year: int) -> str:
    """문제 텍스트를 프롬프트로 구성"""
    q_text = f"[{year}년 {question['number']}번]\n{question['questionText']}"
    if question.get('subItems'):
        q_text += '\n' + '\n'.join(question['subItems'])
    if question.get('choices'):
        for i, c in enumerate(question['choices'], 1):
            q_text += f'\n{i}. {c}'
    return q_text


def parse_llm_response(raw: str) -> dict:
    """LLM 응답에서 JSON 추출"""
    raw = raw.strip()
    # ```json ... ``` 제거
    if '```' in raw:
        # 코드블록 내용만 추출
        parts = raw.split('```')
        for part in parts:
            part = part.strip()
            if part.startswith('json'):
                part = part[4:].strip()
            if part.startswith('{'):
                raw = part
                break
    # JSON 부분만 추출 (앞뒤 텍스트 제거)
    start = raw.find('{')
    end = raw.rfind('}')
    if start != -1 and end != -1:
        raw = raw[start:end + 1]

    return json.loads(raw)


def default_enrichment() -> dict:
    return {
        'topicId': 'tax_theory',
        'keywords': [],
        'coreStatement': '',
        'answer': 1,
        'basicExplanation': '',
        'detailedExplanation': '',
        'difficulty': 2,
    }


# ── Claude CLI 백엔드 (Claude Code 로그인 사용) ──────────────────

def find_claude_cmd() -> str:
    """Windows/Unix 호환 claude CLI 경로 탐색"""
    import shutil
    # shutil.which 먼저
    cmd = shutil.which('claude')
    if cmd:
        return cmd
    # Windows: .cmd 확장자
    cmd = shutil.which('claude.cmd')
    if cmd:
        return cmd
    # 알려진 경로
    for p in [
        os.path.expanduser('~/AppData/nodejs/npm_global/claude.cmd'),
        'D:/AppData/nodejs/npm_global/claude.cmd',
    ]:
        if os.path.isfile(p):
            return p
    return 'claude'

CLAUDE_CMD = find_claude_cmd()


def enrich_question_cli(question: dict, year: int) -> dict:
    """claude CLI로 단일 문제 분석"""
    prompt = SYSTEM_PROMPT + '\n\n' + build_question_prompt(question, year)

    # Windows: git-bash를 통해 claude 실행 (claude CLI가 git-bash 필요)
    if sys.platform == 'win32':
        import shutil
        # Git/bin/bash.exe 사용 (git-bash 환경, claude CLI 요구사항)
        bash = os.environ.get('CLAUDE_CODE_GIT_BASH_PATH') or 'D:/Program Files/Git/bin/bash.exe'
        if not os.path.isfile(bash):
            bash = shutil.which('bash') or 'C:/Program Files/Git/bin/bash.exe'
        # 프롬프트를 stdin으로 전달 (파일/이스케이프 문제 회피)
        result = subprocess.run(
            [bash, '-l', '-c', 'claude -p --output-format text'],
            input=prompt,
            capture_output=True, text=True, timeout=120, encoding='utf-8',
        )
    else:
        result = subprocess.run(
            [CLAUDE_CMD, '-p', '--output-format', 'text', prompt],
            capture_output=True, text=True, timeout=120, encoding='utf-8',
        )

    if result.returncode != 0:
        print(f'\n  ⚠️ CLI 오류: {result.stderr[:200]}')
        return {**question, **default_enrichment(), 'year': year}

    try:
        enriched = parse_llm_response(result.stdout)
    except (json.JSONDecodeError, ValueError):
        print(f'\n  ⚠️ JSON 파싱 실패, 기본값 사용')
        enriched = default_enrichment()

    return {**question, **enriched, 'year': year}


# ── Anthropic SDK 백엔드 (API 키 사용) ───────────────────────────

def enrich_question_sdk(client, question: dict, year: int) -> dict:
    """anthropic SDK로 단일 문제 분석"""
    q_text = build_question_prompt(question, year)

    response = client.messages.create(
        model='claude-sonnet-4-20250514',
        max_tokens=1500,
        system=SYSTEM_PROMPT,
        messages=[{'role': 'user', 'content': q_text}],
    )

    raw = response.content[0].text.strip()
    try:
        enriched = parse_llm_response(raw)
    except (json.JSONDecodeError, ValueError):
        print(f'\n  ⚠️ JSON 파싱 실패, 기본값 사용')
        enriched = default_enrichment()

    return {**question, **enriched, 'year': year}


# ── 메인 로직 ─────────────────────────────────────────────────────

def detect_backend() -> str:
    """사용 가능한 백엔드 자동 감지"""
    # API 키가 있으면 SDK 우선
    if os.environ.get('ANTHROPIC_API_KEY'):
        return 'sdk'
    # claude CLI 확인
    try:
        r = subprocess.run(
            [CLAUDE_CMD, '--version'],
            capture_output=True, text=True, timeout=10,
            shell=(sys.platform == 'win32'),
        )
        if r.returncode == 0:
            return 'cli'
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    return 'none'


def enrich_all(parsed_path: str, output_path: str | None = None, backend: str | None = None):
    """전체 파싱 결과 enrichment"""
    if not backend:
        backend = detect_backend()

    if backend == 'sdk':
        import anthropic
        client = anthropic.Anthropic()
        print(f'🔧 백엔드: Anthropic SDK')
    elif backend == 'cli':
        client = None
        print(f'🔧 백엔드: Claude CLI (로그인 인증)')
    else:
        print('❌ 사용 가능한 백엔드 없음.')
        print('   옵션 1: claude CLI 로그인 (claude login)')
        print('   옵션 2: ANTHROPIC_API_KEY 환경변수 설정')
        sys.exit(1)

    data = json.loads(Path(parsed_path).read_text(encoding='utf-8'))
    year = data['year']
    subject = data['subject']
    questions = data['questions']

    print(f'🔄 {year}년 {subject} — {len(questions)}문제 enrichment 시작...')

    enriched = []
    for i, q in enumerate(questions):
        print(f'  [{i+1}/{len(questions)}] {year}년 {q["number"]}번...', end=' ', flush=True)

        if backend == 'sdk':
            result = enrich_question_sdk(client, q, year)
        else:
            result = enrich_question_cli(q, year)

        enriched.append(result)
        print(f'✅ {result.get("topicId", "?")}')

    output = {
        'year': year,
        'subject': subject,
        'totalQuestions': len(enriched),
        'questions': enriched,
    }

    json_str = json.dumps(output, ensure_ascii=False, indent=2)
    if output_path:
        Path(output_path).write_text(json_str, encoding='utf-8')
        print(f'✅ 완료 → {output_path}')
    else:
        print(json_str)

    return output


def main():
    if len(sys.argv) < 2:
        print('사용법: python enrich.py <parsed.json> [--output enriched.json] [--backend cli|sdk]')
        sys.exit(1)

    parsed_path = sys.argv[1]
    output_path = None
    backend = None

    if '--output' in sys.argv:
        idx = sys.argv.index('--output')
        output_path = sys.argv[idx + 1]
    if '--backend' in sys.argv:
        idx = sys.argv.index('--backend')
        backend = sys.argv[idx + 1]

    enrich_all(parsed_path, output_path, backend)


if __name__ == '__main__':
    main()
