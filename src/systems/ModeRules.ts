import { GameMode } from './ModeSystem';

export type ModeParams = {
  spawnDelayMinMs: number;
  spawnDelayMaxMs: number;
  enemyHpMultiplier: number;
  enemySpeedMultiplier: number;
  playerHpMultiplier: number;
  timeLimitMs?: number; // for timeAttack
  waveSize?: number;    // for arena
  bossEveryMs?: number; // for bossRush
  abilitiesFree?: boolean; // for training
  playerTakesDamage?: boolean;
};

export function getModeParams(mode: GameMode, levelIndex: number): ModeParams {
  switch (mode) {
    case 'story':
      return { spawnDelayMinMs: Math.max(300, 1000 - levelIndex * 10), spawnDelayMaxMs: Math.max(500, 1800 - levelIndex * 12), enemyHpMultiplier: 1 + levelIndex * 0.03, enemySpeedMultiplier: 1, playerHpMultiplier: 1, playerTakesDamage: true };
    case 'endless':
      return { spawnDelayMinMs: 280, spawnDelayMaxMs: 900, enemyHpMultiplier: 1 + levelIndex * 0.05, enemySpeedMultiplier: 1.1, playerHpMultiplier: 1, playerTakesDamage: true };
    case 'arena':
      return { spawnDelayMinMs: 200, spawnDelayMaxMs: 400, enemyHpMultiplier: 1 + levelIndex * 0.04, enemySpeedMultiplier: 1.05, playerHpMultiplier: 1, waveSize: 12 + Math.floor(levelIndex * 0.8), playerTakesDamage: true };
    case 'bossRush':
      return { spawnDelayMinMs: 900, spawnDelayMaxMs: 1400, enemyHpMultiplier: 1.4 + levelIndex * 0.08, enemySpeedMultiplier: 0.95, playerHpMultiplier: 1.1, bossEveryMs: 15000, playerTakesDamage: true };
    case 'timeAttack':
      return { spawnDelayMinMs: 260, spawnDelayMaxMs: 780, enemyHpMultiplier: 1 + levelIndex * 0.03, enemySpeedMultiplier: 1.05, playerHpMultiplier: 1, timeLimitMs: 90_000, playerTakesDamage: true };
    case 'challenge':
      return { spawnDelayMinMs: 240, spawnDelayMaxMs: 760, enemyHpMultiplier: 1.2 + levelIndex * 0.06, enemySpeedMultiplier: 1.25, playerHpMultiplier: 0.75, playerTakesDamage: true };
    case 'training':
      return { spawnDelayMinMs: 320, spawnDelayMaxMs: 1100, enemyHpMultiplier: 1, enemySpeedMultiplier: 1, playerHpMultiplier: 10, abilitiesFree: true, playerTakesDamage: false };
    default:
      return { spawnDelayMinMs: 400, spawnDelayMaxMs: 1200, enemyHpMultiplier: 1, enemySpeedMultiplier: 1, playerHpMultiplier: 1, playerTakesDamage: true };
  }
}