export class LevelSystem {
  seed: number;
  levelIndex: number;

  constructor(seed = Date.now() % 1_000_000) {
    this.seed = seed;
    this.levelIndex = 1;
  }

  nextLevel(): void {
    this.levelIndex += 1;
  }

  getCurrentParams(): { difficulty: number; enemyCount: number; enemyHp: number } {
    const difficulty = Math.log2(this.levelIndex + 1) + this.levelIndex * 0.015;
    const enemyCount = Math.min(10 + Math.floor(this.levelIndex * 0.15), 500);
    const enemyHp = 10 + Math.floor(this.levelIndex * 0.75);
    return { difficulty, enemyCount, enemyHp };
  }
}