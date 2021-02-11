const events = require('./fixtures/events')

module.exports = function (stats) {
  return stats.bounceRate(events)
}
