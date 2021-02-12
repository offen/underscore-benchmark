#!/bin/sh

# Usage ./pull.sh [baseline-git-ref] [comparison-git-ref]

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Expected to receive two refs. Cannot continue."
  exit 1
fi

rm -rf underscore
rm -f vendor/*.js

git clone git://github.com/jashkenas/underscore.git

cd underscore

git checkout $1
cp underscore.js ./../vendor/underscore-baseline.js
echo "{\"ref\":\"$1\"}" > ./../vendor/underscore-baseline.ref.json

git checkout $2
cp underscore.js ./../vendor/underscore-comparison.js
echo "{\"ref\":\"$2\"}" > ./../vendor/underscore-comparison.ref.json

cd ..
rm -rf underscore

echo ""
echo "Baseline for benchmark is now at ref $1, comparison is now at ref $2"
echo ""
