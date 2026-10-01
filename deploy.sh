#!/bin/sh
# Сборка и публикация на GitHub Pages (ветка gh-pages)
set -e
cd "$(dirname "$0")"
npm run build
cd dist
touch .nojekyll
rm -rf .git && git init -q -b gh-pages
git add -A && git -c user.name=Drnemo commit -qm "deploy $(date -Iseconds)"
git -c credential.helper= -c credential.helper='!gh auth git-credential' push -qf "$(git -C .. remote get-url origin)" gh-pages
rm -rf .git
