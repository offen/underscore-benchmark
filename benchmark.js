module.exports = function (stats) {
  return stats.bounceRate([
    { payload: { sessionId: 'session-a' } },
    { payload: { sessionId: 'session-b' } },
    { payload: { sessionId: 'session-c' } }
  ])
}
