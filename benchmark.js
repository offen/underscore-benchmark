module.exports = function (events, chunked, stats) {
  return Promise.all([
    stats.bounceRate(events),
    stats.referrers(events),
    stats.campaigns(events),
    stats.sources(events),
    stats.pages(events),
    stats.activePages(events),
    stats.avgPageload(events),
    stats.avgPageDepth(events),
    stats.exitPages(events),
    stats.landingPages(events),
    stats.mobileShare(events),
    stats.returningUsers(...chunked),
    stats.retention(...chunked),
    stats.pageviews(events),
    stats.visitors(events),
    stats.accounts(events),
    stats.uniqueSessions(events)
  ])
}
