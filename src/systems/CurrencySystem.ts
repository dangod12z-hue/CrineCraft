export type CurrencyState = { coins: number; gems: number };

export class CurrencySystem {
  state: CurrencyState;

  constructor(initial?: Partial<CurrencyState>) {
    this.state = { coins: 0, gems: 0, ...initial };
  }

  addCoins(amount: number): void {
    this.state.coins += Math.max(0, Math.floor(amount));
  }

  addGems(amount: number): void {
    this.state.gems += Math.max(0, Math.floor(amount));
  }

  spendCoins(amount: number): boolean {
    if (this.state.coins >= amount) {
      this.state.coins -= amount;
      return true;
    }
    return false;
  }

  spendGems(amount: number): boolean {
    if (this.state.gems >= amount) {
      this.state.gems -= amount;
      return true;
    }
    return false;
  }
}