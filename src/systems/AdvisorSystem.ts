import type { StatsSystem } from './StatsSystem';
import type { GameMode } from './ModeSystem';
import { CHARACTERS } from './RosterSystem';

export class AdvisorSystem {
  constructor(
    private readonly stats: StatsSystem,
    private readonly getContext: () => { mode: GameMode; level: number; coins: number; gems: number; selectedCharId: string }
  ) {}

  getTips(): string[] {
    const s = this.stats.getSnapshot();
    const ctx = this.getContext();
    const tips: string[] = [];

    if (s.dps < 10 && s.kills < 10) tips.push('Try using abilities (Q/E) to boost your damage output.');
    if (s.damageTaken > s.damageDealt * 0.5) tips.push('You are taking a lot of damage. Jump to evade and strike after enemy jumps.');
    if (ctx.mode === 'timeAttack') tips.push('Time Attack: focus on fast melee and dashes to clear quickly.');
    if (ctx.mode === 'bossRush') tips.push('Boss Rush: save abilities for boss spawns to burst them.');
    if (s.hitlessStreak >= 15) tips.push(`Nice streak! ${s.hitlessStreak} enemies without getting hit.`);
    if (ctx.coins >= 800) tips.push('You have enough coins to unlock a new character. Press 2/3/4/5 or use the menu.');
    if (ctx.gems >= 30) tips.push('You have enough gems to unlock a premium character.');

    const char = CHARACTERS.find(c => c.id === ctx.selectedCharId);
    if (char) tips.push(`${char.name}: primary=${char.primaryAbility}, secondary=${char.secondaryAbility}`);

    if (tips.length === 0) tips.push('Keep going! Cycle modes (M) and try Arena for burst rewards.');
    return tips.slice(0, 4);
  }

  answer(question: string): string {
    const q = question.toLowerCase();
    const s = this.stats.getSnapshot();
    const ctx = this.getContext();

    if (q.includes('gem')) return `You have ${ctx.gems} gems. Gems drop rarely on kills; higher levels and bosses increase chances.`;
    if (q.includes('coin')) return `You have ${ctx.coins} coins. Arena wave clears and kill farming increase coins quickly.`;
    if (q.includes('dps') || q.includes('damage')) return `Current DPS: ${s.dps}. Damage dealt: ${s.damageDealt}, taken: ${s.damageTaken}.`;
    if (q.includes('kill')) return `Kills: ${s.kills}, bosses: ${s.bossesDefeated}.`;
    if (q.includes('mode')) return `Mode: ${ctx.mode} at level ${ctx.level}. Arena spawns in waves; Boss Rush spawns bosses every ~15s.`;
    if (q.includes('character') || q.includes('unlock')) return 'Unlock characters with coins or gems. Use number keys 1–5 or the pause menu.';
    if (q.includes('control') || q.includes('how')) return 'Controls: Arrows move, Up jump, Space melee, Q/E abilities, M mode, Esc pause. On mobile, use on-screen controls.';

    return 'I can help with stats (DPS, kills, coins/gems) and game tips (modes, unlocks). Try asking: "How to earn gems faster?"';
  }

  renderStatsHtml(): string {
    const s = this.stats.getSnapshot();
    const to = (v: number) => v.toLocaleString();
    return `
      <div style="display:grid; grid-template-columns: repeat(2, minmax(120px, 1fr)); gap:6px;">
        <div><strong>Time</strong>: ${to(s.sessionSeconds)}s</div>
        <div><strong>DPS</strong>: ${s.dps}</div>
        <div><strong>Kills</strong>: ${to(s.kills)}</div>
        <div><strong>Hitless</strong>: ${to(s.hitlessStreak)}</div>
        <div><strong>Coins</strong>: ${to(s.coins)}</div>
        <div><strong>Gems</strong>: ${to(s.gems)}</div>
        <div><strong>Dealt</strong>: ${to(s.damageDealt)}</div>
        <div><strong>Taken</strong>: ${to(s.damageTaken)}</div>
        <div><strong>Melee</strong>: ${to(s.meleeHits)}</div>
        <div><strong>Abilities</strong>: ${to(s.abilityUses)}</div>
      </div>`;
  }
}