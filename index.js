#!/usr/bin/env node

const url = require('url')
const _ = require('underscore')
const benchmark = require('benchmark')
// Making Benchmark globally available is needed when running in the browsers
global.Benchmark = benchmark

const events = require('./fixtures/events').map(validateAndParseEvent)
const baselineRef = require('./vendor/underscore-baseline.ref')
const baseline_ = require('./vendor/underscore-baseline')
const comparisonRef = require('./vendor/underscore-comparison.ref')
const comparison_ = require('./vendor/underscore-comparison')
const stats = require('./src/stats')
const run = require('./benchmark')

// N.B.: this usage of underscore is not relevant to the benchmark, so
// we just consume the version from npm.
const chunked = _.partition(events, function (el, index) { return index % 2 })

const suite = new benchmark.Suite()

suite
  .add(`baseline (${baselineRef.ref})`, {
    defer: true,
    fn: function (deferred) {
      run(events, chunked, stats(baseline_))
        .then(function () {
          deferred.resolve()
        }, function (err) {
          console.error(err)
          deferred.resolve(err)
        })
    }
  })
  .add(`comparison (${comparisonRef.ref})`, {
    defer: true,
    fn: function (deferred) {
      run(events, chunked, stats(comparison_))
        .then(function () {
          deferred.resolve()
        }, function (err) {
          console.error(err)
          deferred.resolve(err)
        })
    }
  })
  .on('start', function () {
    console.log(`Now running bechmark with "baseline (${baselineRef.ref})" and "comparison (${comparisonRef.ref})"`)
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run()

function validateAndParseEvent (event) {
  ;['href', 'rawHref', 'referrer'].forEach(function (key) {
    event.payload[key] = event.payload[key] && normalizeURL(event.payload[key])
  })
  return event
}

function normalizeURL (urlString) {
  const u = new (url.URL || global.URL)(urlString)
  if (!/\/$/.test(u.pathname)) {
    u.pathname += '/'
  }
  return u
}
