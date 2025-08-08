import Phaser from 'phaser';
import { CurrencySystem } from '../systems/CurrencySystem';
import { LevelSystem } from '../systems/LevelSystem';
import { AllModes, GameMode } from '../systems/ModeSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { AbilitySystem } from '../systems/AbilitySystem';
import { RosterSystem, CHARACTERS } from '../systems/RosterSystem';
import { MobileControls } from '../systems/MobileControls';
import { getModeParams } from '../systems/ModeRules';
import { InputSystem } from '../input/InputSystem';
import { PlayerEntity } from '../entities/Player';
import { NetClient } from '../net/NetClient';

export class GameScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey!: Phaser.Input.Keyboard.Key;

  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private enemies!: Phaser.Physics.Arcade.Group;

  private enemyBars!: Phaser.GameObjects.Graphics;

  private currency = new CurrencySystem();
  private levels = new LevelSystem();
  private mode: GameMode = 'endless';
  private abilitySystem = new AbilitySystem();
  private roster = new RosterSystem();

  private abilityPrimaryKey!: Phaser.Input.Keyboard.Key; // E
  private abilitySecondaryKey!: Phaser.Input.Keyboard.Key; // Q
  private modeKey!: Phaser.Input.Keyboard.Key; // M
  private pauseKey!: Phaser.Input.Keyboard.Key; // ESC/P
  private selectKeys!: Phaser.Input.Keyboard.Key[]; // 1..5

  private uiEl!: HTMLDivElement;
  private menuEl!: HTMLDivElement;
  private hp = 100;
  private score = 0;
  private killCount = 0;
  private nextSpawnAt = 0;
  private attackCooldownMs = 400;
  private lastAttackMs = -9999;
  private isPaused = false;

  private modeStartMs = 0;
  private arenaRemaining = 0;
  private nextBossAt = 0;

  private mobile = new MobileControls();
  private inputSystem!: InputSystem;
  private playerEntity!: PlayerEntity;
  private net = new NetClient();
  private remotes: Record<string, Phaser.GameObjects.Rectangle> = {};

  constructor() {
    super('GameScene');
  }

  preload(): void {
    this.createGeneratedTextures();
  }

  create(): void {
    // Load previous save
    const save = SaveSystem.load({ coins: 0, gems: 0, mode: 'endless', level: 1, unlocked: ['striker'], selected: 'striker', mobile: false });
    this.currency.state.coins = (save as any).coins ?? 0;
    this.currency.state.gems = (save as any).gems ?? 0;
    this.mode = (save as any).mode ?? 'endless';
    this.levels.levelIndex = (save as any).level ?? 1;

    this.roster = new RosterSystem({ unlocked: (save as any).unlocked as any, selected: (save as any).selected as any });

    this.uiEl = document.getElementById('ui') as HTMLDivElement;
    this.menuEl = document.getElementById('menu') as HTMLDivElement;

    if ((save as any).mobile) this.mobile.show();

    this.physics.world.setBounds(0, 0, 960, 540);

    this.ground = this.physics.add.staticGroup();
    const groundRect = this.add.rectangle(480, 520, 960, 40, 0x1f2937).setOrigin(0.5, 0.5);
    this.ground.add(groundRect);

    this.enemies = this.physics.add.group({ collideWorldBounds: true });
    this.physics.add.collider(this.enemies, this.ground);

    this.enemyBars = this.add.graphics();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.abilityPrimaryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.abilitySecondaryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.modeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.selectKeys = [
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
    ];

    // Input abstraction and player entity
    this.inputSystem = new InputSystem(this, this.mobile);
    this.playerEntity = new PlayerEntity(this, 200, 360);
    this.player = this.playerEntity.sprite; // keep old references working

    this.resetModeState();

    // Colliders
    this.physics.add.collider(this.playerEntity.sprite, this.ground);

    // Networking
    this.net.connect((evt) => {
      if (evt.type === 'state') {
        this.syncRemotes(evt.players);
      }
    });

    this.updateUi();
  }

  update(_: number, dt: number): void {
    const now = this.time.now;

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) this.togglePause();
    if (this.isPaused) return;

    const params = getModeParams(this.mode, this.levels.levelIndex);

    // Apply player HP modifier once per update (lightweight)
    const targetHpMax = Math.round(100 * params.playerHpMultiplier);
    const currentHpMax = 100; // base used for clamps
    this.hp = Math.min(targetHpMax, this.hp);

    // Player movement via input system
    const input = this.inputSystem.sample();
    this.playerEntity.updateFromInput(input);

    // Attack
    if (input.attack && (now - this.lastAttackMs) > this.attackCooldownMs) {
      this.lastAttackMs = now;
      this.performAttack();
    }

    // Abilities
    const char = CHARACTERS.find((c) => c.id === this.roster.selected)!;
    const abilitiesFree = params.abilitiesFree === true;
    if (input.abilityE) {
      if (abilitiesFree) this.abilitySystem.getAbility(char.primaryAbility).execute({ scene: this, player: this.player, enemies: this.enemies });
      else this.abilitySystem.tryUse(char.primaryAbility, { scene: this, player: this.player, enemies: this.enemies }, now);
    }
    if (input.abilityQ) {
      if (abilitiesFree) this.abilitySystem.getAbility(char.secondaryAbility).execute({ scene: this, player: this.player, enemies: this.enemies });
      else this.abilitySystem.tryUse(char.secondaryAbility, { scene: this, player: this.player, enemies: this.enemies }, now);
    }

    // Mode cycling and character select/unlock
    if (Phaser.Input.Keyboard.JustDown(this.modeKey)) {
      const idx = (AllModes.indexOf(this.mode) + 1) % AllModes.length;
      this.mode = AllModes[idx];
      this.resetModeState();
      this.updateUi();
      this.saveGame();
    }

    this.selectKeys.forEach((key, idx) => {
      if (Phaser.Input.Keyboard.JustDown(key)) {
        const c = CHARACTERS[idx];
        if (!c) return;
        if (this.roster.isUnlocked(c.id)) {
          this.roster.select(c.id);
        } else {
          this.roster.tryUnlock(c.id, this.currency);
        }
        this.updateUi();
        this.saveGame();
      }
    });

    // Spawning rules
    if (now > this.nextSpawnAt) {
      const minD = params.spawnDelayMinMs;
      const maxD = params.spawnDelayMaxMs;

      if (this.mode === 'arena') {
        if (this.arenaRemaining <= 0 && this.enemies.countActive(true) === 0) {
          this.levels.nextLevel();
          this.arenaRemaining = getModeParams('arena', this.levels.levelIndex).waveSize ?? 10;
          this.currency.addCoins(10);
        }
        if (this.arenaRemaining > 0) {
          this.spawnEnemy(params);
          this.arenaRemaining -= 1;
        }
      } else if (this.mode === 'bossRush') {
        if (now > this.nextBossAt) {
          this.spawnEnemy(params, true);
          this.nextBossAt = now + (params.bossEveryMs ?? 15000);
        } else {
          this.spawnEnemy(params);
        }
      } else {
        // story, endless, timeAttack, challenge, training
        this.spawnEnemy(params);
      }

      const nextDelay = Phaser.Math.Between(minD, maxD);
      this.nextSpawnAt = now + nextDelay;
    }

    // Enemies AI: simple chase
    this.enemies.children.iterate((child) => {
      const enemy = child as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      if (!enemy.active) return null;
      const dir = Math.sign(this.player.x - enemy.x) || (Math.random() < 0.5 ? -1 : 1);
      enemy.setVelocityX(dir * 120 * params.enemySpeedMultiplier);
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
        if (params.playerTakesDamage !== false) {
          this.hp = Math.max(0, this.hp - 5);
          if (this.hp <= 0) {
            this.gameOver();
          }
        }
        this.time.delayedCall(500, () => enemy.setData('touched', false));
        this.updateUi();
      }
    });

    // TimeAttack timer
    if (this.mode === 'timeAttack') {
      const mp = getModeParams('timeAttack', this.levels.levelIndex);
      const elapsed = now - this.modeStartMs;
      const remain = Math.max(0, (mp.timeLimitMs ?? 60000) - elapsed);
      if (remain <= 0) {
        this.showToast('Time up!');
        this.gameOver();
      }
    }

    // Draw health bars
    this.enemyBars.clear();
    this.enemies.children.iterate((child) => {
      const enemy = child as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      if (!enemy.active) return null;
      const hp = (enemy.getData('hp') as number) ?? 1;
      const maxHp = (enemy.getData('maxHp') as number) ?? 1;
      const w = 28;
      const h = 3;
      const x = enemy.x - w / 2;
      const y = enemy.y - 40;
      this.enemyBars.fillStyle(0x000000, 0.6).fillRect(x - 1, y - 1, w + 2, h + 2);
      const pct = Phaser.Math.Clamp(hp / maxHp, 0, 1);
      this.enemyBars.fillStyle(0x4ade80, 1).fillRect(x, y, w * pct, h);
      return null;
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

    this.enemies.children.each((child) => {
      const enemy = child as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      if (!enemy.active) return;
      const point = new Phaser.Geom.Point(enemy.x, enemy.y);
      if (Phaser.Geom.Circle.ContainsPoint(circle, point)) {
        const fx = this.add.circle(enemy.x, enemy.y, 6, 0xffe08a).setDepth(10);
        this.tweens.add({ targets: fx, alpha: 0, duration: 200, onComplete: () => fx.destroy() });

        const hp = (enemy.getData('hp') as number) ?? 1;
        const atk = 10; // base
        const newHp = hp - atk;
        enemy.setData('hp', newHp);
        enemy.setTint(0xffaaaa);
        this.time.delayedCall(80, () => enemy.clearTint());
        if (newHp <= 0) {
          this.onEnemyDefeated(enemy);
        } else {
          enemy.setVelocityX(enemy.x < this.player.x ? -260 : 260);
        }
      }
    });

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

    if (this.killCount % 25 === 0 && this.mode !== 'arena') {
      this.levels.nextLevel();
      this.hp = Math.min(100, this.hp + 20);
    }

    const coin = this.add.circle(enemy.x, enemy.y, 4, 0xffd166);
    this.tweens.add({ targets: coin, y: coin.y - 20, alpha: 0, duration: 500, onComplete: () => coin.destroy() });

    this.updateUi();
    this.saveGame();
  }

  private spawnEnemy(params: ReturnType<typeof getModeParams>, boss = false): void {
    const x = Math.random() < 0.5 ? 40 : 920;
    const y = 200 + Math.random() * 120;
    const key = boss ? 'boss' : 'enemy';
    const enemy = this.physics.add.sprite(x, y, key);
    const baseHp = this.levels.getCurrentParams().enemyHp;
    const maxHp = Math.floor(baseHp * (boss ? 6 : 1) * params.enemyHpMultiplier);
    enemy.setDataEnabled();
    enemy.setData('hp', maxHp);
    enemy.setData('maxHp', maxHp);
    enemy.body.setSize(boss ? 40 : 24, boss ? 90 : 60).setOffset(boss ? 4 : 4, boss ? 0 : 4);
    enemy.setVelocityX(x < 480 ? 120 : -120);
    enemy.setBounce(0.05);
    this.enemies.add(enemy);
  }

  private resetModeState(): void {
    this.modeStartMs = this.time.now;
    this.arenaRemaining = getModeParams('arena', this.levels.levelIndex).waveSize ?? 10;
    this.nextBossAt = this.time.now + (getModeParams('bossRush', this.levels.levelIndex).bossEveryMs ?? 15000);
    this.nextSpawnAt = 0;
  }

  private gameOver(): void {
    this.cameras.main.flash(200, 255, 80, 80);
    this.hp = 100;
    this.score = 0;
    this.killCount = 0;
    this.levels.levelIndex = 1;
    this.enemies.clear(true, true);
    this.resetModeState();
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

    let timeInfo = '';
    if (this.mode === 'timeAttack') {
      const mp = getModeParams('timeAttack', this.levels.levelIndex);
      const remain = Math.max(0, (mp.timeLimitMs ?? 60000) - (now - this.modeStartMs));
      timeInfo = ` | Time: ${(Math.ceil(remain / 100) / 10).toFixed(1)}s`;
    }

    this.uiEl.innerHTML = `
      <div style="background: rgba(0,0,0,0.3); padding:6px 10px; border-radius: 8px;">
        <div><strong>Mode</strong>: ${this.mode} (${modeIdx}/7) | <strong>Level</strong>: ${this.levels.levelIndex}${timeInfo}</div>
        <div><strong>HP</strong>: ${this.hp} | <strong>Kills</strong>: ${this.killCount} | <strong>Score</strong>: ${this.score}</div>
        <div><strong>Coins</strong>: ${coins} | <strong>Gems</strong>: ${gems}</div>
        <div><strong>Char</strong>: ${char.name} | <strong>Abilities</strong>: ${char.primaryAbility} (${cdPrimary}s), ${char.secondaryAbility} (${cdSecondary}s)</div>
        <div style="opacity:0.9;">${rosterLine}</div>
        <div class="row">
          <span class="btn" id="btn-mode">Cycle Mode</span>
          <span class="btn" id="btn-mobile">${this.mobile.enabled ? 'Hide' : 'Show'} Touch</span>
          <span class="btn" id="btn-pause">${this.isPaused ? 'Resume' : 'Pause'}</span>
          <span class="btn" id="btn-reset">Reset</span>
        </div>
        <div style="opacity:0.7; font-size: 12px;">Arrows: Move, Up: Jump, Space: Melee, E/Q: Abilities, M/Btn: Cycle Mode, 1-5: Select/Unlock, Esc/Pause</div>
      </div>`;

    // Wire small buttons
    this.bindUiButton('btn-mode', () => {
      const idx = (AllModes.indexOf(this.mode) + 1) % AllModes.length;
      this.mode = AllModes[idx];
      this.resetModeState();
      this.updateUi();
      this.saveGame();
    });
    this.bindUiButton('btn-mobile', () => {
      if (this.mobile.enabled) this.mobile.hide(); else this.mobile.show();
      this.saveGame();
      this.updateUi();
    });
    this.bindUiButton('btn-pause', () => this.togglePause());
    this.bindUiButton('btn-reset', () => this.gameOver());

    // Menu content (when paused)
    if (this.isPaused) {
      this.menuEl.innerHTML = this.renderMenu();
      this.bindMenuEvents();
    } else {
      this.menuEl.innerHTML = '';
    }
  }

  private bindUiButton(id: string, fn: () => void): void {
    const el = document.getElementById(id);
    if (!el) return;
    el.onclick = (e) => { e.preventDefault(); fn(); };
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) this.physics.world.pause(); else this.physics.world.resume();
    this.updateUi();
  }

  private renderMenu(): string {
    const modes = AllModes.map((m) => `<option ${m === this.mode ? 'selected' : ''} value="${m}">${m}</option>`).join('');
    const chars = CHARACTERS.map((c) => {
      const unlocked = this.roster.isUnlocked(c.id);
      const cost = c.premium ? `${c.costGems ?? 0} gems` : `${c.costCoins ?? 0} coins`;
      return `<div class="row">${c.name} ${unlocked ? '(owned)' : `- ${cost}`} <span class="btn" data-char="${c.id}">${unlocked ? 'Select' : 'Unlock'}</span></div>`;
    }).join('');
    return `
      <div style="background: rgba(0,0,0,0.5); padding:10px; border-radius: 10px;">
        <div class="row"><strong>Menu</strong></div>
        <div class="row">Mode: <select id="sel-mode">${modes}</select> <span class="btn" id="apply-mode">Apply</span></div>
        <div class="row"><strong>Characters</strong></div>
        ${chars}
        <div class="row"><span class="btn" id="menu-close">Close</span></div>
      </div>`;
  }

  private bindMenuEvents(): void {
    const sel = document.getElementById('sel-mode') as HTMLSelectElement | null;
    const apply = document.getElementById('apply-mode');
    const close = document.getElementById('menu-close');
    if (apply && sel) apply.onclick = () => {
      const v = sel.value as GameMode;
      this.mode = v;
      this.resetModeState();
      this.saveGame();
      this.updateUi();
    };
    if (close) close.onclick = () => this.togglePause();

    document.querySelectorAll('[data-char]').forEach((el) => {
      const id = (el as HTMLElement).dataset.char!;
      (el as HTMLElement).onclick = () => {
        const def = CHARACTERS.find((c) => c.id === id)!;
        if (this.roster.isUnlocked(def.id)) {
          this.roster.select(def.id);
        } else {
          this.roster.tryUnlock(def.id as any, this.currency);
        }
        this.saveGame();
        this.updateUi();
      };
    });
  }

  private saveGame(): void {
    SaveSystem.save({
      coins: this.currency.state.coins,
      gems: this.currency.state.gems,
      mode: this.mode,
      level: this.levels.levelIndex,
      unlocked: Array.from(this.roster.unlocked),
      selected: this.roster.selected,
      mobile: this.mobile.enabled,
    });
  }

  private createGeneratedTextures(): void {
    // Player
    const g1 = this.add.graphics();
    g1.fillStyle(0xffffff, 1);
    g1.fillRect(0, 0, 32, 64);
    g1.generateTexture('player', 32, 64);
    g1.destroy();

    // Enemy
    const g2 = this.add.graphics();
    g2.fillStyle(0xe34b4b, 1);
    g2.fillRect(0, 0, 32, 64);
    g2.generateTexture('enemy', 32, 64);
    g2.destroy();

    // Boss
    const gB = this.add.graphics();
    gB.fillStyle(0x8b5cf6, 1);
    gB.fillRect(0, 0, 48, 96);
    gB.generateTexture('boss', 48, 96);
    gB.destroy();

    // Projectile
    const g3 = this.add.graphics();
    g3.fillStyle(0x88e1ff, 1);
    g3.fillRect(0, 0, 8, 4);
    g3.generateTexture('proj', 8, 4);
    g3.destroy();
  }

  private showToast(text: string): void {
    const t = this.add.text(480, 60, text, { color: '#fff', fontSize: '18px' }).setOrigin(0.5);
    this.tweens.add({ targets: t, y: 40, alpha: 0, duration: 1000, onComplete: () => t.destroy() });
  }

  private syncRemotes(players: Record<string, { x: number; y: number; flipX: boolean }>): void {
    // create/update remote representations
    Object.entries(players).forEach(([id, s]) => {
      if (id === this.net.id) return; // skip self
      let rect = this.remotes[id];
      if (!rect) {
        rect = this.add.rectangle(s.x, s.y, 32, 64, 0x6ee7b7).setOrigin(0.5, 0.5);
        this.remotes[id] = rect;
      }
      rect.x = s.x;
      rect.y = s.y;
      rect.setScale(s.flipX ? -1 : 1, 1);
    });

    // remove stale
    Object.keys(this.remotes).forEach((id) => {
      if (!players[id]) {
        this.remotes[id].destroy();
        delete this.remotes[id];
      }
    });
  }
}