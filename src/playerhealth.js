module.exports = function(player, game) {

	var healthbar = {};
	healthbar.hearts = [];
	healthbar.totalHealth = player.health;
	
	var thisHealth;
	for (i = 0; i < player.health; i++) {
		if (i === 0) {
			thisHealth = game.add.sprite(18, 18, 'heart');
		}else {
			thisHealth = game.add.sprite((18 * (i + 1)) + (i * 5), 18, 'heart');
		}
		healthbar.hearts.push(thisHealth);
		thisHealth.frame = 0;
	}
	
	healthbar.loseLife = function(health) {
		var targetHeart = healthbar.totalHealth - (player.health + 1)
		
		healthbar.hearts[targetHeart].frame = 2;
	}
	
	return healthbar;
}