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