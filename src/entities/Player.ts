import Phaser from 'phaser';
import { InputState } from '../input/InputSystem';

export class PlayerEntity {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0.1);
    this.sprite.body.setSize(26, 64).setOffset(3, 0);
  }

  updateFromInput(input: InputState): void {
    const speed = 240;
    if (input.left && !input.right) {
      this.sprite.setVelocityX(-speed);
      this.sprite.setFlipX(true);
    } else if (input.right && !input.left) {
      this.sprite.setVelocityX(speed);
      this.sprite.setFlipX(false);
    } else {
      this.sprite.setVelocityX(0);
    }

    if (input.up && this.sprite.body.blocked.down) {
      this.sprite.setVelocityY(-520);
    }
  }
}