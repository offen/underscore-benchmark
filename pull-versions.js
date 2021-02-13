#!/usr/bin/env node

const util = require('util')
const fs = require('fs')
const rimraf = util.promisify(require('rimraf'))
const Git = require('nodegit')

const writeFile = util.promisify(fs.writeFile)

const baselineRef = process.argv[2]
const comparisonRef = process.argv[3]

;(async () => {
  if (!baselineRef || !comparisonRef) {
    throw new Error('Expected to receive two ref args. Cannot continue.')
  }

  await rimraf('./underscore')
  const repo = await Git.Clone('git://github.com/jashkenas/underscore.git', './underscore')

  const checkouts = [{ name: 'baseline', ref: baselineRef }, { name: 'comparison', ref: comparisonRef }]
  for (const { name, ref } of checkouts) {
    let commit
    try {
      commit = await repo.getReferenceCommit(ref)
    } catch (err) {
      commit = await repo.getCommit(ref)
    }
    const bundle = await commit.getEntry('underscore.js')
    await writeFile(
      `./vendor/underscore-${name}.js`, await bundle.getBlob()
    )
    await writeFile(
      `./vendor/underscore-${name}.ref.json`, JSON.stringify({ ref })
    )
  }
})()
  .then(function () {
    console.log('Baseline for benchmark is now at ref %s, comparison is now at ref %s', baselineRef, comparisonRef)
    return 0
  })
  .catch(function (err) {
    console.error('Error pulling underscore versions to compare.')
    console.error(err)
    return 1
  })
  .then(async function (exitCode) {
    await rimraf('./underscore')
    process.exit(exitCode)
  })
