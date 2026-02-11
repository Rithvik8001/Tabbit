#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

TARGET_DIRS=(app features design/primitives providers)
EXCLUDE_GLOBS=(--glob '!design/tokens/**' --glob '!docs/**')

HEX_PATTERN='#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})'
FUNCTION_PATTERN='(rgb|rgba|hsl|hsla)\('

# Intentional allowlist for truly transparent escape hatches when needed.
# Keep this list minimal and prefer semantic tokens instead.
ALLOWLIST_FUNCTION_PATTERN='rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0(\.0+)?\s*\)'

echo "Scanning for hardcoded color literals outside token files..."

hex_matches="$(rg -n "${EXCLUDE_GLOBS[@]}" "$HEX_PATTERN" "${TARGET_DIRS[@]}" || true)"
function_matches="$(rg -n "${EXCLUDE_GLOBS[@]}" "$FUNCTION_PATTERN" "${TARGET_DIRS[@]}" || true)"

if [[ -n "$function_matches" ]]; then
  function_matches="$(printf '%s\n' "$function_matches" | rg -v "$ALLOWLIST_FUNCTION_PATTERN" || true)"
fi

if [[ -n "$hex_matches" || -n "$function_matches" ]]; then
  echo "Raw color usage detected."

  if [[ -n "$hex_matches" ]]; then
    echo
    echo "Hex color matches:"
    printf '%s\n' "$hex_matches"
  fi

  if [[ -n "$function_matches" ]]; then
    echo
    echo "rgb/rgba/hsl/hsla matches:"
    printf '%s\n' "$function_matches"
  fi

  exit 1
fi

echo "No raw color literals detected outside token files."
