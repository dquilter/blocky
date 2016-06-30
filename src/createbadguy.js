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

	// Custom methods
	badguy.patrol = function() {
		// Start patrolling after drop
		if (badguy.patrolling === false && badguy.body.touching.down) {
			badguy.patrolling = true;
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
	},
	
	badguy.playerCollide = function(guard, player) {
		badguy.reverseDir();
		
		player.isRebounding = true;
		player.setEndRebound = game.time.now + 250;
		player.body.velocity.x = 100 * badguy.patrolDir * -1;
		player.body.velocity.y = -50;
		
		player.damage(1);
		createBoom(player);
	}

	return badguy;
	
}