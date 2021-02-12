#!/bin/sh

# Usage ./pull.sh [baseline-git-ref] [comparison-git-ref]

set -e

rm -rf underscore
rm -f vendor/*.js

git clone git://github.com/jashkenas/underscore.git

cd underscore

git checkout $1
cp underscore.js ./../vendor/underscore-baseline.js

git checkout $2
cp underscore.js ./../vendor/underscore-comparison.js

cd ..
rm -rf underscore

echo ""
echo "Baseline for benchmark is now at ref $1, comparison is now at ref $2"
echo ""
