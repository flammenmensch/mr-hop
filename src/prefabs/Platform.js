const createTile = (game, x, y) =>
  new Phaser.Sprite(game, x, y, 'floor');

const createCoin = (game, x, y) =>
  new Phaser.Sprite(game, x, y, 'coin');

export default class Platform extends Phaser.Group {
  constructor(game, floorPool, numTiles, x, y, speed, coinsPool) {
    super(game);

    this.tileSize = 40;
    this.floorPool = floorPool;
    this.coinsPool = coinsPool;
    this.enableBody = true;

    this.prepare(numTiles, x, y, speed);
  }
  prepare(numTiles, x, y, speed) {
    this.alive = true;

    let i = 0;
    let tile;

    while (i < numTiles) {
      tile = this.floorPool.getFirstExists(false);

      if (!tile) {
        tile = createTile(this.game, x + i * this.tileSize, y);
      } else {
        tile.reset(x + i * this.tileSize, y);
      }

      this.add(tile);

      i++;
    }

    this.setAll('body.immovable', true);
    this.setAll('body.allowGravity', false);
    this.setAll('body.velocity.x', speed);

    this.addCoins(speed);
  }
  addCoins(speed) {
    const coinsY = 90 + Math.random() * 110;
    let hasCoin;

    this.forEach((tile) => {
      hasCoin = Math.random() <= .4;

      if (hasCoin) {
        let coin = this.coinsPool.getFirstExists(false);

        if (!coin) {
          coin = createCoin(this.game, tile.x, tile.y - coinsY);
          this.coinsPool.add(coin);
        } else {
          coin.reset(tile.x, tile.y - coinsY);
        }
        coin.body.velocity.x = speed;
        coin.body.allowGravity = false;
      }
    });
  }
  kill() {
    this.alive = false;
    this.callAll('kill');

    const sprites = [];
    this.forEach((tile) =>
      sprites.push(tile)
    );
    sprites.forEach((sprite) =>
      this.floorPool.add(sprite)
    );
  }
}
