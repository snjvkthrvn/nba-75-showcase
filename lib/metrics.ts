/**
 * Returns 0 instead of NaN when dividing by zero.
 */
const safeDivide = (numerator: number, denominator: number): number =>
  denominator === 0 ? 0 : numerator / denominator;

/**
 * Calculates effective field-goal percentage.
 *
 * Formula: (FGM + 0.5 × 3PM) ÷ FGA
 */
export const effectiveFieldGoalPercentage = (
  fieldGoalsMade: number,
  threesMade: number,
  fieldGoalsAttempted: number,
): number =>
  safeDivide(fieldGoalsMade + 0.5 * threesMade, fieldGoalsAttempted);

/**
 * Calculates true shooting percentage.
 *
 * Formula: PTS ÷ (2 × (FGA + 0.44 × FTA))
 */
export const trueShootingPercentage = (
  points: number,
  fieldGoalsAttempted: number,
  freeThrowsAttempted: number,
): number =>
  safeDivide(points, 2 * (fieldGoalsAttempted + 0.44 * freeThrowsAttempted));

/**
 * Normalizes a counting stat on a per-game basis.
 *
 * Formula: total ÷ games
 */
export const perGame = (total: number, games: number): number =>
  safeDivide(total, games);

/**
 * Normalizes a counting stat to 36 minutes.
 *
 * Formula: (total ÷ minutes) × 36
 */
export const per36 = (total: number, minutes: number): number =>
  safeDivide(total, minutes) * 36;

/**
 * Normalizes a counting stat to 75 possessions for cross-era comparison.
 *
 * Formula: (total ÷ possessions) × 75
 */
export const per75Possessions = (
  total: number,
  possessions: number,
): number => safeDivide(total, possessions) * 75;

/**
 * Calculates free-throw rate (FTA per field-goal attempt).
 *
 * Formula: FTA ÷ FGA
 */
export const freeThrowRate = (
  freeThrowsAttempted: number,
  fieldGoalsAttempted: number,
): number => safeDivide(freeThrowsAttempted, fieldGoalsAttempted);

/**
 * Calculates assist percentage estimate.
 *
 * Formula: AST ÷ teammates' field goals while on court
 * (approximated here as AST ÷ (FGM - FGM_player))
 */
export const assistShare = (
  assists: number,
  teamFieldGoalsMade: number,
  playerFieldGoalsMade: number,
): number => safeDivide(assists, Math.max(teamFieldGoalsMade - playerFieldGoalsMade, 0));

/**
 * Calculates rebound share estimate.
 *
 * Formula: REB ÷ team rebounds while on court
 */
export const reboundShare = (
  rebounds: number,
  teamRebounds: number,
): number => safeDivide(rebounds, teamRebounds);

/**
 * Calculates scoring efficiency in points per shot attempt.
 *
 * Formula: PTS ÷ (FGA + 0.44 × FTA)
 */
export const pointsPerShot = (
  points: number,
  fieldGoalsAttempted: number,
  freeThrowsAttempted: number,
): number =>
  safeDivide(points, fieldGoalsAttempted + 0.44 * freeThrowsAttempted);
