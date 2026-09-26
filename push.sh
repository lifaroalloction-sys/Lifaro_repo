#!/bin/bash
set -e

cd "$(dirname "$0")"

if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to commit."
  exit 0
fi

read -p "Enter commit message: " commit_message

if [ -z "$commit_message" ]; then
  echo "Commit message cannot be empty."
  exit 1
fi

git add .
git commit -m "$commit_message"
git push

echo "Push complete."
