import * as prefabs from '../prefabs';

export default class GameState extends Phaser.State {
  init() {
    this.floorPool = this.add.group();

    this.platformPool = this.add.group();

    this.coinsPool = this.add.group();
    this.coinsPool.enableBody = true;

    this.game.physics.arcade.gravity.y = 1000;

    this.maxJumpDistance = 120;

    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.myCoins = 0;

    this.levelSpeed = -200;
  }
  create() {
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'background');
    this.background.tileScale.y = 2;
    this.background.autoScroll(this.levelSpeed/6, 0);
    this.game.world.sendToBack(this.background);

    this.player = this.add.sprite(50, 140, 'player');
    this.player.anchor.setTo(0.5);
    this.player.animations.add('running', [0, 1, 2, 3, 2, 1], 15, true);
    this.game.physics.arcade.enable(this.player);

    this.player.body.setSize(38, 60, 6, 4);
    this.player.play('running');

    this.currentPlatform = new prefabs.Platform(this.game, this.floorPool, 11, 0, 200, this.levelSpeed, this.coinsPool);

    this.platformPool.add(this.currentPlatform);

    this.coinSound = this.add.audio('coin');

    this.createPlatform();

    this.water = this.add.tileSprite(0, this.game.world.height - 30, this.game.world.width, 30, 'water');
    this.water.autoScroll(this.levelSpeed / 2, 0);

    const style = {
      font: '30px Arial', fill: '#fff'
    };

    this.coinstCountLabel = this.add.text(10, 20, '0', style);
  }
  update() {
    this.platformPool.forEachAlive((platform, index) => {
      this.game.physics.arcade.collide(this.player, platform);

      if (platform.length && platform.children[platform.length - 1].right < 0) {
        platform.kill();
      }
    });

    this.coinsPool.forEachAlive((coin) => {
      if (coin.right <= 0) {
        coin.kill();
      }
    });

    this.game.physics.arcade.overlap(this.player, this.coinsPool, this.collectCoin, null, this);

    if (this.player.body.touching.down) {
      this.player.body.velocity.x = -this.levelSpeed;
    } else {
      this.player.body.velocity.x = 0;
    }

    if (this.cursors.up.isDown || this.game.input.activePointer.isDown) {
      this.playerJump();
    } else if (this.cursors.isUp || this.game.input.activePointer.isUp) {
      this.isJumping = false;
    }

    if (this.currentPlatform.length && this.currentPlatform.children[this.currentPlatform.length - 1].right < this.game.world.width) {
      this.createPlatform();
    }

    if (this.player.top >= this.game.world.height || this.player.left <= 0) {
      this.gameOver();
    }
  }
  playerJump() {
    if (this.player.body.touching.down) {
      this.startJumpY = this.player.y;

      this.isJumping = true;
      this.jumpPeaked = false;

      this.player.body.velocity.y = -300;
    } else if (this.isJumping && !this.jumpPeaked) {
      let distanceJumped = this.startJumpY - this.player.y;

      if (distanceJumped <= this.maxJumpDistance) {
        this.player.body.velocity.y = -300;
      } else {
        this.jumpPeaked = true;
      }
    }
  }
  createPlatform() {
    const nextPlatformData = this.generateRandomPlatform();

    if (nextPlatformData) {
      this.currentPlatform = this.platformPool.getFirstDead();

      if (this.currentPlatform) {
        this.currentPlatform.prepare(
          nextPlatformData.numTiles,
          this.game.world.width + nextPlatformData.separation,
          nextPlatformData.y,
          this.levelSpeed
        );
      } else {
        this.currentPlatform = new prefabs.Platform(
          this.game,
          this.floorPool,
          nextPlatformData.numTiles,
          this.game.world.width + nextPlatformData.separation,
          nextPlatformData.y,
          this.levelSpeed,
          this.coinsPool
        );
      }

      this.platformPool.add(this.currentPlatform);
    }
  }
  generateRandomPlatform() {
    const data = {};
    const minSeparation = 60;
    const maxSeparation = 200;

    data.separation = minSeparation + Math.random() * (maxSeparation - minSeparation);

    const minDiffY = -120;
    const maxDiffY =  120;

    data.y = this.currentPlatform.children[0].y + minDiffY + Math.random() * (maxDiffY - minDiffY); // TODO Refactor
    data.y = Math.max(150, data.y);
    data.y = Math.min(this.game.world.height - 50, data.y);

    const minTiles = 1;
    const maxTiles = 5;

    data.numTiles = minTiles + Math.random() * (maxTiles - minTiles);

    return data;
  }
  collectCoin(player, coin) {
    coin.kill();

    this.myCoins++;

    this.coinSound.play();

    this.coinstCountLabel.text = this.myCoins;
  }
  gameOver() {
    this.player.kill();
    this.updateHighScore();

    this.overlay = this.add.bitmapData(this.game.width, this.game.height);
    this.overlay.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    this.overlay.ctx.fillRect(0, 0, this.game.width, this.game.height);

    this.panel = this.add.sprite(0, this.game.height, this.overlay);
    this.panel.alpha = 0.55;

    const gameOverPanel = this.add.tween(this.panel);
    gameOverPanel.to({ y: 0 }, 500);

    gameOverPanel.onComplete.add(() => {
      this.water.stopScroll();
      this.background.stopScroll();

      this.add.text(this.game.width * .5, this.game.height * .5, 'GAME OVER', {
        font: '30px Arial', fill: '#fff'
      }).anchor.setTo(0.5);

      this.add.text(this.game.width * .5, this.game.height * .5 + 50, `High score: ${this.highScore}`, {
        font: '20px Arial', fill: '#fff'
      }).anchor.setTo(0.5);

      this.add.text(this.game.width * .5, this.game.height * .5 + 80, `Your score: ${this.myCoins}`, {
        font: '20px Arial', fill: '#fff'
      }).anchor.setTo(0.5);

      this.add.text(this.game.width * .5, this.game.height * .5 + 120, `Tap to play again`, {
        font: '10px Arial', fill: '#fff'
      }).anchor.setTo(0.5);

      this.game.input.onDown.addOnce(() => this.restart());
    });

    gameOverPanel.start();
  }
  restart() {
    this.game.state.start('Game');
  }
  updateHighScore() {
    this.highScore = +localStorage.getItem('highScore'); // Hack
    if (this.highScore < this.myCoins) {
      this.highScore = this.myCoins;
      localStorage.setItem('highScore', this.highScore);
    }
  }
  render() {
    //this.game.debug.body(this.player);
  }
}
