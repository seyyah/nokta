#!/usr/bin/env bash
# pre-commit hook kurar: typecheck + jest çalıştırır.
# Submission audit'inde 0/45 öğrenci git hook eklemiş — burada zero-dep kuruluyor.
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOK_PATH="$REPO_ROOT/.git/hooks/pre-commit"
THIS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cat > "$HOOK_PATH" <<EOF
#!/usr/bin/env bash
set -e
cd "$THIS_DIR"
echo "[pre-commit] typecheck"
npm run --silent typecheck
echo "[pre-commit] test"
npm test --silent
EOF
chmod +x "$HOOK_PATH"
echo "Pre-commit hook kuruldu: $HOOK_PATH"
