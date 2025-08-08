import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: 'app',
  backgroundColor: '#12161f',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1200 }, debug: false }
  },
  scene: [GameScene]
};

// eslint-disable-next-line no-new
new Phaser.Game(config);