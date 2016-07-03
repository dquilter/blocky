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