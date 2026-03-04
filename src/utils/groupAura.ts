/**
 * Group Aura Utility
 * Calculates the collective aura of a circle based on member activity.
 */

export function calculateGroupAura(memberAuras: number[]): number {
  if (!memberAuras || memberAuras.length === 0) return 0;
  
  const sum = memberAuras.reduce((acc, curr) => acc + curr, 0);
  return Math.round(sum / memberAuras.length);
}

/**
 * Calculates weighted aura considering consistency (streak)
 * Used for more advanced insights if needed
 */
export function calculateWeightedGroupAura(members: { auraLevel: number; streakCount: number }[]): number {
  if (!members || members.length === 0) return 0;

  let totalWeightedAura = 0;
  let totalWeight = 0;

  members.forEach(member => {
    // Weight increases slightly with streak (max 1.5x at 30 days)
    const weight = 1 + Math.min(member.streakCount, 30) / 60;
    totalWeightedAura += member.auraLevel * weight;
    totalWeight += weight;
  });

  return Math.round(totalWeightedAura / totalWeight);
}
