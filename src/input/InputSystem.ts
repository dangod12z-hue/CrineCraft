import Phaser from 'phaser';
import { MobileControls } from '../systems/MobileControls';

export type InputState = {
  left: boolean;
  right: boolean;
  up: boolean;
  attack: boolean;
  abilityQ: boolean;
  abilityE: boolean;
};

export class InputSystem {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private space: Phaser.Input.Keyboard.Key;
  private q: Phaser.Input.Keyboard.Key;
  private e: Phaser.Input.Keyboard.Key;
  private mobile: MobileControls;

  constructor(scene: Phaser.Scene, mobile: MobileControls) {
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.space = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.q = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.e = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.mobile = mobile;
  }

  sample(): InputState {
    return {
      left: !!this.cursors.left?.isDown || this.mobile.left,
      right: !!this.cursors.right?.isDown || this.mobile.right,
      up: Phaser.Input.Keyboard.JustDown(this.cursors.up!) || this.mobile.jump,
      attack: Phaser.Input.Keyboard.JustDown(this.space) || this.mobile.attack,
      abilityQ: Phaser.Input.Keyboard.JustDown(this.q) || this.mobile.abilityQ,
      abilityE: Phaser.Input.Keyboard.JustDown(this.e) || this.mobile.abilityE,
    };
  }
}