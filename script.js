var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
	preload: preload,
	create: create,
	update: update
});

function preload() {
	game.load.image('ground', 'platform.png');
	game.load.image('star', 'star.png');
}

function create() {

	//  We're going to be using physics, so enable the Arcade Physics system
	game.physics.startSystem(Phaser.Physics.ARCADE);

	//  The platforms group contains the ground and the platforms we can jump on
	platformsGroup = game.add.group();
	//  We will enable physics for any object that is created in this group
	platformsGroup.enableBody = true;

	// Here we create the ground.
	var ground = platformsGroup.create(0, game.world.height - 64, 'ground');
	//  Scale it to fit the width of the game (the original sprite is 400x32 in size)
	ground.scale.setTo(2, 2);
	//  This stops it from falling away when you jump on it
	ground.body.immovable = true;

	//  Create a platform
	var platform = platformsGroup.create(400, 400, 'ground');
	createPlatform(platform);

	// Create guard
	platformsArray.forEach(function(elem, index, array) {
		createGuard(elem);
	});

	// Create the player
	var player = game.add.sprite(32, game.world.height - 150, 'star');
	createPlayer(player)
	cursors = game.input.keyboard.createCursorKeys();
}

function update() {

	playersArray.forEach(function(elem, index, array) {
		//  Collide the player and the stars with the platforms
		game.physics.arcade.collide(elem, platformsGroup);
		//  Reset the players velocity (movement)
		elem.body.velocity.x = 0;

		elem.controlPlayer();
	});

	//  Collide the guard and the stars with the platforms
	guardsArray.forEach(function(elem, index, array) {
		game.physics.arcade.collide(elem, platformsGroup);
		playersArray.forEach(function(playerElem) {
			game.physics.arcade.collide(elem, playerElem, elem.playerCollide);
		});
		elem.body.velocity.x = 0;
		elem.patrol();
	});

}

var guardsArray = [];
var platformsArray = [];
var playersArray = []

function createPlayer(player) {
	// The player and its settings
	playersArray.push(player)
	//  We need to enable physics on the player
	game.physics.arcade.enable(player);
	
	//  Player physics properties
	player.body.bounce.y = 0.2;
	player.body.gravity.y = 450;
	player.body.collideWorldBounds = true;
	player.health = 4;
	
	console.log(player)
	
	player.controlPlayer = function() {
		if (cursors.left.isDown) {
			//  Move to the left
			player.body.velocity.x = -150;
			player.animations.play('left');
		} else if (cursors.right.isDown) {
			//  Move to the right
			player.body.velocity.x = 150;
			player.animations.play('right');
		} else {
			//  Stand still
			player.animations.stop();
			player.frame = 4;
		}
		//  Allow the player to jump if they are touching the ground.
		if (cursors.up.isDown && player.body.touching.down) {
			player.body.velocity.y = -350;
		}
	}
}

function createPlatform(platform) {
	platformsArray.push(platform)

	platform.body.immovable = true;
	platform.platformBounds = [400 + 10, 400 + 400 - 10]
	// [leftPos + 10, leftPos + platformLength - 10]
}

function createGuard(platform) {
	// Set up phaser object and refs
	var newGuard = game.add.sprite(450, game.world.height - 450, 'star');
	guardsArray.push(newGuard)

	// Phaser settings
	game.physics.arcade.enable(newGuard);
	newGuard.body.gravity.y = 450;
	newGuard.body.collideWorldBounds = true;

	// Custom props
	newGuard.territory = platform;
	newGuard.patrolDir = -1; // -1 for left, 1 for right
	newGuard.patrolling = false;

	// Custom methods
	newGuard.patrol = function() {
		// Start patrolling after drop
		if (newGuard.patrolling === false && newGuard.body.touching.down) {
			newGuard.patrolling = true;
		}

		// Out of bounds left
		if (newGuard.patrolDir === -1 && newGuard.position.x < newGuard.territory.platformBounds[0]) {
			newGuard.reverseDir();
		}
		// Out of bounds right
		if (newGuard.patrolDir === 1 && newGuard.position.x > newGuard.territory.platformBounds[1]) {
			newGuard.reverseDir();
		}
		// Screen edge
		if (newGuard.body.blocked.left || newGuard.body.blocked.right) {
			newGuard.reverseDir();
		}

		if (newGuard.patrolling === true) {
			newGuard.body.velocity.x = 100 * newGuard.patrolDir;
		}

	},
	
	newGuard.reverseDir = function() {
		newGuard.patrolDir = newGuard.patrolDir * -1;
	},
	
	newGuard.playerCollide = function(guard, player) {
		// this is Guard obj
		console.log(this)
		newGuard.reverseDir();
//		player.body.velocity.x = -20;
//		player.body.velocity.y = -20;
		player.damage(1);
		console.log(player.health)
	}
}
