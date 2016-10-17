(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(badguy, platform, game) {

	// Phaser settings
	game.physics.arcade.enable(badguy);
	badguy.body.gravity.y = 450;
	badguy.body.collideWorldBounds = true;
	badguy.health = 1;
	
	// Custom props
	badguy.territory = platform;
	badguy.patrolDir = -1; // -1 for left, 1 for right
	badguy.patrolling = false;
	
	badguy.animations.add('walkLeft', [7, 8, 9, 8, 7, 10, 11, 10], 30);
	badguy.animations.add('walkRight', [2, 3, 4, 3, 2, 5, 6, 5], 30);

	// Custom methods
	badguy.patrol = function() {
		// Start patrolling after drop
		if (badguy.patrolling === false && badguy.body.touching.down) {
			badguy.patrolling = true;
			badguy.animations.play('walkLeft', 30, true);
		}

		// Out of bounds left
		if (badguy.patrolDir === -1 && badguy.position.x < badguy.territory.platformBounds[0]) {
			badguy.reverseDir();
		}
		// Out of bounds right
		if (badguy.patrolDir === 1 && badguy.position.x > badguy.territory.platformBounds[1]) {
			badguy.reverseDir();
		}
		// Screen edge
		if (badguy.body.blocked.left || badguy.body.blocked.right) {
			badguy.reverseDir();
		}

		if (badguy.patrolling === true) {
			badguy.body.velocity.x = 100 * badguy.patrolDir;
		}

	},
	
	badguy.reverseDir = function() {
		badguy.patrolDir = badguy.patrolDir * -1;
		if (badguy.patrolDir === -1) {
			badguy.animations.play('walkLeft', 30, true);
		} else {
			badguy.animations.play('walkRight', 30, true);
		}

	},
	
	badguy.playerCollide = function(guard, player) {
		badguy.reverseDir();
		
		player.isRebounding = true;
		player.setEndRebound = game.time.now + 250;
		player.body.velocity.x = 100 * badguy.patrolDir * -1;
		player.body.velocity.y = -50;
		
		player.damage(1);
		badguy.createBoom(player);
	}
	
	badguy.createBoom = function(player) {
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

	return badguy;
	
}
},{}],2:[function(require,module,exports){
module.exports = function(player, game) {
	
	var createPlayerAttack = require('./playerattack');
	
	// The player and its settings
	//gameObjects.playersArray.push(player)
	//  We need to enable physics on the player
	game.physics.arcade.enable(player);
	
	// Set up keyboard bindings
	var cursors = game.input.keyboard.createCursorKeys();
	var fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	
	//  Player physics properties
	player.body.bounce.y = 0.2;
	player.body.bounce.x = 1;
	player.body.gravity.y = 450;
	player.body.collideWorldBounds = true;
	player.health = 800;

	player.facing = 'right';
	player.isRebounding = false;
	player.setEndRebound = null;
	player.isJumping = false;
	
	player.attack = createPlayerAttack(player, game);
	player.isAttacking = false;
	
	player.animations.add('walkLeft', [7, 8, 9, 8, 7, 10, 11, 10], 30);
	player.animations.add('walkRight', [2, 3, 4, 3, 2, 5, 6, 5], 30);
	
	player.controlPlayer = function() {
		if(player.isRebounding === false && player.isAttacking === false) {
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
				player.setIdle();
			}
			//  Allow the player to jump if they are touching the ground.
			if (player.isJumping === true && player.body.touching.down) {
				player.isJumping = false;
			}
			if (cursors.up.isDown && player.body.touching.down) {
				player.isJumping = true;
				player.body.velocity.y = -350;
			}
			if (!player.body.touching.down && player.isJumping === true) {
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
	
	player.animations.add('punchLeft', [17, 18, 19], 24);
	player.animations.add('punchRight', [14, 15, 16], 24);
	player.doAttack = function () {
		if (player.isAttacking === false && player.isJumping === false) {
			player.isAttacking = true;
			if (player.facing === 'left') {
				player.animations.play('punchLeft');
			} else {
				player.animations.play('punchRight');
			}
			player.attack.render();
		} else {
			
		}
	}
	player.endAttack = function () {
		if(player.frame === 14) {
			player.setIdle();
		}
	}
	player.setIdle = function () {
		if (player.facing === 'right') {
			player.frame = 2;
		} else {
			player.frame = 7;
		}
	}
	
	return player;
};
},{"./playerattack":3}],3:[function(require,module,exports){
module.exports = function(player, game) {
	
	attack = game.add.sprite(0, 0, 'punch');
	attack.enableBody = true;
	game.physics.arcade.enable(attack);
	
//	playerAttacks.push(playerAttack);

	attack.player = player;
	attack.x = -200;
	attack.y = -200;
	attack.attackEnd = null;
	attack.spent = false;
	
	attack.animations.add('attackingRight', [1, 2, 3, 4, 5, 6, 7, 8], 10)
	attack.animations.add('attackingLeft', [9, 10, 11, 12, 13, 14, 15, 16], 10)
	attack.frame = 1;
	
	attack.damageEnemy = function (guard, attack) {
		if(attack.spent === false) {
			guard.damage(2);
			attack.spent = true;
		}
	}
	attack.testAttack = function () {
		if (attack.player.isAttacking === true && attack.attackEnd < game.time.now) {
			attack.player.isAttacking = false;
			attack.player.endAttack();
			attack.reset(-200, -200);
			attack.frame = 1;
		}
	}
//	attack.position = function() {
//		var direction = attack.player.facing;
//		var xPos = attack.player.x;
//		var yPos = attack.player.y;
//		if (direction === 'left') {
//			xPos = xPos - 40;
//		} else {
//			xPos = xPos + 40;
//		}
//		attack.reset(xPos, yPos);
//	}

	attack.render = function() {
		var direction = attack.player.facing;
		var xPos = attack.player.x;
		var yPos = attack.player.y;
		if (direction === 'left') {
			xPos = xPos - 40;
		} else {
			xPos = xPos + 40;
		}
		attack.reset(xPos, yPos);
		attack.attackEnd = game.time.now + 800;
		if (direction === 'left') {
			attack.animations.play('attackingLeft');
		} else {
			attack.animations.play('attackingRight');
		}
		attack.spent = false;
	}
	
	return attack;

}
},{}],4:[function(require,module,exports){
var createPlayer = require('./createplayer');
var createBadguy = require('./createbadguy');

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
	preload: preload,
	create: create,
	update: update
});

function preload() {
	game.load.image('ground', 'assets/platform.png');
	game.load.spritesheet('badguy', 'assets/blockbot-sprite.png', 40, 40);
	game.load.spritesheet('blockySprite', 'assets/blocky-sprite.png', 40, 40);
	game.load.spritesheet('punch', 'assets/punch.png', 40, 40);
}

var badguyArray = [];
var platformsArray = [];
var playersArray = [];
var playerAttacks = [];

var gameObjects = {
	badguyArray: [],
	platformsArray: [],
	playersArray: [],
	playerAttacks: []
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
		var badguy = game.add.sprite(elem.x + 200, elem.y - 40, 'badguy');
		var badguy = createBadguy(badguy, elem, game);
		badguyArray.push(badguy);
	});

	// Create the player
	var player = game.add.sprite(32, game.world.height - 150, 'blockySprite');
	var player = createPlayer(player, game);
	playersArray.push(player);
	playerAttacks.push(player.attack);

	// createPlayer(player)

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
	badguyArray.forEach(function(elem, index, array) {
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

function createPlatforms(noPlatforms) {
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
}
},{"./createbadguy":1,"./createplayer":2}]},{},[1,2,3,4]);
