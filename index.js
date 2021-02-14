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
var runBenchmarkWith = require('./run-benchmark')

require('es6-promise').polyfill()
require('url-polyfill')

// N.B.: this usage of underscore is not relevant to the benchmark, so
// we just consume the version from npm.
var chunkedEvents = _.partition(events, function (el, index) { return index % 2 })

var isBrowser = typeof window !== 'undefined'

// Testers can limit the execution of tests to a single case by:
// 1. using the CLI pass either `baseline` or `comparison` as a command
//    line arg, (e.g. `node ./index.js baseline`)
// 2. using the browser append either `baseline` or `comparison` to the URL's
//    hash (e.g. http://localhost:9966/#baseline)
var runOnly = isBrowser
  ? window.location.hash.replace(/^#/, '')
  : process.argv[2]

var logger = new Logger(isBrowser)

var suite = new benchmark.Suite()
var tests = []

if (!runOnly || runOnly === 'baseline') {
  tests.push({
    display: `baseline (${baselineRef.ref})`,
    _: baseline_
  })
}

if (!runOnly || runOnly === 'comparison') {
  tests.push({
    display: `comparison (${comparisonRef.ref})`,
    _: comparison_
  })
}

if (!tests.length) {
  logger.log('No tests to run, did you pass an unknown test name?').flush()
  if (isBrowser) {
    throw new Error('No tests to run, cannot continue.')
  }
  process.exit(1)
}

_.each(tests, function (test) {
  suite.add(test.display, {
    defer: true,
    fn: function (deferred) {
      runBenchmarkWith(events, chunkedEvents, stats(test._))
        .then(function () {
          deferred.resolve()
        }, function (err) {
          console.error(err)
          deferred.resolve(err)
        })
    }
  })
})

suite
  .on('start', function () {
    logger.log(
      `Now running bechmark with ${_.pluck(tests, 'display').join(' and ')}`
    ).flush()
  })
  .on('cycle', function (event) {
    logger.log(String(event.target))
  })
  .on('complete', function () {
    if (!runOnly) {
      logger.log('Fastest is ' + this.filter('fastest').map('name'))
    }
    logger.flush()
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

function Logger (isBrowser) {
  var messages = []
  this.log = function (message) {
    if (!isBrowser) {
      console.log(message)
      return this
    }
    messages.push(message)
    return this
  }

  this.flush = function () {
    if (!isBrowser) {
      return this
    }
    document.write(messages.join('<br>'))
    messages = []
    return this
  }
}
