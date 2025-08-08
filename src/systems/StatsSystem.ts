export type StatsSnapshot = {
  sessionSeconds: number;
  kills: number;
  coins: number;
  gems: number;
  damageDealt: number;
  damageTaken: number;
  meleeHits: number;
  abilityUses: number;
  projectilesFired: number;
  enemiesSpawned: number;
  bossesDefeated: number;
  levelsGained: number;
  dps: number;
  hitlessStreak: number;
};

export class StatsSystem {
  private startMs = Date.now();
  kills = 0;
  coins = 0;
  gems = 0;
  damageDealt = 0;
  damageTaken = 0;
  meleeHits = 0;
  abilityUses = 0;
  projectilesFired = 0;
  enemiesSpawned = 0;
  bossesDefeated = 0;
  levelsGained = 0;
  private lastDamageMs = 0;
  private lastDealMs = 0;
  private hitlessStreak = 0;

  onEnemySpawn(): void { this.enemiesSpawned += 1; }
  onEnemyDefeated(): void { this.kills += 1; this.hitlessStreak += 1; }
  onBossDefeated(): void { this.bossesDefeated += 1; }
  onCoin(amount = 1): void { this.coins += amount; }
  onGem(amount = 1): void { this.gems += amount; }

  onDamageDealt(amount: number): void {
    this.damageDealt += Math.max(0, amount);
    this.lastDealMs = Date.now();
    this.meleeHits += 1;
  }

  onDamageTaken(amount: number): void {
    this.damageTaken += Math.max(0, amount);
    this.lastDamageMs = Date.now();
    this.hitlessStreak = 0;
  }

  onAbilityUse(): void { this.abilityUses += 1; }
  onProjectileFired(): void { this.projectilesFired += 1; }
  onLevelGain(): void { this.levelsGained += 1; }

  getSnapshot(): StatsSnapshot {
    const seconds = Math.max(1, Math.round((Date.now() - this.startMs) / 1000));
    const dps = Math.round((this.damageDealt / seconds) * 10) / 10;
    return {
      sessionSeconds: seconds,
      kills: this.kills,
      coins: this.coins,
      gems: this.gems,
      damageDealt: this.damageDealt,
      damageTaken: this.damageTaken,
      meleeHits: this.meleeHits,
      abilityUses: this.abilityUses,
      projectilesFired: this.projectilesFired,
      enemiesSpawned: this.enemiesSpawned,
      bossesDefeated: this.bossesDefeated,
      levelsGained: this.levelsGained,
      dps,
      hitlessStreak: this.hitlessStreak,
    };
  }
}