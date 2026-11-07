// Volunteer ranking. Every event a volunteer completes earns points, the coordinator's
// 1-5 star rating for that event adds or removes a bonus, and a no-show costs points.
// Tiers (New Joiner -> Trained -> Experienced -> 5-Star Elite) and leaderboard order follow from the total. Tune the numbers in RANKING.

export const RANKING = {
  pointsPerCompletedEvent: 10,
  ratingBonus: { 1: -10, 2: -5, 3: 0, 4: 5, 5: 10 },
  noShowPenalty: 15,
  tiers: [
    // highest first
    { name: '5-Star Elite', minPoints: 300, about: 'Outstanding performance and leadership' },
    { name: 'Experienced', minPoints: 150, about: 'Consistent, reliable event crew' },
    { name: 'Trained', minPoints: 50, about: 'Completed basic event training' },
    { name: 'New Joiner', minPoints: 0, about: 'Newly registered volunteer' },
  ],
};

export function rankingRules() {
  return {
    pointsPerCompletedEvent: RANKING.pointsPerCompletedEvent,
    ratingBonusByStars: RANKING.ratingBonus,
    noShowPenalty: -RANKING.noShowPenalty,
    tiers: RANKING.tiers,
    ordering: 'Points, then average rating, then events completed. Volunteers rank once they have one reviewed event.',
    example: 'A completed event rated 5 stars is worth 10 + 10 = 20 points; rated 3 stars, 10 points; a no-show, -15.',
  };
}

// Stats for one volunteer from their applications. Only reviewed applications count.
export function computeStats(applications = []) {
  let completedEvents = 0;
  let noShows = 0;
  let ratingSum = 0;
  let ratingsCount = 0;
  let points = 0;
  for (const app of applications) {
    if (app.status === 'completed') {
      completedEvents++;
      points += RANKING.pointsPerCompletedEvent;
      const rating = app.review?.rating;
      if (rating) {
        ratingsCount++;
        ratingSum += rating;
        points += RANKING.ratingBonus[rating] ?? 0;
      }
    } else if (app.status === 'no_show') {
      noShows++;
      points -= RANKING.noShowPenalty;
    }
  }
  points = Math.max(0, points);
  const tierIndex = RANKING.tiers.findIndex((t) => points >= t.minPoints);
  const next = tierIndex > 0 ? RANKING.tiers[tierIndex - 1] : null;
  return {
    points,
    tier: RANKING.tiers[tierIndex].name,
    nextTier: next ? { name: next.name, pointsNeeded: next.minPoints - points } : null,
    completedEvents,
    noShows,
    averageRating: ratingsCount ? Math.round((ratingSum / ratingsCount) * 10) / 10 : null,
    ratingsCount,
    // Share of reviewed events the volunteer actually turned up for.
    reliability: completedEvents + noShows ? Math.round((completedEvents / (completedEvents + noShows)) * 100) : null,
  };
}

// Returns statsOf(volunteerId), computed from all applications and cached.
export function statsLookup(applications) {
  const byVolunteer = new Map();
  for (const app of applications) {
    if (!byVolunteer.has(app.volunteerId)) byVolunteer.set(app.volunteerId, []);
    byVolunteer.get(app.volunteerId).push(app);
  }
  const cache = new Map();
  return (id) => {
    if (!cache.has(id)) cache.set(id, computeStats(byVolunteer.get(id)));
    return cache.get(id);
  };
}

const compareStanding = (a, b) =>
  b.stats.points - a.stats.points ||
  (b.stats.averageRating ?? 0) - (a.stats.averageRating ?? 0) ||
  b.stats.completedEvents - a.stats.completedEvents;

// Ranked entries ({ volunteer, stats, rank }) for active volunteers with at least one
// reviewed event. Volunteers level on points, rating and events share a rank.
export function rankVolunteers(volunteers, statsOf) {
  const entries = volunteers
    .filter((v) => v.status === 'active')
    .map((v) => ({ volunteer: v, stats: statsOf(v.id) }))
    .filter((e) => e.stats.completedEvents + e.stats.noShows > 0)
    .sort((a, b) => compareStanding(a, b) || a.volunteer.createdAt.localeCompare(b.volunteer.createdAt));
  entries.forEach((entry, i) => {
    entry.rank = i > 0 && compareStanding(entries[i - 1], entry) === 0 ? entries[i - 1].rank : i + 1;
  });
  return entries;
}
