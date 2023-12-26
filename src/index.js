import Phaser from "phaser";
import logoImg from "./assets/logo.png";

class MyGame extends Phaser.Scene {
  constructor() {
    super();
    this.player;
    this.platforms;
    this.stars;
    this.cursors;
    this.score;
    this.scoreText;
    this.velocityX = 300;
  }

  preload() {
    //  This is an example of loading a static image from the public folder:
    this.load.image("background", "assets/blue_grass.png");
    this.load.image("grassLeft", "assets/grassLeft.png");
    this.load.image("grassMid", "assets/grassMid.png");
    this.load.image("grassRight", "assets/grassRight.png");
    this.load.image("star", "assets/star.png");
    this.load.spritesheet("player", "assets/spritesheet_players.png", {
      frameWidth: 128,
      frameHeight: 256,
    });
  }

  create() {
    this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "background"
    );
    this.platforms = this.physics.add.staticGroup();
    // 왼쪽 타일 추가
    this.platforms
      .create(32, 768 - 32, "grassLeft")
      .setScale(0.5)
      .refreshBody();
    // 중간 타일들 추가
    for (let i = 1; i < 16 - 1; i++) {
      this.platforms
        .create(32 + i * 64, 768 - 32, "grassMid")
        .setScale(0.5)
        .refreshBody();
    }
    // 오른쪽 타일 추가
    this.platforms
      .create(1024 - 32, 768 - 32, "grassRight")
      .setScale(0.5)
      .refreshBody();

    this.player = this.physics.add
      .sprite(this.cameras.main.centerX, 768 - 128, "player")
      .setScale(0.5)
      .setSize(100, 150)
      .setOffset(14, 106);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.platforms);

    this.stars = this.physics.add.group();
    const startCreateEvent = this.time.addEvent({
      delay: 100,
      callback: createStar,
      callbackScope: this,
      loop: true,
    });

    function createStar() {
      // 랜덤한 x 좌표를 계산합니다.
      let x = Phaser.Math.Between(0, 1024);
      // 별을 생성하고 물리 엔진을 활성화합니다.
      let star = this.stars.create(x, 0, "star").setScale(0.5).setSize(40, 50);
    }
    this.physics.add.collider(this.player, this.stars, hitStar, null, this);
    function hitStar() {
      this.physics.pause();
      startCreateEvent.paused = true;
      this.player.setTint(0xff0000);
      this.player.anims.play("turn");
      this.gameOver = true;
    }
    this.physics.add.collider(
      this.stars,
      this.platforms,
      destroyStar,
      null,
      this
    );
    function destroyStar(star, platform) {
      star.destroy();
      this.score += 1;
      this.scoreText.setText(`${this.score}`);
    }

    // 애니메이션
    this.anims.create({
      key: "walk",
      frames: [
        { key: "player", frame: 12 },
        { key: "player", frame: 20 },
      ],
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "player", frame: 5 }],
      frameRate: 20,
    });

    this.score = 0;
    this.scoreText = this.add
      .text(0, 0, "0", {
        fontSize: "48px",
        fill: "#000",
      })
      .setDepth(1);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.velocityX);
      this.player.anims.play("walk", true);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.velocityX);
      this.player.anims.play("walk", true);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  scale: {
    mode: Phaser.Scale.FIT, // 게임 화면이 디바이스 화면에 맞게 확대/축소되도록 설정
    autoCenter: Phaser.Scale.CENTER_BOTH, // 게임 화면이 디바이스 화면 중앙에 위치하도록 설정
    width: 1024, // 게임 화면의 기본 너비
    height: 768, // 게임 화면의 기본 높이
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 400 },
      debug: false,
    },
  },
  scene: MyGame,
};

const game = new Phaser.Game(config);
