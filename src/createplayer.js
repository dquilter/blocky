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
	player.doAttack = function () {
		if (player.isAttacking === false && player.isJumping === false) {
			player.isAttacking = true;
			player.frame = 14;
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