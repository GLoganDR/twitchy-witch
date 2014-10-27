// Initialize Phaser, and create a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');

// Create our 'main' state that will contain the game
var s;
var mainState = {
  preload: function(){ 
    // This function will be executed at the beginning     
    // That's where we load the game's assets
    // Change the background color of the game
    game.load.image('starfield', 'assets/misc/starfield.jpg');
    // Load the witch sprite
    game.load.image('witch', 'assets/witch.png');
    //Load the crosses
    game.load.image('cross', 'assets/cross.png');
    //Load in the jump sound
    game.load.audio('squit', 'assets/audio/SoundEffects/squit.wav');
    //Load in the death sound
    game.load.audio('jump', 'assets/audio/SoundEffects/meow2.mp3');
    //Game Sound
    game.load.audio('game', 'assets/audio/oedipus_wizball_highscore.mp3', 'assets/audio/oedipus_wizball_highscore.ogg');
  },

  create: function(){
    s = game.add.tileSprite(0, 0, 400, 490, 'starfield');
    // This function is called after the preload function     
    // Here we set up the game, display sprites, etc.
    // Set the physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
    // Display the witch on the screen
    this.witch = this.game.add.sprite(100, 245, 'witch');
    // Add gravity to the witch to make it fall
    game.physics.arcade.enable(this.witch);
    this.witch.body.gravity.y = 1000;  
    // Call the 'jump' function when the spacekey is hit
    var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.jump, this);

    this.crosses = game.add.group(); // Create a group  
    this.crosses.enableBody = true;  // Add physics to the group  
    this.crosses.createMultiple(20, 'cross'); // Create 20 crosses

    this.timer = game.time.events.loop(1500, this.addRowOfCrosses, this);

    this.score = 0;  
    this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });
    //set the anchor
    this.witch.anchor.setTo(-0.2, 0.5);
    //Add Sound
    this.jumpSound = game.add.audio('jump');
    //Add Death Sound
    this.deathSound = game.add.audio('death');
    //Add Game Sound
    this.gameSound = game.add.audio('game');
    this.gameSound.play();
  },

  update: function(){
    // This function is called 60 times per second    
    // It contains the game's logic
    // If the witch is out of the world (too high or too low), call the 'restartGame' function
    if(this.witch.inWorld == false)
      this.restartGame();

    //game.physics.arcade.overlap(this.witch, this.crosses, this.restartGame, null, this);

    //updated code
    game.physics.arcade.overlap(this.witch, this.crosses, this.hitCross, null, this);

    if (this.witch.angle < 20)  
      this.witch.angle += 1;
  },

  // Make the witch jump 
  jump: function(){
    if(this.witch.alive == false)  
      return;  
    // Add a vertical velocity to the witch
    this.witch.body.velocity.y = -350;

    // Create an animation on the witch
    var animation = game.add.tween(this.witch);

    // Set the animation to change the angle of the sprite to -20° in 100 milliseconds
    animation.to({angle: -20}, 100);

    // And start the animation
    animation.start();

    //This block of code could have been written like this in one line:
    //game.add.tween(this.witch).to({angle: -20}, 100).start();

    this.jumpSound.play();
  },

  // Restart the game
  restartGame: function(){  
    // Start the 'main' state, which restarts the game
    game.state.start('main');  
    this.gameSound.stop();
  },

  addOneCross: function(x, y){  
    // Get the first dead cross of our group
    var cross = this.crosses.getFirstDead();

    // Set the new position of the cross
    cross.reset(x, y);

    // Add velocity to the cross to make it move left
    cross.body.velocity.x = -200; 

    // Kill the cross when it's no longer visible 
    cross.checkWorldBounds = true;
    cross.outOfBoundsKill = true;
  },

  addRowOfCrosses: function(){  
    // Pick where the hole will be
    var hole = Math.floor(Math.random() * 5) + 1;

    // Add the 6 crosses 
    for (var i = 0; i < 8; i++)
    if (i != hole && i != hole + 1) 
    this.addOneCross(400, i * 60 + 10);

    this.score += 1;  
    this.labelScore.text = this.score;   
  },

  hitCross: function(){  
    // If the witch has already hit a cross, we have nothing to do
    if (this.witch.alive == false)
      return;

    // Set the alive property of the witch to false
    this.witch.alive = false;

    // Prevent new crosses from appearing
    game.time.events.remove(this.timer);

    // Go through all the crosses, and stop their movement
    this.crosses.forEachAlive(function(c){
      c.body.velocity.x = 0;
    }, this);

    //play on death
    this.deathSound.play();

    //restarts music   
    this.gameSound.stop();
  },
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);  
game.state.start('main');