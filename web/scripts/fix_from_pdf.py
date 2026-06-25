"""
PDF 대조 교정 JSON을 MD 파일에 반영 (문항 단위 순차 처리).
프론트매터와 해설(## 기본 해설 / ## 상세 해설)은 보존하고
questionText / choices / subItems(보기)만 교체한다.

교정 JSON 형식: web/data/corrections/YYYY.json
{
  "2022-Q01": {
     "questionText": "....",
     "choices": ["...", "...", "...", "...", "..."],
     "subItems": ["ㄱ. ...", "ㄴ. ..."]   // 없으면 null 또는 생략
  },
  ...
}

사용: python fix_from_pdf.py 2022 [2023 ...]
"""
import sys, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
Q_DIR = ROOT / "web" / "data" / "questions"
CORR_DIR = ROOT / "web" / "data" / "corrections"

PUA = lambda s: any(0xE000 <= ord(c) <= 0xF8FF for c in s)


def split_md(text: str):
    """returns (frontmatter_block, header_line, tail_from_first_explanation)"""
    m = re.match(r"^(---\n.*?\n---\n)(.*)$", text, re.DOTALL)
    fm, body = m.group(1), m.group(2)
    # header line "# YYYY년 제N번"
    hm = re.search(r"^#\s.*$", body, re.MULTILINE)
    header = hm.group(0)
    # tail = from first "## 기본 해설" or "## 상세 해설" onward (preserve explanations)
    tm = re.search(r"\n(## (?:기본 해설|상세 해설).*)$", body, re.DOTALL)
    tail = tm.group(1) if tm else ""
    return fm, header, tail


def build(fm, header, corr, tail):
    lines = [fm.rstrip("\n"), "", header, ""]
    lines.append(corr["questionText"].strip())
    lines.append("")
    for i, c in enumerate(corr.get("choices", []), 1):
        marker = chr(0x2460 + i - 1)  # ①②③④⑤
        lines.append(f"{marker} {c.strip()}")
    if corr.get("choices"):
        lines.append("")
    sub = corr.get("subItems")
    if sub:
        lines.append("## 보기")
        lines.append("")
        for it in sub:
            lines.append(f"- {it.strip()}")
        lines.append("")
    if tail:
        lines.append(tail.rstrip("\n"))
        lines.append("")
    return "\n".join(lines).rstrip("\n") + "\n"


def main():
    years = sys.argv[1:] or ["2022", "2023", "2024", "2025", "2026"]
    grand = 0
    for y in years:
        cpath = CORR_DIR / f"{y}.json"
        if not cpath.exists():
            print(f"[{y}] 교정 JSON 없음: {cpath}")
            continue
        corrs = json.loads(cpath.read_text(encoding="utf-8"))
        n = 0
        leftover_pua = []
        for qid, corr in corrs.items():
            mdp = Q_DIR / f"{qid}.md"
            if not mdp.exists():
                print(f"  ! {qid}: MD 없음")
                continue
            fm, header, tail = split_md(mdp.read_text(encoding="utf-8"))
            new = build(fm, header, corr, tail)
            mdp.write_text(new, encoding="utf-8")
            n += 1
            chk = corr["questionText"] + " ".join(corr.get("choices", [])) + " ".join(corr.get("subItems") or [])
            if PUA(chk):
                leftover_pua.append(qid)
        print(f"[{y}] {n}개 문항 반영 완료" + (f"  ⚠ PUA잔존: {leftover_pua}" if leftover_pua else ""))
        grand += n
    print(f"총 {grand}개 문항 교정 반영")


if __name__ == "__main__":
    main()
