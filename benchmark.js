module.exports = function (events, stats) {
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
    stats.returningUsers(events, events),
    stats.retention(events, events, events),
    stats.pageviews(events),
    stats.visitors(events),
    stats.accounts(events),
    stats.uniqueSessions(events)
  ])
}
