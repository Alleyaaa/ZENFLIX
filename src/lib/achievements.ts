// Sistem Achievement & Tier Zenflix
// Tier: Newbie → Watcher → Cinephile → Film Buff → Binge Master → Marathon Master → Zenflix Legend
// Setiap achievement punya: tier, reward points, icon, nama berurutan

export interface Achievement {
  code: string
  nameId: string
  nameEn: string
  descId: string
  descEn: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  tierLabel: string
  reward: number
  conditionType: 'films' | 'watch_time' | 'series' | 'genres' | 'streak' | 'special'
  conditionValue: number
}

// Urut dari yang paling mudah → paling sulit (berurutan)
export const ACHIEVEMENTS: Achievement[] = [
  // ─── FILM (masuk akal, berurutan) ───
  { code: 'film_1', nameId: 'Film Pertama', nameEn: 'First Movie', descId: 'Tonton 1 film', descEn: 'Watch 1 movie', icon: '🎬', tier: 'bronze', tierLabel: 'Bronze', reward: 10, conditionType: 'films', conditionValue: 1 },
  { code: 'film_10', nameId: 'Penonton Aktif', nameEn: 'Active Viewer', descId: 'Tonton 10 film', descEn: 'Watch 10 movies', icon: '🍿', tier: 'bronze', tierLabel: 'Bronze', reward: 50, conditionType: 'films', conditionValue: 10 },
  { code: 'film_25', nameId: 'Penonton Setia', nameEn: 'Loyal Viewer', descId: 'Tonton 25 film', descEn: 'Watch 25 movies', icon: '🎟️', tier: 'silver', tierLabel: 'Silver', reward: 100, conditionType: 'films', conditionValue: 25 },
  { code: 'film_50', nameId: 'Cinephile', nameEn: 'Cinephile', descId: 'Tonton 50 film', descEn: 'Watch 50 movies', icon: '🎞️', tier: 'silver', tierLabel: 'Silver', reward: 250, conditionType: 'films', conditionValue: 50 },
  { code: 'film_100', nameId: 'Klub Abad', nameEn: 'Century Club', descId: 'Tonton 100 film', descEn: 'Watch 100 movies', icon: '💯', tier: 'gold', tierLabel: 'Gold', reward: 500, conditionType: 'films', conditionValue: 100 },
  { code: 'film_250', nameId: 'Binge Master', nameEn: 'Binge Master', descId: 'Tonton 250 film', descEn: 'Watch 250 movies', icon: '🏆', tier: 'gold', tierLabel: 'Gold', reward: 1000, conditionType: 'films', conditionValue: 250 },
  { code: 'film_500', nameId: 'Marathon Master', nameEn: 'Marathon Master', descId: 'Tonton 500 film', descEn: 'Watch 500 movies', icon: '🔥', tier: 'platinum', tierLabel: 'Platinum', reward: 2000, conditionType: 'films', conditionValue: 500 },
  { code: 'film_1000', nameId: 'Legenda Zenflix', nameEn: 'Zenflix Legend', descId: 'Tonton 1.000 film', descEn: 'Watch 1,000 movies', icon: '👑', tier: 'diamond', tierLabel: 'Diamond', reward: 5000, conditionType: 'films', conditionValue: 1000 },

  // ─── WATCH TIME ───
  { code: 'time_1h', nameId: '1 Jam Nonton', nameEn: '1 Hour Watch', descId: 'Tonton total 1 jam', descEn: 'Watch 1 hour total', icon: '⏱️', tier: 'bronze', tierLabel: 'Bronze', reward: 10, conditionType: 'watch_time', conditionValue: 3600 },
  { code: 'time_10h', nameId: '10 Jam Nonton', nameEn: '10 Hours Watch', descId: 'Tonton total 10 jam', descEn: 'Watch 10 hours total', icon: '⏰', tier: 'bronze', tierLabel: 'Bronze', reward: 50, conditionType: 'watch_time', conditionValue: 36000 },
  { code: 'time_50h', nameId: '50 Jam Nonton', nameEn: '50 Hours Watch', descId: 'Tonton total 50 jam', descEn: 'Watch 50 hours total', icon: '📺', tier: 'silver', tierLabel: 'Silver', reward: 150, conditionType: 'watch_time', conditionValue: 180000 },
  { code: 'time_100h', nameId: '100 Jam Nonton', nameEn: '100 Hours Watch', descId: 'Tonton total 100 jam', descEn: 'Watch 100 hours total', icon: '🕰️', tier: 'gold', tierLabel: 'Gold', reward: 400, conditionType: 'watch_time', conditionValue: 360000 },
  { code: 'time_500h', nameId: '500 Jam Nonton', nameEn: '500 Hours Watch', descId: 'Tonton total 500 jam', descEn: 'Watch 500 hours total', icon: '♾️', tier: 'platinum', tierLabel: 'Platinum', reward: 1500, conditionType: 'watch_time', conditionValue: 1800000 },
  { code: 'time_1000h', nameId: '1000 Jam Nonton', nameEn: '1000 Hours Watch', descId: 'Tonton total 1.000 jam', descEn: 'Watch 1,000 hours total', icon: '🏅', tier: 'diamond', tierLabel: 'Diamond', reward: 4000, conditionType: 'watch_time', conditionValue: 3600000 },

  // ─── SERIES ───
  { code: 'series_1', nameId: 'Series Pertama', nameEn: 'First Series', descId: 'Tonton 1 series', descEn: 'Watch 1 series', icon: '📺', tier: 'bronze', tierLabel: 'Bronze', reward: 10, conditionType: 'series', conditionValue: 1 },
  { code: 'series_10', nameId: 'Series Addict', nameEn: 'Series Addict', descId: 'Tonton 10 series', descEn: 'Watch 10 series', icon: '🍿', tier: 'silver', tierLabel: 'Silver', reward: 100, conditionType: 'series', conditionValue: 10 },
  { code: 'series_25', nameId: 'Binge Watcher', nameEn: 'Binge Watcher', descId: 'Tonton 25 series', descEn: 'Watch 25 series', icon: '🎬', tier: 'gold', tierLabel: 'Gold', reward: 300, conditionType: 'series', conditionValue: 25 },
  { code: 'series_50', nameId: 'Serial Master', nameEn: 'Series Master', descId: 'Tonton 50 series', descEn: 'Watch 50 series', icon: '👑', tier: 'platinum', tierLabel: 'Platinum', reward: 800, conditionType: 'series', conditionValue: 50 },

  // ─── SPECIAL ───
  { code: 'night_owl', nameId: 'Burung Hantu', nameEn: 'Night Owl', descId: 'Nonton jam 00.00-05.00', descEn: 'Watch between 12AM-5AM', icon: '🦉', tier: 'silver', tierLabel: 'Silver', reward: 100, conditionType: 'special', conditionValue: 1 },
  { code: 'early_bird', nameId: 'Early Bird', nameEn: 'Early Bird', descId: 'Nonton jam 05.00-08.00', descEn: 'Watch between 5AM-8AM', icon: '🐦', tier: 'silver', tierLabel: 'Silver', reward: 100, conditionType: 'special', conditionValue: 1 },
  { code: 'weekend_warrior', nameId: 'Weekend Warrior', nameEn: 'Weekend Warrior', descId: 'Nonton 3+ film di weekend', descEn: 'Watch 3+ movies in a weekend', icon: '⚔️', tier: 'gold', tierLabel: 'Gold', reward: 200, conditionType: 'special', conditionValue: 3 },
]

// ─── TIER LEVELS (naik seiring total reward points) ───
export interface UserTier {
  level: number
  nameId: string
  nameEn: string
  icon: string
  minPoints: number
  color: string
}

export const USER_TIERS: UserTier[] = [
  { level: 1, nameId: 'Newbie', nameEn: 'Newbie', icon: '🌱', minPoints: 0, color: 'text-gray-400' },
  { level: 2, nameId: 'Penonton', nameEn: 'Watcher', icon: '👀', minPoints: 100, color: 'text-blue-400' },
  { level: 3, nameId: 'Cinephile', nameEn: 'Cinephile', icon: '🎞️', minPoints: 500, color: 'text-cyan-400' },
  { level: 4, nameId: 'Film Buff', nameEn: 'Film Buff', icon: '🎬', minPoints: 1500, color: 'text-green-400' },
  { level: 5, nameId: 'Binge Master', nameEn: 'Binge Master', icon: '🍿', minPoints: 4000, color: 'text-purple-400' },
  { level: 6, nameId: 'Marathon Master', nameEn: 'Marathon Master', icon: '🔥', minPoints: 10000, color: 'text-orange-400' },
  { level: 7, nameId: 'Legenda Zenflix', nameEn: 'Zenflix Legend', icon: '👑', minPoints: 25000, color: 'text-yellow-400' },
]

// ─── Helper ───
export function getTierByPoints(points: number): UserTier {
  let tier = USER_TIERS[0]
  for (const t of USER_TIERS) {
    if (points >= t.minPoints) tier = t
  }
  return tier
}

export function getNextTier(points: number): UserTier | null {
  return USER_TIERS.find(t => points < t.minPoints) || null
}

export function getTierProgress(points: number): { current: UserTier; next: UserTier | null; pct: number } {
  const current = getTierByPoints(points)
  const next = getNextTier(points)
  if (!next) return { current, next: null, pct: 100 }
  const pct = Math.min(100, Math.round(((points - current.minPoints) / (next.minPoints - current.minPoints)) * 100))
  return { current, next, pct }
}