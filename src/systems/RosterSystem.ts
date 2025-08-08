import { CurrencySystem } from './CurrencySystem';
import type { AbilityId } from './AbilitySystem';

export type CharacterId = 'striker' | 'archon' | 'blazer' | 'phantom' | 'warden';

export type CharacterDef = {
  id: CharacterId;
  name: string;
  premium: boolean;
  costCoins?: number;
  costGems?: number;
  baseAttack: number;
  primaryAbility: AbilityId;
  secondaryAbility: AbilityId;
};

export const CHARACTERS: CharacterDef[] = [
  { id: 'striker', name: 'Striker', premium: false, costCoins: 0, baseAttack: 10, primaryAbility: 'dash', secondaryAbility: 'projectile' },
  { id: 'archon', name: 'Archon', premium: false, costCoins: 800, baseAttack: 9, primaryAbility: 'projectile', secondaryAbility: 'dash' },
  { id: 'blazer', name: 'Blazer', premium: false, costCoins: 2000, baseAttack: 12, primaryAbility: 'dash', secondaryAbility: 'projectile' },
  { id: 'phantom', name: 'Phantom', premium: true, costGems: 30, baseAttack: 11, primaryAbility: 'projectile', secondaryAbility: 'dash' },
  { id: 'warden', name: 'Warden', premium: true, costGems: 60, baseAttack: 13, primaryAbility: 'dash', secondaryAbility: 'projectile' },
];

export class RosterSystem {
  unlocked: Set<CharacterId> = new Set(['striker']);
  selected: CharacterId = 'striker';

  constructor(initial?: { unlocked?: CharacterId[]; selected?: CharacterId }) {
    if (initial?.unlocked) initial.unlocked.forEach((c) => this.unlocked.add(c));
    if (initial?.selected) this.selected = initial.selected;
  }

  isUnlocked(id: CharacterId): boolean {
    return this.unlocked.has(id);
  }

  tryUnlock(id: CharacterId, currency: CurrencySystem): boolean {
    if (this.isUnlocked(id)) return true;
    const def = CHARACTERS.find((c) => c.id === id);
    if (!def) return false;
    if (def.premium) {
      if (def.costGems && currency.spendGems(def.costGems)) {
        this.unlocked.add(id);
        return true;
      }
      return false;
    } else {
      if (def.costCoins !== undefined && currency.spendCoins(def.costCoins)) {
        this.unlocked.add(id);
        return true;
      }
      return false;
    }
  }

  select(id: CharacterId): boolean {
    if (!this.isUnlocked(id)) return false;
    this.selected = id;
    return true;
  }
}