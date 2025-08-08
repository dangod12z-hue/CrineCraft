import Phaser from 'phaser';

export type AbilityContext = {
  scene: Phaser.Scene;
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  enemies: Phaser.Physics.Arcade.Group;
};

export type AbilityId = 'dash' | 'projectile';

export type Ability = {
  id: AbilityId;
  name: string;
  cooldownMs: number;
  execute: (ctx: AbilityContext) => void;
};

export class AbilitySystem {
  private lastUseMs: Record<AbilityId, number> = { dash: -99999, projectile: -99999 };
  private abilities: Record<AbilityId, Ability>;

  constructor() {
    this.abilities = {
      dash: {
        id: 'dash',
        name: 'Dash',
        cooldownMs: 1200,
        execute: ({ player }) => {
          const direction = player.flipX ? -1 : 1;
          player.setVelocityX(direction * 680);
          player.setVelocityY(-80);
        }
      },
      projectile: {
        id: 'projectile',
        name: 'Pulse Shot',
        cooldownMs: 900,
        execute: ({ scene, player, enemies }) => {
          const proj = (scene.physics.add.sprite(player.x + (player.flipX ? -18 : 18), player.y - 10, 'proj') as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody);
          proj.setVelocityX(player.flipX ? -520 : 520);
          proj.setVelocityY(-40);
          proj.body.setAllowGravity(false);
          proj.setDataEnabled();
          proj.setData('ttl', scene.time.now + 1200);

          // Overlap damage
          scene.physics.add.overlap(proj, enemies, (_p, e) => {
            const enemy = e as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
            const hp = (enemy.getData('hp') as number) ?? 1;
            enemy.setData('hp', hp - 18);
            enemy.setTint(0xffaaaa);
            scene.time.delayedCall(60, () => enemy.clearTint());
            if ((enemy.getData('hp') as number) <= 0) {
              enemy.disableBody(true, true);
            }
            proj.destroy();
          });

          // TTL cleanup
          (scene as any).events.once('update', () => {});
          const check = () => {
            if (!proj.active) return;
            if (scene.time.now > (proj.getData('ttl') as number)) proj.destroy();
            else scene.time.delayedCall(100, check);
          };
          scene.time.delayedCall(100, check);
        }
      }
    };
  }

  getAbility(id: AbilityId): Ability {
    return this.abilities[id];
  }

  tryUse(id: AbilityId, ctx: AbilityContext, nowMs: number): boolean {
    const ability = this.abilities[id];
    if (!ability) return false;
    const last = this.lastUseMs[id] ?? -99999;
    if (nowMs - last < ability.cooldownMs) return false;
    this.lastUseMs[id] = nowMs;
    ability.execute(ctx);
    return true;
  }

  getRemainingCooldownMs(id: AbilityId, nowMs: number): number {
    const ability = this.abilities[id];
    if (!ability) return 0;
    const last = this.lastUseMs[id] ?? -99999;
    return Math.max(0, ability.cooldownMs - (nowMs - last));
  }
}