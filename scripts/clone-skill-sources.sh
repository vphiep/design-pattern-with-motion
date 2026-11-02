#!/usr/bin/env bash
# Helper script to clone git animation skill sources for offline reference
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$SCRIPT_DIR/../.references"

mkdir -p "$TARGET_DIR"

declare -A REPOS=(
  ["animejs"]="https://github.com/juliangarnier/anime.git"
  ["animate-css"]="https://github.com/animate-css/animate.css.git"
  ["gsap"]="https://github.com/greensock/GSAP.git"
  ["motion"]="https://github.com/motiondivision/motion.git"
  ["tailwindcss-animate"]="https://github.com/jamiebuilds/tailwindcss-animate.git"
  ["tailwind-motion"]="https://github.com/romboHQ/tailwind-motion.git"
  ["rough"]="https://github.com/rough-stuff/rough.git"
  ["react-spring"]="https://github.com/pmndrs/react-spring.git"
  ["lottie-web"]="https://github.com/airbnb/lottie-web.git"
)

echo "Cloning/Updating Animation Skill Reference Sources into $TARGET_DIR..."

for name in "${!REPOS[@]}"; do
  dest="$TARGET_DIR/$name"
  url="${REPOS[$name]}"
  if [ -d "$dest/.git" ]; then
    echo "Updating $name..."
    git -C "$dest" pull --depth 1
  else
    echo "Cloning $name (shallow clone)..."
    git clone --depth 1 "$url" "$dest"
  fi
done

echo "Done! Sources ready in $TARGET_DIR."
