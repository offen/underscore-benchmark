#!/usr/bin/env node

// Usage ./generate-fixtures.js [num-users] [outfile]

const fs = require('fs')

const _ = require('underscore')
const uuid = require('uuid')
const ulid = require('ulid')
const crypto = require('crypto')

const numUsers = parseInt(process.argv[2], 10)
const outfile = process.argv[3]

if (!numUsers) {
  console.error('Expected non-zero number of users to be given as first argument.')
  process.exit(1)
}

if (!outfile) {
  console.error('Expected outfile to be given as second argument.')
  process.exit(1)
}

if (fs.existsSync(outfile)) {
  console.log('outfile already exists, skipping fixture generation')
  process.exit(0)
}

const accountId = uuid.v4()

console.log('Now creating some fixture data. This might take a little while.')

let events = Array.from({ length: numUsers }).map(function () {
  const sessionLength = _.sample(_.range(1, 5))
  const sessions = newFakeSession(sessionLength)
  const secretId = crypto.randomBytes(16).toString('hex')
  return sessions.map(function (payload) {
    return {
      accountId,
      eventId: ulid.ulid(payload.timestamp.getTime()),
      secretId,
      payload
    }
  })
})

events = _.flatten(events, false)

fs.writeFile(outfile, JSON.stringify(events, null, 2), function (err) {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log('Finished creating fixture data for %d users at %s', numUsers, outfile)
})

function newFakeSession (length) {
  const sessionId = uuid.v4()
  const isMobileSession = Math.random() > 0.66
  const timestamp = Date.now() - randomInRange(0, 600000)
  return Array.from({ length }).map(function () {
    return {
      type: 'PAGEVIEW',
      href: randomPage(),
      title: 'Page Title',
      referrer: Math.random() > 0.75 ? randomReferrer() : '',
      pageload: randomInRange(400, 1200),
      isMobile: isMobileSession,
      timestamp: new Date(timestamp + randomInRange(0, 1000)),
      sessionId: sessionId
    }
  })
}

function randomInRange (lower, upper) {
  return _.sample(_.range(lower, upper + 1))
}

function randomPage () {
  const pick = _.sample([
    '/',
    '/about/',
    '/blog/',
    '/imprint/',
    '/landing-page/',
    '/landing-page/?utm_source=Example_Source',
    '/landing-page/?utm_campaign=Example_Campaign',
    '/intro/',
    '/contact/'
  ])
  return 'https://www.example.com' + pick
}

function randomReferrer () {
  return _.sample([
    'https://www.offen.dev',
    'https://t.co/xyz',
    'https://example.net/'
  ])
}
