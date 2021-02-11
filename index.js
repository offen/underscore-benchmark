#!/usr/bin/env node
const benchmark = require('benchmark')
const proxyquire = require('proxyquire').noPreserveCache().noCallThru()

const npm = proxyquire('./src/stats', {
  underscore: require('underscore')
})
const master = proxyquire('./src/stats', {
  underscore: require('underscore-master')
})
const functionalStyle = proxyquire('./src/stats', {
  underscore: require('underscore-functional')
})

const run = require('./benchmark')

const suite = new benchmark.Suite()

suite
  .add('npm (1.12.0)', {
    defer: true,
    fn: function (deferred) {
      run(npm)
        .then(function () {
          deferred.resolve()
        }, function (err) {
          deferred.reject(err)
        })
    }
  })
  .add('master (c9b4b63fd08847281260205b995ae644f6f2f4d2)', {
    defer: true,
    fn: function (deferred) {
      run(master)
        .then(function () {
          deferred.resolve()
        }, function (err) {
          deferred.reject(err)
        })
    }
  })
  .add('functional style (eaba5b58fa8fd788a5be1cf3b66e81f8293f70f9)', {
    defer: true,
    fn: function (deferred) {
      run(functionalStyle)
        .then(function () {
          deferred.resolve()
        }, function (err) {
          deferred.reject(err)
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
