module.exports = function(player, game) {
	
	var createPlayerAttack = require('./playerattack');
	
	// The player and its settings
	//gameObjects.playersArray.push(player)
	//  We need to enable physics on the player
	game.physics.arcade.enable(player);
	
	// Set up keyboard bindings
	var cursors = game.input.keyboard.createCursorKeys();
	var fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	var testAnim = game.input.keyboard.addKey(Phaser.Keyboard.A);
	
	//  Player physics properties
	player.body.bounce.y = 0.2;
	player.body.bounce.x = 1;
	player.body.gravity.y = 450;
	player.body.collideWorldBounds = true;
	player.health = 1;

	player.facing = 'right';
	player.isRebounding = false;
	player.setEndRebound = null;
	player.isJumping = false;
	
	player.attack = createPlayerAttack(player, game);
	player.isAttacking = false;
	
	player.isDying = false;
	
	player.animations.add('walkLeft', [7, 8, 9, 8, 7, 10, 11, 10], 30);
	player.animations.add('walkRight', [2, 3, 4, 3, 2, 5, 6, 5], 30);
	player.animations.add('death', [20, 20, 21, 22, 23], 5);
	
	player.kill = function() {
		// This replaces Phasers existing kill function
		player.animations._anims.death.onComplete.add(function() {
			player.alive = false;

			var fadeTween = game.add.tween(player).to( {alpha: 0}, 400);
			fadeTween.start();
			
			fadeTween.onComplete.add(function() {
				player.exists = false;
				player.visible = false;

				if (player.events) {
					player.events.onKilled.dispatch(player);
				}
				
				return player;
			})

		}, this)
		
		player.isDying = true;
		player.animations.play('death');

	};
	
	player.controlPlayer = function() {
		// TODO: This needs refactoring
		if(player.isRebounding === false && player.isAttacking === false && player.isDying === false) {
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
		if(testAnim && testAnim.isDown) {
			console.log('Test');
		}
	}
	player.playerMovement = function() {
		if (!player.isRebounding) {
			player.body.velocity.x = 0;
		} else {
			if (game.time.now > player.setEndRebound) {
				player.isRebounding = false;
				player.reboundDone.dispatch();
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