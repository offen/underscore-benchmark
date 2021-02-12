#!/usr/bin/env node

var url = require('url')
var _ = require('underscore')
var benchmark = require('benchmark')
// Making Benchmark globally available is needed when running in the browsers
global.Benchmark = benchmark

var events = _.map(require('./fixtures/events'), validateAndParseEvent)
var baselineRef = require('./vendor/underscore-baseline.ref')
var baseline_ = require('./vendor/underscore-baseline')
var comparisonRef = require('./vendor/underscore-comparison.ref')
var comparison_ = require('./vendor/underscore-comparison')
var stats = require('./src/stats')
var run = require('./benchmark')

require('es6-promise').polyfill()
require('url-polyfill')

// N.B.: this usage of underscore is not relevant to the benchmark, so
// we just consume the version from npm.
var chunked = _.partition(events, function (el, index) { return index % 2 })

var suite = new benchmark.Suite()

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
  _.each(['href', 'rawHref', 'referrer'], function (key) {
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
