var scoreText,
    highscoreString,
    highscoreText,
    openingText,
    spaceBar,
    instructions,
    mothership,
    alien1,
    alien2,
    alien3,
    scoreTable,
    alienScores;

var Menu = {
  preload: function() {
    game.load.bitmapFont('minecraftia', 'assets/fonts/minecraftia.png', 'assets/fonts/minecraftia.xml');
    game.load.image('background', 'assets/images/background.png');
    game.load.image('mothership', 'assets/images/mothership2.png');
    game.load.spritesheet('alien1', 'assets/images/alien1.png', 87.5, 70, 2);
    game.load.spritesheet('alien2', 'assets/images/alien2.png', 99.5, 70, 2);
    game.load.spritesheet('alien3', 'assets/images/alien3.png', 107, 70, 2);
  },

  create: function() {
    // start game
    spaceBar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    spaceBar.onDown.addOnce(this.startGame, this)

    // invaders
    mothership = game.add.sprite(210, 425, 'mothership')
    alien1 = game.add.sprite(218, 465, 'alien1')
    alien1.scale.setTo(0.35, 0.35)
    alien1.frame = 1
    alien2 = game.add.sprite(218, 505, 'alien2')
    alien2.scale.setTo(0.35, 0.35)
    alien3 = game.add.sprite(215, 545, 'alien3')
    alien3.frame = 1
    alien3.scale.setTo(0.35, 0.35)

    // score table
    scoreTable = game.add.bitmapText(game.width / 2 - 10, 400, 'minecraftia', 'SCORE TABLE', 25)
    scoreTable.anchor.setTo(0.5, 0.5)
    alienScores = game.add.bitmapText(265, 425, 'minecraftia', '= ? MYSTERY\n= 30 POINTS\n= 20 POINTS\n= 10 POINTS', 25)

    // score
    scoreText = game.add.bitmapText(20, 10, 'minecraftia', 'SCORE<1>\n0000');
    scoreText.fontSize = 30;
    scoreText.fill = '#fff';
    game.add.bitmapText(500, 10, 'minecraftia', 'SCORE<2>', 30)
    game.add.bitmapText(500, 725, 'minecraftia', 'CREDIT 00', 25)

    // high score
    if (!localStorage.hiScore) {
      localStorage.hiScore = "0000"
    }
    highscoreString = 'HI-SCORE\n';
    highscoreText = game.add.bitmapText(250, 10, 'minecraftia', highscoreString + localStorage.hiScore);
    highscoreText.fontSize = 30;

    // opening text
    openingText = game.add.bitmapText(game.width / 2, 200, 'minecraftia', 'SPACE INVADERS\n\n')
    openingText.anchor.setTo(0.5, 0.5)
    instructions1 = game.add.bitmapText(game.width / 2, 250, 'minecraftia', 'LEFT/RIGHT ARROWS TO MOVE', 25)
    instructions1.anchor.setTo(0.5, 0.5)
    instructions2 = game.add.bitmapText(game.width / 2, 290, 'minecraftia', 'SPACEBAR TO SHOOT', 25)
    instructions2.anchor.setTo(0.5, 0.5)
    toStart = game.add.bitmapText(game.width / 2, 650, 'minecraftia', 'BEGIN GAME WITH SPACEBAR', 25)
    toStart.anchor.setTo(0.5, 0.5)

  },

  startGame: function() {
    this.state.start('Game');
  }
}
