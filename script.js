var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
	preload: preload,
	create: create,
	update: update
});

function preload() {
	game.load.image('ground', 'assets/platform.png');
	game.load.image('star', 'assets/star.png');
	game.load.spritesheet('blockySprite', 'assets/BlockySprite.png', 40, 40);
	game.load.spritesheet('punch', 'assets/punch.png', 40, 40);
}

function create() {

	//  We're going to be using physics, so enable the Arcade Physics system
	game.physics.startSystem(Phaser.Physics.ARCADE);

	game.stage.backgroundColor = '#0FF';
	
	//  The platforms group contains the ground and the platforms we can jump on
	platformsGroup = game.add.group();
	//  We will enable physics for any object that is created in this group
	platformsGroup.enableBody = true;

	// Here we create the ground.
	var ground = platformsGroup.create(0, game.world.height - 40, 'ground');
	//  Scale it to fit the width of the game (the original sprite is 400x32 in size)
	ground.scale.setTo(2, 2);
	//  This stops it from falling away when you jump on it
	ground.body.immovable = true;

	//  Create a platform
	var noPlatforms = Math.floor(game.world.height / 100);
	createPlatforms(noPlatforms);

	// Create guard
	platformsArray.forEach(function(elem, index, array) {
		createGuard(elem);
	});

	// Create the player
	var player = game.add.sprite(32, game.world.height - 150, 'blockySprite');
	createPlayer(player)
	cursors = game.input.keyboard.createCursorKeys();
	fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

//	playerAttacksGroup = game.add.group();
}

function update() {

	playersArray.forEach(function(elem, index, array) {
		//  Collide the player and the stars with the platforms
		game.physics.arcade.collide(elem, platformsGroup);
		//  Reset the players velocity (movement)
		elem.playerMovement();
		elem.controlPlayer();
		elem.attack.testAttack();
	});

	//  Collide the guard and the stars with the platforms
	guardsArray.forEach(function(elem, index, array) {
		game.physics.arcade.collide(elem, platformsGroup);
		playersArray.forEach(function(playerElem) {
			game.physics.arcade.collide(elem, playerElem, elem.playerCollide);
		});
		elem.body.velocity.x = 0;
		elem.patrol();

		playerAttacks.forEach(function(thisAttack) {
			game.physics.arcade.overlap(elem, thisAttack, thisAttack.damageEnemy); 
		});
	});
	

}

var guardsArray = [];
var platformsArray = [];
var playersArray = [];
var playerAttacks = [];

function createPlayer(player) {
	// The player and its settings
	playersArray.push(player)
	//  We need to enable physics on the player
	game.physics.arcade.enable(player);
	
	//  Player physics properties
	player.body.bounce.y = 0.2;
	player.body.bounce.x = 1;
	player.body.gravity.y = 450;
	player.body.collideWorldBounds = true;
	player.health = 4;

	player.facing = 'right';
	player.isRebounding = false;
	player.setEndRebound = null;
	player.jumping = false;
	
	player.attack = createPlayerAttack(player);
	player.isAttacking = false;
	
	player.animations.add('walkLeft', [7, 8, 9, 8, 7, 10, 11, 10], 30);
	player.animations.add('walkRight', [2, 3, 4, 3, 2, 5, 6, 5], 30);
		
	player.controlPlayer = function() {
		if(player.isRebounding === false) {
			if (cursors.left.isDown) {
				player.facing = 'left';
				//  Move to the left
				player.body.velocity.x = -150;
				if (player.body.touching.down) {
					player.animations.play('walkLeft');
				}
			} else if (cursors.right.isDown) {
				player.facing = 'right';
				//  Move to the right
				player.body.velocity.x = 150;
				if (player.body.touching.down) {
					player.animations.play('walkRight');
				}
			} else {
				//  Stand still
				player.animations.stop();
				if (player.facing === 'right') {
					player.frame = 2;
				} else {
					player.frame = 7;
				}
			}
			//  Allow the player to jump if they are touching the ground.
			if (player.jumping === true && player.body.touching.down) {
				player.jumping = false;
			}
			if (cursors.up.isDown && player.body.touching.down) {
				player.jumping = true;
				player.body.velocity.y = -350;
			}
			if (!player.body.touching.down && player.jumping === true) {
				if (player.facing === 'left') {
					player.frame = 12;
				} else {
					player.frame = 13;
				}
			}
		}
		if(fireButton.isDown) {
			player.doAttack();
		}
	}
	player.playerMovement = function() {
		if (!player.isRebounding) {
			player.body.velocity.x = 0;
		} else {
			if (game.time.now > player.setEndRebound) {
				player.isRebounding = false;
			}
		}
	}
	player.doAttack = function () {
		if (player.isAttacking === false) {
			player.isAttacking = true;
			player.attack.render();
		} else {
			
		}
	}
}

function createPlayerAttack(player) {
	playerAttack = game.add.sprite(0, 0, 'punch');
	playerAttack.enableBody = true;
	game.physics.arcade.enable(playerAttack);
	
	playerAttacks.push(playerAttack);

	playerAttack.attackSource = player;
	playerAttack.x = -200;
	playerAttack.y = -200;
	playerAttack.attackEnd = null;
	playerAttack.spent = false;
	
	playerAttack.animations.add('attacking', [1, 2, 3, 4, 5, 6, 7, 8], 10)
	playerAttack.frame = 1;
	
	playerAttack.damageEnemy = function (guard, attack) {
		if(playerAttack.spent === false) {
			guard.damage(2);
			playerAttack.spent = true;
		}
	}
	playerAttack.testAttack = function () {
		if (playerAttack.attackSource.isAttacking === true && playerAttack.attackEnd < game.time.now) {
			playerAttack.attackSource.isAttacking = false;
			playerAttack.reset(-200, -200);
			playerAttack.frame = 1;
		}
	}
	playerAttack.render = function() {
		var direction = playerAttack.attackSource.facing;
		var xPos = playerAttack.attackSource.x;
		var yPos = playerAttack.attackSource.y;
		if (direction === 'left') {
			xPos = xPos - 40;
		} else {
			xPos = xPos + 40;
		}
		playerAttack.reset(xPos, yPos);
		playerAttack.attackEnd = game.time.now + 800;
		playerAttack.animations.play('attacking');
		playerAttack.spent = false;
	}
	
	return playerAttack;
}


function createPlatforms(noPlatforms) {
	console.log(noPlatforms)
	var platform;
	var yPos;
	var xPos;
	for (i = 0; i < noPlatforms; i++) {
		yPos = ( (game.world.height / noPlatforms) * (i + 1) ) - 40;
		xPos = (Math.random() * 800) - 100;
		platform = platformsGroup.create(xPos, yPos, 'ground');
		platformsArray.push(platform)
		
		platform.body.immovable = true;
		platform.platformBounds = [xPos + 10, xPos + 400 - 10 - 40]
		// [leftPos + 10, leftPos + platformLength - 10 - guardWidth]
	}

}

function createGuard(platform) {
	// Set up phaser object and refs
	var newGuard = game.add.sprite(platform.x + 200, platform.y - 40, 'star');
	guardsArray.push(newGuard)

	// Phaser settings
	game.physics.arcade.enable(newGuard);
	newGuard.body.gravity.y = 450;
	newGuard.body.collideWorldBounds = true;
	newGuard.health = 4;
	
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
		newGuard.reverseDir();
		
		player.isRebounding = true;
		player.setEndRebound = game.time.now + 250;
		player.body.velocity.x = -100;
		player.body.velocity.y = -50;
		
		player.damage(1);
		createBoom(player);
	}
}

function createBoom(player) {
	var position = player.position;
	
	var boom = game.add.text(position.x, position.y, 'BOOM!', {
		fill: '#FFFFFF',
		stroke: 'blue',
		align: 'center',
		fontSize: '22px'
	});
	
	if(player.health === 0) {
		boom.setText('You died...');
	}
	
	var fadeTimer = game.time.create();
	var fadeTween = game.add.tween(boom).to( {alpha: 0}, 400);
	
	fadeTimer.start();
	
	fadeTimer.add(400, function() {
		fadeTween.start();
	});
	
}