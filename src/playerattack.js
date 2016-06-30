module.exports = function(player, game) {
	
	playerAttack = game.add.sprite(0, 0, 'punch');
	playerAttack.enableBody = true;
	game.physics.arcade.enable(playerAttack);
	
//	playerAttacks.push(playerAttack);

	playerAttack.attackSource = player;
	playerAttack.x = -200;
	playerAttack.y = -200;
	playerAttack.attackEnd = null;
	playerAttack.spent = false;
	
	playerAttack.animations.add('attackingRight', [1, 2, 3, 4, 5, 6, 7, 8], 10)
	playerAttack.animations.add('attackingLeft', [9, 10, 11, 12, 13, 14, 15, 16], 10)
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
//	playerAttack.position = function() {
//		var direction = playerAttack.attackSource.facing;
//		var xPos = playerAttack.attackSource.x;
//		var yPos = playerAttack.attackSource.y;
//		if (direction === 'left') {
//			xPos = xPos - 40;
//		} else {
//			xPos = xPos + 40;
//		}
//		playerAttack.reset(xPos, yPos);
//	}

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
		if (direction === 'left') {
			playerAttack.animations.play('attackingLeft');
		} else {
			playerAttack.animations.play('attackingRight');
		}
		playerAttack.spent = false;
	}
	
	return playerAttack;

}