import PIXI from 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import p2 from 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'expose-loader?Phaser!phaser-ce/build/custom/phaser-split.js';

import * as states from './states';

class MrHop extends Phaser.Game {
  constructor(element) {
    super(480, 320, Phaser.AUTO, element, {
      create() {
        this.state.add('Boot', states.BootState);
        this.state.add('Preload', states.PreloadState);
        this.state.add('Game', states.GameState);

        this.state.start('Boot');
      }
    });
  }
}

new MrHop('game');
