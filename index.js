#!/usr/bin/env node

const url = require('url')
const _ = require('underscore')
const benchmark = require('benchmark')
const proxyquire = require('proxyquire').noPreserveCache().noCallThru()

const events = require('./fixtures/events').map(validateAndParseEvent)
const chunked = _.partition(events, function (el, index) { return index % 2 })

const baselineRef = require('./vendor/underscore-baseline.ref')
const baseline_ = proxyquire('./src/stats', {
  underscore: require('./vendor/underscore-baseline')
})
const comparisonRef = require('./vendor/underscore-comparison.ref')
const comparison_ = proxyquire('./src/stats', {
  underscore: require('./vendor/underscore-comparison')
})

const run = require('./benchmark')

const suite = new benchmark.Suite()

suite
  .add(`baseline (${baselineRef.ref})`, {
    defer: true,
    fn: function (deferred) {
      run(events, chunked, baseline_)
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
      run(events, chunked, comparison_)
        .then(function () {
          deferred.resolve()
        }, function (err) {
          console.error(err)
          deferred.resolve(err)
        })
    }
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
  const u = new url.URL(urlString)
  if (!/\/$/.test(u.pathname)) {
    u.pathname += '/'
  }
  return u
}
