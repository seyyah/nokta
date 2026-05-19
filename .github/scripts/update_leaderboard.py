#!/usr/bin/env python3
"""
LEADERBOARD.md regenerator.

Inputs:
  - scoring/scores.json      (produced by .github/scripts/score.py)
  - scoring/similarity.json  (produced by .github/scripts/similarity_check.py)
  - gh pr list --state merged --json number,author,files,mergedAt
    (requires GH_TOKEN; available as ${{ github.token }} inside Actions)

Output:
  - LEADERBOARD.md (overwritten; do not hand-edit — changes will be lost)

Mapping logic: a submission folder is attributed to the *latest* merged PR that
touched any path under submissions/<name>/. Direct-to-main commits with no PR
show "—" in the PR / Author columns.
"""
from __future__ import annotations

import json
import subprocess
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

SCORING_DIR = Path("scoring")
LEADERBOARD_FILE = Path("LEADERBOARD.md")
TOP_N = 15


def load_json(path: Path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def pr_map_from_gh() -> dict[str, dict]:
    """submission folder name -> {"pr": int, "author": str}; latest merged PR wins."""
    try:
        result = subprocess.run(
            [
                "gh", "pr", "list", "--state", "merged", "--limit", "500",
                "--json", "number,author,files,mergedAt",
            ],
            capture_output=True, text=True, check=True,
        )
        prs = json.loads(result.stdout)
    except (subprocess.CalledProcessError, FileNotFoundError, json.JSONDecodeError) as e:
        print(f"WARN: gh pr list failed — author/PR columns will be empty: {e}")
        return {}

    mapping: dict[str, dict] = {}
    prs.sort(key=lambda p: p.get("mergedAt") or "")
    for pr in prs:
        author = (pr.get("author") or {}).get("login", "")
        number = pr["number"]
        for f in pr.get("files", []):
            parts = f.get("path", "").split("/")
            if len(parts) >= 2 and parts[0] == "submissions":
                mapping[parts[1]] = {"pr": number, "author": author}
    return mapping


def render(scores: dict, similarity: dict, pr_map: dict[str, dict]) -> str:
    results = scores.get("results", [])
    flagged = {f["copycat"] for f in similarity.get("flags", [])}

    by_author: dict[str, list] = defaultdict(list)
    for r in results:
        info = pr_map.get(r["submission"], {})
        author = info.get("author") or ""
        if not author:
            continue
        by_author[author].append((r["final_auto"], r["submission"], info.get("pr")))

    top = []
    for author, subs in by_author.items():
        subs.sort(reverse=True)
        best_score, _, best_pr = subs[0]
        top.append({
            "author": author,
            "best_score": best_score,
            "submission_count": len(subs),
            "best_pr": best_pr,
        })
    top.sort(key=lambda x: (-x["best_score"], -x["submission_count"], x["author"].lower()))

    out: list[str] = []
    out.append("# 🏆 Nokta Leaderboard\n")
    out.append(
        "Otomatik puanlama: `.github/scripts/score.py` rubric ile her submission'a "
        "0–110 arası skor verir. Anti-slop + APK düzeltmesi dahil. "
        "\"Çılgınlık +10\" bonusu demo gününde elden eklenecek.\n"
    )
    out.append("**Rubric:** Delivery 35 + Scope 25 + Anti-Slop 20 + Trace 20 + APK (±3/−5) = 110 max.\n")
    out.append("---\n")
    out.append("## Top Contributors\n")
    out.append("| Rank | Contributor | Best Score | Submissions | Best PR |")
    out.append("|---|---|---|---|---|")
    for i, t in enumerate(top[:TOP_N], 1):
        pr_link = f"#{t['best_pr']}" if t["best_pr"] else "—"
        out.append(
            f"| {i} | [@{t['author']}](https://github.com/{t['author']}) | "
            f"**{t['best_score']}** | {t['submission_count']} | {pr_link} |"
        )
    out.append("")

    out.append("## All Submissions\n")
    out.append("| Rank | Submission | Score | Delivery | Scope | Anti-Slop | Trace | APK | Author | PR | Flags |")
    out.append("|---|---|---|---|---|---|---|---|---|---|---|")
    sorted_results = sorted(results, key=lambda r: -r["final_auto"])
    for i, r in enumerate(sorted_results, 1):
        b = r["breakdown"]
        flag = "⚠️ similarity" if r["submission"] in flagged else ""
        apk = "+3 ✅" if r["apk_adjustment"] > 0 else "−5 ❌"
        info = pr_map.get(r["submission"], {})
        author = info.get("author") or ""
        author_cell = f"@{author}" if author else "—"
        pr_cell = f"#{info['pr']}" if info.get("pr") else "—"
        out.append(
            f"| {i} | `{r['submission']}` | **{r['final_auto']}** | "
            f"{b['delivery']['points']}/35 | {b['scope']['points']}/25 | "
            f"{b['antislop']['points']}/20 | {b['trace']['points']}/20 | {apk} | "
            f"{author_cell} | {pr_cell} | {flag} |"
        )
    out.append("")

    out.append("## Anti-Slop (Similarity ≥ 0.80)\n")
    out.append(
        "TF-IDF cosine similarity; `.github/scripts/similarity_check.py` detayını üretir. "
        "Daha geç commit eden \"copycat\" sayılır ve anti-slop puanı %35 ceza alır.\n"
    )
    out.append("| Original | Copycat | Similarity |")
    out.append("|---|---|---|")
    flags_sorted = sorted(similarity.get("flags", []), key=lambda f: -f["similarity"])
    for f in flags_sorted:
        out.append(f"| `{f['original']}` | `{f['copycat']}` | **{f['similarity']:.3f}** |")
    out.append("")

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    contributors = {info.get("author") for info in pr_map.values() if info.get("author")}
    out.append("---\n")
    out.append(f"**Last Updated:** {now}\n")
    out.append(f"**Total Contributors:** {len(contributors)}\n")
    out.append(f"**Total Submissions:** {len(results)}\n")
    out.append(f"**Similarity flags:** {len(flags_sorted)}\n")
    out.append("")
    out.append(
        "🤖 Otomatik üretildi — kaynak: `scoring/scores.json` + `gh pr list --state merged`. "
        "Manuel \"Çılgınlık +10\" bonusu eklenmedi."
    )

    return "\n".join(out) + "\n"


def main() -> None:
    scores = load_json(SCORING_DIR / "scores.json", {"count": 0, "results": []})
    similarity = load_json(SCORING_DIR / "similarity.json", {"flags": [], "scores": {}})
    pr_map = pr_map_from_gh()
    LEADERBOARD_FILE.write_text(render(scores, similarity, pr_map), encoding="utf-8")
    print(f"Wrote {LEADERBOARD_FILE} — {scores.get('count', 0)} submissions, "
          f"{len(pr_map)} mapped to PRs")


if __name__ == "__main__":
    main()
