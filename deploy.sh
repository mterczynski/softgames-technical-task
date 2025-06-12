#!/usr/bin/env bash
# Exit immediately if any command fails
set -e

# This line determines the absolute path to the directory containing this script, regardless of where the script is called from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"
# 1. Reinstall, test, build
rm -rf node_modules;
rm -rf dist;
npm i;
npm run build;

# 2. Move client build to mterczynski.github.io
cp -r ./dist/* ../mterczynski.github.io/softgames-24h-challenge/
cd ../mterczynski.github.io

# 3. Commit and push
git add .
git commit -a -m "Update softgames 24h challenge build"
git push

# todo - deploy server to some free/cheap cloud solution
