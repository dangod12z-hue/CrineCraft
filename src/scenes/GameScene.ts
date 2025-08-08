import Phaser from 'phaser';
import { CurrencySystem } from '../systems/CurrencySystem';
import { LevelSystem } from '../systems/LevelSystem';
import { AllModes, GameMode } from '../systems/ModeSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { AbilitySystem } from '../systems/AbilitySystem';
import { RosterSystem, CHARACTERS } from '../systems/RosterSystem';

export class GameScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey!: Phaser.Input.Keyboard.Key;

  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private enemies!: Phaser.Physics.Arcade.Group;

  private currency = new CurrencySystem();
  private levels = new LevelSystem();
  private mode: GameMode = 'endless';
  private abilitySystem = new AbilitySystem();
  private roster = new RosterSystem();

  private abilityPrimaryKey!: Phaser.Input.Keyboard.Key; // E
  private abilitySecondaryKey!: Phaser.Input.Keyboard.Key; // Q
  private modeKey!: Phaser.Input.Keyboard.Key; // M
  private selectKeys!: Phaser.Input.Keyboard.Key[]; // 1..5

  private uiEl!: HTMLDivElement;
  private hp = 100;
  private score = 0;
  private killCount = 0;
  private nextSpawnAt = 0;
  private attackCooldownMs = 400;
  private lastAttackMs = -9999;

  constructor() {
    super('GameScene');
  }

  preload(): void {
    this.createGeneratedTextures();
  }

  create(): void {
    // Load previous save
    const save = SaveSystem.load({ coins: 0, gems: 0, mode: 'endless', level: 1, unlocked: ['striker'], selected: 'striker' });
    this.currency.state.coins = (save as any).coins ?? 0;
    this.currency.state.gems = (save as any).gems ?? 0;
    this.mode = (save as any).mode ?? 'endless';
    this.levels.levelIndex = (save as any).level ?? 1;

    this.roster = new RosterSystem({ unlocked: (save as any).unlocked as any, selected: (save as any).selected as any });

    this.uiEl = document.getElementById('ui') as HTMLDivElement;

    this.physics.world.setBounds(0, 0, 960, 540);

    this.ground = this.physics.add.staticGroup();
    const groundRect = this.add.rectangle(480, 520, 960, 40, 0x1f2937).setOrigin(0.5, 0.5);
    this.ground.add(groundRect);

    this.player = this.physics.add.sprite(200, 360, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.1);
    this.player.body.setSize(26, 64).setOffset(3, 0);

    this.physics.add.collider(this.player, this.ground);

    this.enemies = this.physics.add.group({ collideWorldBounds: true });
    this.physics.add.collider(this.enemies, this.ground);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.abilityPrimaryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.abilitySecondaryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.modeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.selectKeys = [
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
    ];

    this.updateUi();
  }

  update(_: number, dt: number): void {
    const now = this.time.now;

    // Player movement
    const speed = 240;
    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
      if (this.player.body.blocked.down) {
        this.player.setVelocityY(-520);
      }
    }

    // Attack
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && (now - this.lastAttackMs) > this.attackCooldownMs) {
      this.lastAttackMs = now;
      this.performAttack();
    }

    // Spawn logic based on level params
    const params = this.levels.getCurrentParams();
    if (now > this.nextSpawnAt && this.enemies.countActive(true) < params.enemyCount) {
      this.spawnEnemy();
      const spawnDelay = Phaser.Math.Between(200, Math.max(400, 1600 - this.levels.levelIndex * 10));
      this.nextSpawnAt = now + spawnDelay;
    }

    // Enemies AI: simple chase
    this.enemies.children.iterate((child) => {
      const enemy = child as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      if (!enemy.active) return null;
      const dir = Math.sign(this.player.x - enemy.x) || (Math.random() < 0.5 ? -1 : 1);
      enemy.setVelocityX(dir * 120);
      if (enemy.body.blocked.down && Math.random() < 0.005) {
        enemy.setVelocityY(-420);
      }
      return null;
    });

    // Damage to player on overlap
    this.physics.overlap(this.player, this.enemies, (_p, e) => {
      const enemy = e as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      if (!enemy.getData('touched')) {
        enemy.setData('touched', true);
        this.hp = Math.max(0, this.hp - 5);
        this.time.delayedCall(500, () => enemy.setData('touched', false));
        if (this.hp <= 0) {
          this.gameOver();
        }
        this.updateUi();
      }
    });

    // Abilities
    if (Phaser.Input.Keyboard.JustDown(this.abilityPrimaryKey)) {
      const char = CHARACTERS.find((c) => c.id === this.roster.selected)!;
      this.abilitySystem.tryUse(char.primaryAbility, { scene: this, player: this.player, enemies: this.enemies }, now);
    }
    if (Phaser.Input.Keyboard.JustDown(this.abilitySecondaryKey)) {
      const char = CHARACTERS.find((c) => c.id === this.roster.selected)!;
      this.abilitySystem.tryUse(char.secondaryAbility, { scene: this, player: this.player, enemies: this.enemies }, now);
    }

    // Mode cycle
    if (Phaser.Input.Keyboard.JustDown(this.modeKey)) {
      const idx = (AllModes.indexOf(this.mode) + 1) % AllModes.length;
      this.mode = AllModes[idx];
      this.updateUi();
      this.saveGame();
    }

    // Character selection via number keys
    this.selectKeys.forEach((key, idx) => {
      if (Phaser.Input.Keyboard.JustDown(key)) {
        const char = CHARACTERS[idx];
        if (!char) return;
        if (this.roster.isUnlocked(char.id)) {
          this.roster.select(char.id);
        } else {
          // Try unlock using currency
          this.roster.tryUnlock(char.id, this.currency);
        }
        this.updateUi();
        this.saveGame();
      }
    });

    this.updateUiThrottled(now);
  }

  private uiLastUpdate = 0;
  private updateUiThrottled(now: number): void {
    if (now - this.uiLastUpdate < 150) return;
    this.uiLastUpdate = now;
    this.updateUi();
  }

  private performAttack(): void {
    const radius = 60;
    const circle = new Phaser.Geom.Circle(this.player.x + (this.player.flipX ? -30 : 30), this.player.y, radius);

    const hit: Phaser.GameObjects.Arc[] = [];
    this.enemies.children.each((child) => {
      const enemy = child as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      if (!enemy.active) return;
      const point = new Phaser.Geom.Point(enemy.x, enemy.y);
      if (Phaser.Geom.Circle.ContainsPoint(circle, point)) {
        // Show impact
        const fx = this.add.circle(enemy.x, enemy.y, 6, 0xffe08a).setDepth(10);
        this.tweens.add({ targets: fx, alpha: 0, duration: 200, onComplete: () => fx.destroy() });

        const hp = enemy.getData('hp') as number;
        const newHp = hp - Phaser.Math.Between(6, 14);
        enemy.setData('hp', newHp);
        enemy.setTint(0xffaaaa);
        this.time.delayedCall(80, () => enemy.clearTint());
        if (newHp <= 0) {
          this.onEnemyDefeated(enemy);
        } else {
          enemy.setVelocityX(enemy.x < this.player.x ? -260 : 260);
        }
        hit.push(fx);
      }
    });

    // Small slash visual near player
    const slash = this.add.rectangle(
      this.player.x + (this.player.flipX ? -28 : 28),
      this.player.y - 8,
      40,
      6,
      0x9fd5ff
    ).setAngle(this.player.flipX ? -30 : 30);
    this.tweens.add({ targets: slash, alpha: 0, duration: 160, onComplete: () => slash.destroy() });
  }

  private onEnemyDefeated(enemy: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody): void {
    enemy.disableBody(true, true);
    this.killCount += 1;
    this.score += 10;
    this.currency.addCoins(1);
    if (Math.random() < 0.05) this.currency.addGems(1);

    // Level up every 25 kills
    if (this.killCount % 25 === 0) {
      this.levels.nextLevel();
      this.hp = Math.min(100, this.hp + 20);
    }

    // Coin pop
    const coin = this.add.circle(enemy.x, enemy.y, 4, 0xffd166);
    this.tweens.add({ targets: coin, y: coin.y - 20, alpha: 0, duration: 500, onComplete: () => coin.destroy() });

    this.updateUi();
    this.saveGame();
  }

  private spawnEnemy(): void {
    const x = Math.random() < 0.5 ? 40 : 920;
    const y = 200 + Math.random() * 120;
    const enemy = this.physics.add.sprite(x, y, 'enemy');
    enemy.body.setSize(24, 60).setOffset(4, 4);
    enemy.setDataEnabled();
    const params = this.levels.getCurrentParams();
    enemy.setData('hp', params.enemyHp);
    enemy.setVelocityX(x < 480 ? 120 : -120);
    enemy.setBounce(0.05);
    this.enemies.add(enemy);
  }

  private gameOver(): void {
    this.cameras.main.flash(200, 255, 80, 80);
    this.hp = 100;
    this.score = 0;
    this.killCount = 0;
    this.levels.levelIndex = 1;
    this.enemies.clear(true, true);
    this.updateUi();
    this.saveGame();
  }

  private updateUi(): void {
    const modeIdx = AllModes.indexOf(this.mode) + 1;
    const { coins, gems } = this.currency.state;
    const char = CHARACTERS.find((c) => c.id === this.roster.selected)!;
    const now = this.time?.now ?? 0;
    const cdPrimary = Math.ceil((this.abilitySystem.getRemainingCooldownMs(char.primaryAbility, now)) / 100) / 10;
    const cdSecondary = Math.ceil((this.abilitySystem.getRemainingCooldownMs(char.secondaryAbility, now)) / 100) / 10;

    const rosterLine = CHARACTERS.map((c, i) => {
      const num = i + 1;
      const isSel = c.id === this.roster.selected;
      const locked = !this.roster.isUnlocked(c.id);
      const label = `${num}:${c.name}${locked ? ' (lock)' : ''}${isSel ? ' [*]' : ''}`;
      return label;
    }).join(' | ');

    this.uiEl.innerHTML = `
      <div style="background: rgba(0,0,0,0.3); padding:6px 10px; border-radius: 8px;">
        <div><strong>Mode</strong>: ${this.mode} (${modeIdx}/7) | <strong>Level</strong>: ${this.levels.levelIndex}</div>
        <div><strong>HP</strong>: ${this.hp} | <strong>Kills</strong>: ${this.killCount} | <strong>Score</strong>: ${this.score}</div>
        <div><strong>Coins</strong>: ${coins} | <strong>Gems</strong>: ${gems}</div>
        <div><strong>Char</strong>: ${char.name} | <strong>Abilities</strong>: ${char.primaryAbility} (${cdPrimary}s), ${char.secondaryAbility} (${cdSecondary}s)</div>
        <div style="opacity:0.9;">${rosterLine}</div>
        <div style="opacity:0.7; font-size: 12px;">Arrows: Move, Up: Jump, Space: Melee, E/Q: Abilities, M: Cycle Mode, 1-5: Select/Unlock</div>
      </div>`;
  }

  private saveGame(): void {
    SaveSystem.save({
      coins: this.currency.state.coins,
      gems: this.currency.state.gems,
      mode: this.mode,
      level: this.levels.levelIndex,
      unlocked: Array.from(this.roster.unlocked),
      selected: this.roster.selected,
    });
  }

  private createGeneratedTextures(): void {
    // Player texture (stick-like figure)
    const g1 = this.add.graphics();
    g1.fillStyle(0xffffff, 1);
    g1.fillRect(0, 0, 32, 64); // body
    g1.generateTexture('player', 32, 64);
    g1.destroy();

    // Enemy texture
    const g2 = this.add.graphics();
    g2.fillStyle(0xe34b4b, 1);
    g2.fillRect(0, 0, 32, 64);
    g2.generateTexture('enemy', 32, 64);
    g2.destroy();

    // Projectile texture
    const g3 = this.add.graphics();
    g3.fillStyle(0x88e1ff, 1);
    g3.fillRect(0, 0, 8, 4);
    g3.generateTexture('proj', 8, 4);
    g3.destroy();
  }
}