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
	game.load.spritesheet('heart', 'assets/life.png', 18, 18);
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