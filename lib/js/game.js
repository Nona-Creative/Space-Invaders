var player,
    motherships,
    mothershipTimer = Math.floor(Math.random() * 10000) + 2500,
    aliens,
    bullets,
    enemyBullets,
    bulletTime = 0,
    cursors,
    score,
    explosions,
    fireButton,
    firingTimer = 2000,
    livingEnemies = [],
    score = 0,
    scoreString = '',
    scoreText,
    alienTimer = 0,
    moveAliensNextRow = false,
    movingRight = true,
    alienMoveEveryMs = 55 * 16,
    wallRight,
    wallLeft,
    lives,
    livesText,
    numLives = 3,
    deathTimer = 0,
    bases,
    baseBmps = [],
    baseDamageBmp,
    barriers = 4,
    highscoreText,
    highscoreString,
    stateText,
    alienSound,
    alienExplodeSound,
    ufoSound,
    ufoExplodeSound,
    playerExplodeSound,
    playerShootSound,
    spaceKey;

var Game = {
  preload: function() {
    game.load.bitmapFont('minecraftia', 'assets/fonts/minecraftia.png', 'assets/fonts/minecraftia.xml');

    game.load.image('bullet', 'assets/images/thisthing.png');
    game.load.image('explosion', 'assets/images/explosion.png');
    game.load.image('mothership', 'assets/images/mothership2.png');
    game.load.image('background', 'assets/images/background.png');
    game.load.image('ship-explosion', 'assets/images/destroyed-ship.png');
    game.load.image('blank', 'assets/images/blank.png');
    game.load.image('base', 'assets/images/barrier.png');

    game.load.spritesheet('ship', 'assets/images/newship.png', 109.5, 60, 2);
    game.load.spritesheet('alien1', 'assets/images/alien1.png', 87.5, 70, 2);
    game.load.spritesheet('alien2', 'assets/images/alien2.png', 99.5, 70, 2);
    game.load.spritesheet('alien3', 'assets/images/alien3.png', 107, 70, 2);
    game.load.spritesheet('enemy-bullet', 'assets/images/enemy-bullets.png', 16, 30, 2);

    game.load.audio('alien-move', 'assets/audio/alien-move.wav');
    game.load.audio('alien-explode', 'assets/audio/alien-explode.wav');
    game.load.audio('ufo-move', 'assets/audio/ufo.wav');
    game.load.audio('ufo-explode', 'assets/audio/ufo-explosion.wav');
    game.load.audio('player-explode', 'assets/audio/player-explode.wav');
    game.load.audio('player-bullet', 'assets/audio/player-bullet.wav');
    game.load.audio('player-shoot', 'assets/audio/player-shoot.wav');
  },

  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.tileSprite(0, 0, 800, 600, 'background');
    stateText = game.add.bitmapText(game.world.centerX, game.world.height / 3, 'minecraftia', '', 30);
    stateText.x = game.width / 2  - stateText.textWidth / 2;
    stateText.visible = false;

    alienSound = game.add.audio('alien-move');
    alienExplodeSound = game.add.audio('alien-explode');
    // ufoSound = game.add.audio('ufo-move');
    // ufoExplodeSound = game.add.audio('ufo-explode');
    playerExplodeSound = game.add.audio('player-explode');
    playerShootSound = game.add.audio('player-shoot');

    // ship's bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // enemy bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemy-bullet')
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    // motherships
    motherships = game.add.group();
    motherships.enableBody = true;
    motherships.physicsBodyType = Phaser.Physics.ARCADE;
    motherships.createMultiple(30, 'mothership');
    motherships.setAll('anchor.x', 0.5);
    motherships.setAll('anchor.y', 0.5);

    // our ship
    player = game.add.sprite(336, 680, 'ship');
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.anchor.setTo(0.5, 0.5);
    player.scale.setTo(0.5, 0.5);
    player.animations.add('explode-ship', [1, 0, 1, 0, 1, 0], 10, false);
    player.body.collideWorldBounds = true;

    // dead ship
    destroyedShips = game.add.group();
    destroyedShips.createMultiple(30, 'ship-explosion');
    destroyedShips.setAll('anchor.x', 0.5);
    destroyedShips.setAll('anchor.y', 0.5);

    // aliens
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    this.createAliens();

    // explosions
    explosions = game.add.group();
    explosions.createMultiple(30, 'explosion');
    explosions.forEach(this.setupInvader, this);
    explosions.setAll('anchor.x', 0.5);
    explosions.setAll('anchor.y', 0.5);

    // score
    scoreString = 'SCORE<1>\n';
    scoreText = game.add.bitmapText(20, 30, 'minecraftia', scoreString + '000' + score);
    scoreText.fontSize = 30;
    scoreText.fill = '#fff';
    game.add.bitmapText(500, 10, 'minecraftia', 'SCORE<2>', 30)
    game.add.bitmapText(500, 725, 'minecraftia', 'CREDIT 04', 25)

    // high score
    if (!localStorage.hiScore) {
      localStorage.hiScore = "0000"
    }
    highscoreString = 'HI-SCORE\n';
    highscoreText = game.add.bitmapText(250, 30, 'minecraftia', highscoreString + localStorage.hiScore);
    highscoreText.fontSize = 30;


    // invisible wall
    wallLeft = game.add.tileSprite(20, 0, 8, game.height, 'blank');
    wallRight = game.add.tileSprite(game.width - 20, 0, 8, game.height, 'blank');

    game.physics.enable([ wallLeft, wallRight ], Phaser.Physics.ARCADE);

    wallLeft.body.immovable = true;
    wallLeft.body.allowGravity = false;

    wallRight.body.immovable = true;
    wallRight.body.allowGravity = false;

    // controls
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)

    // lives
    lives = game.add.group();
    livesText = game.add.bitmapText(20, 730, 'minecraftia', numLives.toString());
    livesText.fontSize = 25;
    livesText.fill = '#fff';

    for (var i = 0; i < 2; i++) {
      var ship = lives.create(50 + (40 * i), 740, 'ship');
      ship.scale.setTo(0.3, 0.3);
    }
    lives.reverse();

    // bases
    var baseY = (game.world.height / 8) * 7 - 125;
    var distanceBetweenBases = game.width / (barriers);

    bases = game.add.group();
    bases.enableBody = true;

    baseDamageBmp = game.make.bitmapData(16, 16);
    baseDamageBmp.rect(1, 1, 5, 5, 'black');

    baseBmp = [];

    for (var i = 0; i < barriers; i++) {
        var baseResize = 100;
        var baseBmp = game.make.bitmapData(baseResize, baseResize);
        baseBmp.draw('base', 0, 0, baseResize, baseResize);
        baseBmp.update();
        var baseX = (i * distanceBetweenBases + 65) - (baseResize / 3);
        var base = game.add.sprite(baseX, baseY, baseBmp);
        bases.add(base);
        baseBmps.push({
            bmp: baseBmp,
            worldX: baseX,
            worldY: baseY
        });
    }
  },

  createEnemyBullets: function() {
    for (var i = 0; i < 30; i++) {
      var enemyBullet = enemyBullets.create('enemy-bullet')
      enemyBullet.animations.add('shoot', [0, 1], 1, true);
    }
  },

  createAliens: function() {
    for (var y = 0; y < 5; y++) {
      for (var x = 0; x < 11; x++) {
        if (y === 0) {
          var alien = aliens.create(x * 52, y * 52, 'alien1');
        } else if (y === 1 || y === 2) {
          var alien = aliens.create(x * 52, y * 52, 'alien2');
        } else if (y === 3 || y == 4) {
          var alien = aliens.create(x * 52, y * 52, 'alien3');
        }
        alien.scale.setTo(0.4, 0.4);
        alien.anchor.setTo(0.5, 0.5);
      }
    }
    aliens.x = 50;
    aliens.y = 175;
  },

  setupInvader: function(invader) {
    invader.anchor.x = 0;
    invader.anchor.y = 0;
    invader.animations.add('explosion')
  },

  descend: function() {
    aliens.y += 10;
  },

  update: function() {
    if (player.alive) {
      player.body.velocity.setTo(0, 0);
      if (this.game.time.now > deathTimer) {
        if (cursors.left.isDown) {
          player.body.velocity.x = -200;
        } else if (cursors.right.isDown) {
          player.body.velocity.x = 200;
        }

        if (fireButton.isDown) {
          this.fireBullet();
        }
      }

      if (game.time.now > firingTimer) {
        this.enemyFires();
      }

      if (alienTimer < this.game.time.now && aliens.countLiving() > 0) {
        this.moveAliens();
      }

      if (game.time.now > mothershipTimer) {
        var mothership = motherships.getFirstExists(false);
        mothership.scale.setTo(1.1, 1.1);
        if (mothership) {
          mothership.reset(-100, 125)
          mothership.body.velocity.x = 80;
          mothershipTimer = game.time.now + Math.floor(Math.random() * 10000) + 25000;
        }
      }

      // collision
      game.physics.arcade.overlap(bullets, aliens, this.collisionHandler, null, this);
      game.physics.arcade.overlap(bullets, motherships, this.destroyMothership, null, this);
      game.physics.arcade.overlap(enemyBullets, player, this.enemyHitsPlayer, null, this);
      game.physics.arcade.overlap(enemyBullets, bullets, this.bulletsHit, null, this);
      game.physics.arcade.overlap(aliens, wallRight, this.aliensEndOfRowRight, null, this);
      game.physics.arcade.overlap(aliens, wallLeft, this.aliensEndOfRowLeft, null, this);
      game.physics.arcade.overlap(aliens, player, this.aliensEatPlayer, null, this)
      game.physics.arcade.overlap(enemyBullets, bases, this.hitBase, null, this);
      game.physics.arcade.overlap(bullets, bases, this.hitBase, null, this);
    }
  },

  hitBase: function(bullet, base) {
    var baseIdx = bases.getChildIndex(base);
    var matchingBmp = baseBmps[baseIdx];

    var bmpRelativeX = Math.round(bullet.x - matchingBmp.worldX);
    var bmpRelativeY = Math.round(bullet.y - matchingBmp.worldY);
    var bmpPixelRgba = matchingBmp.bmp.getPixelRGB(bmpRelativeX, bmpRelativeY);

    if (bmpPixelRgba.color === 4278254592) {
      for (var i = 0; i < 20; i++) {
        var randX = Math.floor(Math.random() * 30 - 15)
        var randY = Math.floor(Math.random() * 30 - 15)

        matchingBmp.bmp.draw(baseDamageBmp, bmpRelativeX - randX, bmpRelativeY - randY)
      }
      matchingBmp.bmp.update();
      bullet.kill();
    }
  },

  moveAliens: function() {
    alienTimer = game.time.now + alienMoveEveryMs;
    alienSound.play();

    aliens.forEachAlive(function(nextAlien) {
      nextAlien.frame = (nextAlien.frame === 0 ? 1 : 0);
    });

    if (moveAliensNextRow) {
      this.moveAliensDown();
    } else {
      if (movingRight) {
        aliens.x += 10;
      } else {
        aliens.x -= 10;
      }
    }
  },

  moveAliensDown: function() {
    aliens.y += 25;
    moveAliensNextRow = false;
  },

  aliensEndOfRow: function() {
    movingRight = !movingRight;
    moveAliensNextRow = true;
  },

  aliensEndOfRowRight: function(theAliens, theWall) {
    if (movingRight) {
        this.aliensEndOfRow();
    }
  },

  aliensEndOfRowLeft: function(theAliens, theWall) {
    if (!movingRight) {
        this.aliensEndOfRow();
    }
  },

  collisionHandler: function(bullet, alien) {
    bullet.kill();
    alien.kill();
    alienExplodeSound.play();

    if (alien.key === 'alien3') {
      score += 10;
    } else if (alien.key === 'alien2') {
      score += 20;
    } else if (alien.key === 'alien1') {
      score += 30;
    }

    if (score.toString().length === 2) {
      scoreText.text = scoreString + '00' + score;
    } else if (score.toString().length === 3) {
      scoreText.text = scoreString + '0' + score;
    } else if (score.toString().length > 3) {
      scoreText.text = scoreString + score;
    }

    // explosion
    var explosion = explosions.getFirstExists(false);
    explosion.scale.setTo(0.35, 0.35);
    explosion.reset(alien.body.center.x, alien.body.center.y);
    explosion.play('explosion', 10, false, true);

    // increase alien speed
    alienMoveEveryMs = aliens.countLiving() * 16

    if (aliens.countLiving() == 0) {
      this.gameOver("WELL DONE EARTHLING\nTHIS TIME YOU WIN");
    }
  },

  destroyMothership: function(bullet, mothership) {
    bullet.kill();
    mothership.kill();

    var possible_scores = [50, 100, 150, 300]
    score += possible_scores[Math.floor(Math.random() * possible_scores.length)]

    if (score.toString().length === 3) {
      scoreText.text = scoreString + '0' + score;
    } else if (score.toString().length > 3) {
      scoreText.text = scoreString + score;
    }

    var explosion = explosions.getFirstExists(false);
    explosion.scale.setTo(0.35, 0.35);
    explosion.reset(mothership.body.center.x, mothership.body.center.y);
    explosion.play('explosion', 10, false, true);
  },

  enemyHitsPlayer: function(player, enemyBullet) {
    player.animations.play('explode-ship');
    enemyBullet.kill();
    playerExplodeSound.play();

    var life = lives.getFirstAlive();

    if (life) {
      life.kill();
    }
    numLives--;
    livesText.text = numLives.toString();

    if (numLives === 0) {
      player.kill();
      enemyBullets.callAll('kill')
      // add text and spacebar to restart
      this.gameOver("GAME OVER");
    } else {
      deathTimer = this.game.time.now + 1000;
    }
  },

  aliensEatPlayer: function(player, alien) {
    player.play('explode-ship');
    playerExplodeSound.play();

    var life = lives.getFirstAlive();

    if (life) {
      life.kill();
    }
    numLives--
    livesText.text = numLives.toString();

    if (numLives === 0) {
      player.kill();
      enemyBullets.callAll('kill')

      this.gameOver("GAME OVER");
      // add text and spacebar to restart
    } else {
      deathTimer = this.game.time.now + 1000;
    }
  },

  bulletsHit: function(bullet, enemyBullet) {
    bullet.kill();
    enemyBullet.kill();

    var explosion = explosions.getFirstExists(false);
    explosion.scale.setTo(0.30, 0.30);
    explosion.reset(enemyBullet.body.center.x, enemyBullet.body.center.y);
    explosion.play('explosion', 10, false, true);
  },

  enemyFires: function()  {
    var enemyBullet = enemyBullets.getFirstExists(false);
    livingEnemies.length = 0;

    aliens.forEachAlive(function(alien) {
      livingEnemies.push(alien)
    })

    if (enemyBullet && livingEnemies.length > 0) {
      var random = game.rnd.integerInRange(0, livingEnemies.length - 1);
      var shooter = livingEnemies[random];

      enemyBullet.scale.setTo(0.8, 0.8)
      enemyBullet.animations.add('shoot', [0, 1], 10, true);
      enemyBullet.play('shoot');
      enemyBullet.reset(shooter.body.center.x, shooter.body.center.y);

      enemyBullet.body.velocity.y = 300;
      firingTimer = game.time.now + 2000;
    }
  },

  fireBullet: function() {
    if (game.time.now > bulletTime) {
      bullet = bullets.getFirstExists(false);
      bullet.scale.setTo(0.3, 0.3);
      if (bullet) {
        bullet.reset(player.x, player.y + 8);
        bullet.body.velocity.y = -600;
        bulletTime = game.time.now + 700;
        // bulletTime = game.time.now + 50
        playerShootSound.play();
      }
    }
  },

  displayNextLetter: function() {
    stateText.text=  this.message.substr(0, this.counter);
    this.counter += 1;
  },

  displayLetterByLetterText: function(message) {
    stateText.text = message;
    stateText.x = game.width / 2  - stateText.textWidth / 2;
    stateText.text = "";
    stateText.visible = true;

    var timerEvent = game.time.events.repeat(100, message.length, this.displayNextLetter, { message: message, counter: 1 });

    timerEvent.timer.onComplete.add(function() {
      fireButton.onDown.addOnce(this.restart, this)
    }, this);
  },

  gameOver: function(message) {
    // isGameOver = true;
    var newHiScore = false;
    if (score > localStorage.hiScore) {
        var zeroes = ''
        for (var i = 0; i < 4 - score.toString().length; i++) {
          zeroes = zeroes.concat('0')
        }
        localStorage.hiScore = zeroes + score.toString();

      newHiScore = true;
    }

    aliens.callAll('kill')
    motherships.callAll('kill');
    bases.callAll('kill');
    player.kill();
    lives.callAll('kill'); // kill off all lives

    var fullMessage = message;
    if (newHiScore) {
        fullMessage += "\n\nNEW HI SCORE!";
    }
    fullMessage += "\n\nSPACEBAR TO RESTART";

    this.displayLetterByLetterText(fullMessage);

    game.sound.stopAll();

  },

  restart: function(nextLevel) {
    stateText.visible = false;

    [ bullets, aliens, enemyBullets, bases, lives].every(function(group) {
        group.destroy();
    });
    numLives = 3;
    score = 0;
    barriers = 4;
    baseBmps = [];
    // lives == 2;
    // movingRight = true;

    // and destroy all the sounds
    game.sound.destroy();

    // isGameOver = false;
    alienMoveEveryMs = 55 * 16;
    game.world.removeAll();

    this.create();
  }
}
