#!/usr/bin/env node

const url = require('url')
const benchmark = require('benchmark')
const proxyquire = require('proxyquire').noPreserveCache().noCallThru()

const events = require('./fixtures/events').map(validateAndParseEvent)

const master = proxyquire('./src/stats', {
  underscore: require('underscore-master')
})
const functionalStyle = proxyquire('./src/stats', {
  underscore: require('underscore-functional')
})

const run = require('./benchmark')

const suite = new benchmark.Suite()

suite
  .add('master (c9b4b63fd08847281260205b995ae644f6f2f4d2)', {
    defer: true,
    fn: function (deferred) {
      run(events, master)
        .then(function () {
          deferred.resolve()
        }, function (err) {
          console.error(err)
          deferred.resolve(err)
        })
    }
  })
  .add('functional style (eaba5b58fa8fd788a5be1cf3b66e81f8293f70f9)', {
    defer: true,
    fn: function (deferred) {
      run(events, functionalStyle)
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
