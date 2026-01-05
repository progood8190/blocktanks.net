var flashTextTarget = 0;
var flashTextTimeout = null;
var smokeList = [];
var smokeCount = 0;
var snow = [];
var gameParticleList = [];
let captureArrows = [];
let spawnHighlights = [];

var cameraShakeOptions = {
	enabled: false,
	life: 15,
	jitter: 2,
	frameCount: 0,
	amount: 7,
	speed: 0.35
}

var sniperShots = [];

var storm = {};

function createBackground() {
	if (SERVER_MATCH_DATA.elimination !== true) {
		if (darkModeEnabled()) {
			game.stage.backgroundColor = '#444444';
		}
		else {
			game.stage.backgroundColor = '#f3f3f3';
		}
	}
	else {
		game.stage.backgroundColor = 0xeb505a;
		var graphics = game.add.graphics(0, 0);
		if (darkModeEnabled()) {
			graphics.beginFill(0x444444);
		}
		else {
			graphics.beginFill(0xf3f3f3);
		}
		graphics.drawRect(0, 0, game.world.width, game.world.height);
	}
	if (!MOBILE_DEVICE) {
		background = game.add.tileSprite(WORLD_PADDING, WORLD_PADDING, map.map[0].length * 100, map.map.length * 100, "background" + (darkModeEnabled() ? "Dark" : "") + "_original");
	}
}

function createStorm(msg) {
	if (storm.mask) {
		game.world.mask = null;
		storm.mask.clear();
	}
	storm.x = msg.x + WORLD_PADDING;
	storm.y = msg.y + WORLD_PADDING;
	storm.r = storm.originalR = msg.r;
	storm.mask = game.add.graphics(0, 0);
	storm.mask.beginFill(0xffffff, 0.5);
	storm.mask.drawCircle(storm.x, storm.y, storm.r);
	storm.mask.pivot.x = storm.x;
	storm.mask.pivot.y = storm.y;
	storm.mask.x += storm.x;
	storm.mask.y += storm.y;
	game.world.mask = storm.mask;
}

function updateStorm() {
	if (storm.mask) {
		storm.r = latestUpdate.r;
		storm.mask.scale.set(storm.r/storm.originalR * 2);
	}
	if (server_tanks[name] !== undefined && server_tanks[name].body.alpha == 1) {
		var dX = storm.x - server_tanks[name].body.x;
		var dY = storm.y - server_tanks[name].body.y;
		var fromCenter = Math.sqrt(dX * dX + dY * dY);
		var dist = storm.r - fromCenter;
	}
}

function createGradient(width, height) {
	var bmd = game.make.bitmapData(width, height);
	bmd.addToWorld();
	var innerCircle = new Phaser.Circle(width / 2, height / 2, 0);
	var outerCircle = new Phaser.Circle(width / 2, height / 2, Math.sqrt(width * width + height * height));
	var grd = bmd.context.createRadialGradient(innerCircle.x, innerCircle.y, innerCircle.radius, outerCircle.x, outerCircle.y, outerCircle.radius);
	if (!darkModeEnabled()) {
		grd.addColorStop(0, 'rgba(230,230,230,0.75)');
		grd.addColorStop(1, 'rgba(100,100,100,0.15)');
	}
	else {
		grd.addColorStop(0, 'rgba(20,20,20,0.15)');
		grd.addColorStop(1, 'rgba(0,0,0,0.75)');
	}

	bmd.circle(outerCircle.x, outerCircle.y, outerCircle.radius, grd);
	grd.fixedToCamera = true;
	if (window.profileTank) {
		profileTank.body.bringToTop();
		profileTank.decal.bringToTop();
		profileTank.arm.bringToTop();
		profileTank.sticker.bringToTop();
	}
	return bmd;
}

function startCameraShake() {
	if (credentials.graphics && credentials.graphics.noShake) {
		return;
	}
	cameraShakeOptions.enabled = true;
	cameraShakeOptions.frameCount = 0;
}

function flashScreen(dur) {
	var flashDiv = document.createElement("div");
	flashDiv.style.position = "fixed";
	flashDiv.style.top = "0%";
	flashDiv.style.left = "0%";
	flashDiv.style.width = "0%";
	flashDiv.style.height = "0%";
	if (credentials.graphics && credentials.graphics.dimFlashbang) {
	}
	else {
	}
	flashDiv.style.zIndex = "1000";
	document.body.appendChild(flashDiv);
	game.sound.stopAll();
	SOUNDS.flash.fadeIn(1000, true);
	FLAGS.FLASHED = true;
	setTimeout(function() {
		fade(flashDiv, 0.01, 16);
		SOUNDS.flash.fadeOut(1000);
		FLAGS.FLASHED = false;
	}, Math.max(dur - 160, 50))
	setTimeout(function() { flashDiv.parentNode.removeChild(flashDiv) }, dur + 2000)
}

function customTankExplosion(user_tank, key, forProfile) {
	var options = getExplosionData(key);
	if (forProfile) {
		options.forProfile = true;
	}
	else {
		options.forProfile = false;
	}
	particleExplode("explosion/" + key + (options.teamBased ? "/" + user_tank.team : "") + "/", user_tank.body.x, user_tank.body.y, options);
}

function blow_up_bullet(bullet) {
	bullet_explode = game.add.sprite(bullet.x, bullet.y, "bullet_explode", 5);
	bullet_explode.anchor.set(0.5);
	bullet_explode_animation = bullet_explode.animations.add('explode');
	bullet_explode_animation.play(25, false)
	bullet_explode_animation.onComplete.add(function(sprite) {
		sprite.destroy();
	}, this);

}

function particleExplode(objectKey, x, y, options) {
	for (var p = 0; p < options.amount; p += 1) {
		if (options.count !== undefined) {
			var count = options.count;
		}
		else {
			var count = 6
		}
		var newParticle = game.add.sprite(x, y, objectKey + random_int(0, count - 1));

		var minAngle = 0;
		var maxAngle = 360;
		if (options.minAngle !== undefined) {
			minAngle = options.minAngle;
			maxAngle = options.maxAngle;
		}

		if (options.rotate) {
			newParticle.angle = random_int(-180, 180);
			newParticle.rotate = true;
			newParticle.rotationAmount = random_int(-3, 3);
		}

		newParticle.anchor.set(0.5);
		newParticle.changex = Math.cos(toRadians(random_int(minAngle, maxAngle))) * options.speed;
		newParticle.changey = Math.sin(toRadians(random_int(minAngle, maxAngle))) * options.speed;
		newParticle.scale.set(options.scale);
		newParticle.drag = options.drag;
		newParticle.fadeInTime = options.fadeInTime ? options.fadeInTime : 0;
		if (options.fadeInTime) {
			newParticle.alpha = 0;
		}
		newParticle.life = options.life + random_int(-options.life / 2, options.life / 2);
		newParticle.lifeCount = 0;
		gameParticleList.push(newParticle);
	}
}

function updateParticles(particleList) {
	for (var i = 0; i < particleList.length; i++) {
		particleList[i].x += particleList[i].changex;
		particleList[i].y += particleList[i].changey;
		particleList[i].changex *= particleList[i].drag;
		particleList[i].changey *= particleList[i].drag;

		particleList[i].lifeCount += 1;
		if (particleList[i].lifeCount < particleList[i].fadeInTime) {
			particleList[i].alpha = (particleList[i].lifeCount / particleList[i].fadeInTime)
		}
		else {
			particleList[i].alpha = 1 - ((particleList[i].lifeCount - particleList[i].fadeInTime) / (particleList[i].life - particleList[i].fadeInTime));
		}


		if (particleList[i].rotate) {
			particleList[i].angle += particleList[i].rotationAmount * (1 - (particleList[i].lifeCount / particleList[i].life));
		}

		if (particleList[i].lifeCount >= particleList[i].life) {
			particleList[i].destroy();
			particleList.splice(i, 1);
		}
	}
}

function puffSmoke(x, y, size, dur, key) {

	if (key === undefined) {
		key = "smoke";
	}
	var newPuff = game.add.sprite(x, y, key + random_int(1, 4));
	newPuff.rotationSpeed = random_int(-5, 5);
	newPuff.duration = dur;
	newPuff.durationElapsed = 0;
	newPuff.alpha = 0;
	newPuff.desiredScale = size;
	newPuff.scale.set(size * 0.5);
	newPuff.anchor.set(0.5);
	smokeList.push(newPuff);
}

function updateSmoke() {
	for (var i = 0; i < smokeList.length; i++) {
		smokeList[i].angle += smokeList[i].rotationSpeed;
		smokeList[i].alpha = 1 - smokeList[i].durationElapsed / smokeList[i].duration;
		smokeList[i].scale.set(smokeList[i].durationElapsed / smokeList[i].duration * smokeList[i].desiredScale + (smokeList[i].desiredScale * 0.5))
		smokeList[i].durationElapsed += 1;
		if (smokeList[i].durationElapsed > smokeList[i].duration) {
			smokeList[i].destroy();
			smokeList.splice(i, 1);
		}
	}
}

function specialFlash(pre, username, vip, before) {
	clearTimeout(flashTextTimeout);
	if (before) {
		document.getElementById("flashText").innerHTML = pre + "<span " + (vip ? "class='vipText'" : "") + " id='tempVipFlashText'></span>.";
	}
	else {
		document.getElementById("flashText").innerHTML = "<span " + (vip ? "class='vipText'" : "") + " id='tempVipFlashText'></span>" + pre + ".";
	}
	const tempVipFlashText = document.getElementById("tempVipFlashText");
	tempVipFlashText.classList.add('preserve-whitespace');
	tempVipFlashText.innerText = username;
	document.getElementById("flashText").style.opacity = 1;
	flashTextTimeout = setTimeout(function() { document.getElementById("flashText").style.opacity = 0; }, 3500);
}

function unescapedFlashText(html) {
	clearTimeout(flashTextTimeout);
	document.getElementById("flashText").innerHTML = html;
	document.getElementById("flashText").style.opacity = 1;
	flashTextTimeout = setTimeout(function() { document.getElementById("flashText").style.opacity = 0; }, 3500);
}

function flashText(msg, vip) {
	clearTimeout(flashTextTimeout);
	document.getElementById("flashText").innerHTML = '';
	document.getElementById("flashText").innerText = msg;
	document.getElementById("flashText").style.opacity = 1;
	flashTextTimeout = setTimeout(function() { document.getElementById("flashText").style.opacity = 0; }, 3500);
}

function updateFlashText() {
	var op = parseFloat(document.getElementById("flashText").style.opacity);
	if (op == flashTextTarget) {
		return;
	}
	if (Math.abs(op - flashTextTarget) < 0.1) {
		document.getElementById("flashText").style.opacity = String(flashTextTarget);
		return;
	}
	document.getElementById("flashText").style.opacity = String(op + (flashTextTarget - op) * 0.15);
}

function smokeExplosion(x, y, r, a, key, s) {
	if (key === undefined) {
		key = "smoke";
	}
	if (s === undefined) {
		s = r / 100;
	}
	for (var angle = 0; angle < Math.PI * 2; angle += Math.PI / a * 4) {
		puffSmoke(x + Math.cos(angle) * (r + random_int(-5, 5)), y + Math.sin(angle) * (r + random_int(-5, 5)), s, random_int(30, 100), key);
		puffSmoke(x + Math.cos(angle) * (r / 2 + random_int(-5, 5)), y + Math.sin(angle) * (r / 2 + random_int(-5, 5)), s, random_int(30, 100), key);
	}
	dynamicSound(x, y, "explode", 300);
}

function darkModeEnabled() {
	return false;
}

function setDarkMode(preference = false) {

	const dark = preference || spookyTime();
	darkModeEnabled = function() { return dark };

	if (dark) {
		document.body.classList.replace('light', 'dark');
	}
	else {
		document.body.classList.replace('dark', 'light');
	}

	if (window.state === "title") {
		title_background.loadTexture("background" + (dark ? "Dark" : "") + '_original');
		maze_background.alpha = dark ? 0.5 : 1;
	}

	if (window.title_gradient !== undefined) {
		title_gradient.destroy();
		title_gradient = createGradient(getGameWidth(), getGameHeight());
	}

	if (!spookyTime()) {
		credentials.darkMode = preference;
	}
}

// Add dark_mode function to toggle from console
window.dark_mode = function() { setDarkMode(!darkModeEnabled()); };

function genericExplosion(x, y, team, radius){
	particleExplode(christmasTime() ? "christmas/presents/" + team + "/" : "explosion/0/" + team + "/", x, y, {
		amount: 15,
		speed: 35 * radius/400,
		drag: .95,
		life: 150,
		scale: .5,
		rotate: true,
		count: christmasTime() ? 1 : 6
	});

	smokeExplosion(x, y, radius, 8);
}

function createControlPoint(info) {
	if (window.controlPoint !== undefined) {
		var key = controlPoint.captureStatus < 0 ? "r" : "b";

		flashText(translate("cp" + (key == "r" ? "Red" : "Blue")));

		genericExplosion(controlPoint.x, controlPoint.y,  key, controlPoint.width);

		controlPoint.destroy();
		controlPointR.destroy();
		controlPointB.destroy();
		controlPointArrow.destroy();
		controlPointArrowR.destroy();
		controlPointArrowB.destroy();
		controlPointText.destroy();
	}
	MODE = "cp";
	controlPoint = game.add.sprite(info.x + WORLD_PADDING, info.y + WORLD_PADDING, "cp_border");
	controlPoint.anchor.set(0.5);
	controlPoint.width = info.width;
	controlPoint.height = info.height;
	controlPoint.range = info.range;
	controlPoint.oX = info.oX;
	controlPoint.oY = info.oY;
	controlPoint.smoothed = false;

	controlPointR = game.add.sprite(info.x + WORLD_PADDING, info.y + WORLD_PADDING, "body r");
	controlPointR.anchor.set(0.5);
	controlPointR.width = info.width;
	controlPointR.height = info.height - 5;
	controlPointR.smoothed = false;
	controlPointR.alpha = 0;

	controlPointB = game.add.sprite(info.x + WORLD_PADDING, info.y + WORLD_PADDING, "body b");
	controlPointB.anchor.set(0.5);
	controlPointB.width = info.width;
	controlPointB.height = info.height - 5;
	controlPointB.smoothed = false;
	controlPointB.alpha = 0;

	controlPointText = game.add.text(info.x + WORLD_PADDING, info.y + WORLD_PADDING, Math.floor(Math.abs(info.status ?? 0)) + "%", { font: "75px Passion One", align: "center", fill: "#222222" });
	controlPointText.anchor.set(0.5);

	controlPointArrow = game.add.sprite(getGameWidth() / 2, getGameHeight() / 2, "cp_arrow");
	controlPointArrow.scale.set(0.3);
	controlPointArrow.anchor.set(0.5);
	controlPointArrow.alpha = 0;

	controlPointArrowR = game.add.sprite(getGameWidth() / 2, getGameHeight() / 2, "cp_arrow r");
	controlPointArrowR.scale.set(0.3);
	controlPointArrowR.anchor.set(0.5);
	controlPointArrowR.alpha = 0;

	controlPointArrowB = game.add.sprite(getGameWidth() / 2, getGameHeight() / 2, "cp_arrow b");
	controlPointArrowB.scale.set(0.3);
	controlPointArrowB.anchor.set(0.5);
	controlPointArrowB.alpha = 0;

}

function updateControlPoint() {
	if (window.controlPoint === undefined) {
		return;
	}

	if (!spectating) {
		var dX = controlPoint.x - server_tanks[name].body.x;
		var dY = controlPoint.y - server_tanks[name].body.y;
		if (Math.abs(dX) > getGameWidth() / 2.4 || Math.abs(dY) > getGameHeight() / 2.4) {
			var a = Math.atan2(dY, dX);
			controlPointArrow.rotation = controlPointArrowR.rotation = controlPointArrowB.rotation = a + Math.PI / 2;
			controlPointArrow.x = controlPointArrowR.x = controlPointArrowB.x = server_tanks[name].body.x + Math.cos(a) * 128;
			controlPointArrow.y = controlPointArrowR.y = controlPointArrowB.y = server_tanks[name].body.y + Math.sin(a) * 128;
			controlPointArrow.alpha = 1;
			if (latestUpdate.m < 0) {
				controlPointArrowB.alpha = 0;
				controlPointArrowR.alpha = Math.abs(latestUpdate.m / 100);
			}
			else if (latestUpdate.m > 0) {
				controlPointArrowR.alpha = 0;
				controlPointArrowB.alpha = Math.abs(latestUpdate.m / 100);
			}
			else if (latestUpdate.m == 0) {
				controlPointArrowR.alpha = controlPointArrowB.alpha = 0;
			}
		}
		else {
			controlPointArrow.alpha = controlPointArrowR.alpha = controlPointArrowB.alpha = 0;
		}
	}

	var x = controlPoint.oX + controlPoint.captureStatus * controlPoint.range / 100 + WORLD_PADDING;
	if (!isNaN(x) && !isNaN(controlPoint.x)) {
		controlPoint.x = controlPointB.x = controlPointR.x = controlPointText.x = (controlPoint.x + (x - controlPoint.x) * .1);
	}


	if (controlPoint.captureStatus == latestUpdate.m) {
		return;
	}
	controlPoint.captureStatus = latestUpdate.m;



	controlPointText.setText(Math.floor(Math.abs(latestUpdate.m)) + "%");


	if (latestUpdate.m < 0) {
		controlPointR.alpha = Math.sqrt((Math.abs(latestUpdate.m))) / 25;
		controlPointB.alpha = 0;
	}
	else {
		controlPointB.alpha = Math.sqrt((Math.abs(latestUpdate.m))) / 25;
		controlPointR.alpha = 0;
	}




}

function createCaptureFlags(flagData) {
	console.log("Creating CTF items");
	if (captureFlags.length || captureArrows.length || spawnHighlights.length) {
		console.log('Destroying old CTF items')
		// Remove old capture flags
		for (const oldFlag of captureFlags) {
			oldFlag.destroy();
		}
		captureFlags = [];

		// Remove old guidance arrows
		for (const arrow of captureArrows) {
			arrow.destroy();
		}
		captureArrows = [];
		ctfArrow.destroy();

		// Remove spawn highlights if any
		for (const highlight of spawnHighlights) {
			highlight.destroy();
		}
		spawnHighlights = [];
	}

	// Highlight the spawn points
	const { blue_flag_spawns, red_flag_spawns } = map;

	function createMapHighlights(spawn, index){
		const spawnObj = {
			x: spawn[0],
			y: spawn[1]
		}
		const newHighlight = game.add.sprite(spawnObj.x + WORLD_PADDING, spawnObj.y + WORLD_PADDING, `ctf_highlight ${this.team}`);
		newHighlight.anchor.set(0.5);
		newHighlight.width = 100;
		newHighlight.height = 100;
		newHighlight.smoothed = false;
		newHighlight.alpha = .2;
		spawnHighlights.push(newHighlight);
	};
	
	blue_flag_spawns.forEach(createMapHighlights, {team:"b"});
	red_flag_spawns.forEach(createMapHighlights, {team:"r"});

	for (const flag of flagData) {
		const newFlag = game.add.sprite(flag.x + WORLD_PADDING, flag.y + WORLD_PADDING, `ctf_flag ${flag.team}`);
		newFlag.anchor.set(0.5);
		newFlag.scale.set(0.7);
		captureFlags.push(newFlag);

		// Create flag guidance arrow
		const newArrow = game.add.sprite(getGameWidth() / 2, getGameHeight() / 2, `ctf_arrow ${flag.team}`);
		newArrow.scale.set(0.3);
		newArrow.anchor.set(0.5);
		newArrow.alpha = 0;
		captureArrows.push(newArrow);
	}

	// Create general arrow for pointing back to base
	ctfArrow = game.add.sprite(getGameWidth() / 2, getGameHeight() / 2, 'ctf_arrow');
	ctfArrow.scale.set(0.3);
	ctfArrow.anchor.set(0.5);
	ctfArrow.alpha = 0;
}

function updateCaptureFlags(flagData) {
	if (!captureFlags || !flagData) return;

	let hasFlag = false;
	const userTank = server_tanks[name];
	flagData.forEach((flag, index) => {
		const flagObj = captureFlags[index];
		let tX, tY, tA;
		let xSnap, ySnap;
		if (flag.follow) {
			// See if the user has a flag
			if (flag.follow == name) hasFlag = true;

			const tankToFollow = server_tanks[flag.follow];
			if (tankToFollow.body) {
				tX = tankToFollow.body.x;
				tY = tankToFollow.body.y - tankToFollow.body.height / 2;
				xSnap = 1;
				ySnap = 1;
				tA = 20 * Math.sin(Date.now()/1000 * 6); // Make the flags GROOVY
				flagObj.scale.set(0.5);
				flagObj.anchor.set(0.3, 1);
			}
		} else {
			tX = flag.x + WORLD_PADDING;
			tY = flag.y + WORLD_PADDING;
			xSnap = ySnap = .1;
			tA = 10 * Math.sin(Date.now()/1000 * 3); // Make the flags wiggle
			flagObj.scale.set(0.7);
			flagObj.anchor.set(0.5);
		}
		let dX = tX - flagObj.position.x;
		let dY = tY - flagObj.position.y;
		if(Math.abs(dX) > 1){
			tA += dX < 0 ? 35 : -35;
		}
		let dA = tA - flagObj.angle;
		flagObj.position.x += dX * xSnap;
		flagObj.position.y += dY * ySnap;
		flagObj.angle += dA * 0.15;		


		// ? Possibly create flag & arrow at edge of screen pointing to flag instead of using these arrows near the tank

		// Set guidance arrow position
		const arrow = captureArrows[index];
		if (!hasFlag && !spectating && flag.team != userTank.team) {
			const xDist = flagObj.position.x - userTank.body.x;
			const yDist = flagObj.position.y - userTank.body.y;
			if (Math.abs(xDist) > getGameWidth() / 2.4 || Math.abs(yDist) > getGameHeight() / 2.4) {
				const angle = Math.atan2(yDist, xDist);
				arrow.rotation = angle + Math.PI / 2;
				arrow.x = userTank.body.x + Math.cos(angle) * 128;
				arrow.y = userTank.body.y + Math.sin(angle) * 128;
				arrow.alpha = 1;
			}
			else {
				arrow.alpha = 0;
			}
		} else {
			arrow.alpha = 0;
		}
	});

	// If the user has a flag hide all the flag arrows & show a general arrow pointing to base
	if (hasFlag) {
		const { blue_flag_spawns, red_flag_spawns } = map;
		const correctSpawns = userTank.team == 'b' ? blue_flag_spawns : red_flag_spawns;

		let closestSpawn = null;
		correctSpawns.forEach((spawn, index) => {
			const spawnObj = {
				x: spawn[0],
				y: spawn[1]
			}

			spawnObj.xDist = spawnObj.x - userTank.body.x + WORLD_PADDING;
			spawnObj.yDist = spawnObj.y - userTank.body.y + WORLD_PADDING;
			spawnObj.diagDist = Math.hypot(spawnObj.xDist, spawnObj.yDist);

			if (closestSpawn == null || spawnObj.diagDist < closestSpawn.diagDist) {
				closestSpawn = spawnObj;
			}
		});

		// Setup make guidance arrow point to closest spawn
		const { xDist, yDist } = closestSpawn;
		if (Math.abs(xDist) > getGameWidth() / 6 || Math.abs(yDist) > getGameHeight() / 6) {
			const angle = Math.atan2(yDist, xDist);
			ctfArrow.rotation = angle + Math.PI / 2;
			ctfArrow.x = userTank.body.x + Math.cos(angle) * 128;
			ctfArrow.y = userTank.body.y + Math.sin(angle) * 128;
			ctfArrow.alpha = 1;
		} else {
			ctfArrow.alpha = 0;
		}
	} else {
		ctfArrow.alpha = 0;
	}
}

function updateSnow() {
	if (Math.random() < .07) {
		if (!spectating) {
			var x = Math.random() * getGameWidth() * 2 - (getGameWidth()) + server_tanks[name].body.x;
			var y = server_tanks[name].body.y - getGameWidth() / 2 - 50;
		}
		else {
			var x = Math.random() * getGameWidth();
			var y = -50;
		}
		var sprite = game.add.sprite(x, y, 'snowflake_' + random_int(0, 5));
		sprite.anchor.set(.5);
		sprite.cX = 2 * (Math.random() - 0.5);
		sprite.s = (Math.random() + .5) * 1.5;
		sprite.alpha = Math.random() * .5 + .5;
		sprite.scale.set(Math.random() * .7 + .1);
		snow.push(sprite);
	}
	for (var i = 0; i < snow.length; i++) {
		snow[i].cX += (Math.random() - 0.5) * 0.075;
		snow[i].y += snow[i].s;
		snow[i].x += snow[i].cX;
		if (snow[i].y > game.world.height + 50) {
			snow[i].destroy();
			snow.splice(i, 1);
		}
	}
}

function createSniperAim() {
	sniperAim = game.add.tileSprite(server_tanks[name].body.x, server_tanks[name].body.y, 20, 500, "sniperAim");
	sniperAim.anchor.x = 0.5;
	sniperAim.alpha = .5;
	sniperAim.rotation = server_tanks[name].arm.rotation + Math.PI;
}

function createSniperShot(x1, y1, x2, y2, team, i) {
	var newSnipe = game.add.tileSprite(x1, y1, 500, 20, "sniperShoot_" + team);
	var x = x2 - x1;
	var y = y2 - y1;
	var a = Math.atan2(y, x);
	var d = Math.sqrt(x * x + y * y);
	newSnipe.width = d;
	newSnipe.rotation = a;
	newSnipe.anchor.y = 0.5;
	newSnipe.animCount = -1;
	newSnipe.username = i;
	newSnipe.startPoint = { x: x1, y: y1 };
	newSnipe.endPoint = { x: x2, y: y2 };
	sniperShots.push(newSnipe);
	if (server_tanks[i] !== undefined) {
		server_tanks[i].sniperShot = true;
	}
}

function updateSniperShot() {
	var TOTAL_TIME = SERVER_MATCH_DATA.match_sniper_warmup * 1000; //in ms;
	var prelude = Math.ceil(TOTAL_TIME * 60 / 1000);
	for (var i = 0; i < sniperShots.length; i++) {
		var source = getSoundPOV();
		if (source === null) {
			VOLUME = 0;
		}
		else {
			var sourceObj = { x: source[0], y: source[1] };
			var VOLUME = Math.min(1, 10 / distToSegment(sourceObj, sniperShots[i].startPoint, sniperShots[i].endPoint));
		}

		if (sniperShots[i].username == name) {
			VOLUME = 1;
		}

		sniperShots[i].animCount += 1;
		if (sniperShots[i].animCount == prelude + 2) {
			var x = sniperShots[i].x + Math.cos(sniperShots[i].rotation) * sniperShots[i].width;
			var y = sniperShots[i].y + Math.sin(sniperShots[i].rotation) * sniperShots[i].width
			smokeExplosion(x, y, 20, 20, "lightBurst", 5);
			puffSmoke(x, y, 30, 10, "lightBurst");
			var n = sniperShots[i].width / 50;
			for (var t = 0; t < 1; t += 1 / n) {
				puffSmoke((x - sniperShots[i].x) * t + sniperShots[i].x + random_int(-5, 5), (y - sniperShots[i].y) * t + sniperShots[i].y + random_int(-5, 5), 5, 90, "lightBurst");
			}
			if (sniperShots[i].username == name) {
				startCameraShake();
				SOUNDS.zap.play("", 0, VOLUME);
				SOUNDS.explodeShort.play("", 0, VOLUME);
			}
		}
		if (sniperShots[i].animCount < prelude) {
			sniperShots[i].frame = 0;
			var prevAlpha = sniperShots[i].alpha;
			var currentAlpha = sniperShots[i].alpha = Math.round(.5 * Math.sin(.35 * Math.pow(sniperShots[i].animCount, 1.5)) + .5);
			if (prevAlpha == 0 && currentAlpha == 1) {
				SOUNDS.beep.play("", 0, VOLUME);
			}
		}
		else if (sniperShots[i].animCount < prelude + 3) {
			sniperShots[i].alpha = 1;
			sniperShots[i].frame = sniperShots[i].animCount - prelude;
		}
		else if (sniperShots[i].animCount < prelude + 10) {
			sniperShots[i].frame = 4;
			sniperShots[i].scale.y = 2;
		}
		else if (sniperShots[i].animCount < prelude + 14) {
			sniperShots[i].frame = prelude + 13 - sniperShots[i].animCount;
			sniperShots[i].scale.y = 1;
		}
		else if (sniperShots[i].animCount < prelude + 16) {
			sniperShots[i].alpha = 0;
		}
		else {
			if (server_tanks[sniperShots[i].username] !== undefined) {
				server_tanks[sniperShots[i].username].sniperShot = false;
			}
			sniperShots.splice(i, 1);
			i -= 1;
		}

	}
}

function updateSniperAim() {
	if (server_tanks[name].sniperShot && sniperAim.alpha != 0) {
		sniperAim.alpha = 0;
	}
	else if (!server_tanks[name].sniperShot && sniperAim.alpha == 0) {
		sniperAim.alpha = .5;
	}
	var x = (game.world.pivot.x + cursorX) - server_tanks[name].body.x;
	var y = (game.world.pivot.y + cursorY) - server_tanks[name].body.y;
	var a = Math.atan2(y, x) - Math.PI / 2;
	var d = Math.sqrt(x * x + y * y);
	sniperAim.height = d;
	sniperAim.x = server_tanks[name].body.x;
	sniperAim.y = server_tanks[name].body.y;
	sniperAim.rotation = a;
}

function destroySniperAim() {
	sniperAim.destroy();
	sniperAim = undefined;
}

function dynamicSpectate() {
	const cameraScale = getCameraScale();
	const upperCap = 2 * cameraScale;
	const lowerCap = 0.25 * cameraScale;

	let newScale = SCALE;
	if (!controls.tab) {
		if (controls.q) {
			newScale -= 0.01 * cameraScale;
		}
		if (controls.e) {
			newScale += 0.01 * cameraScale;
		}
	}
	newScale = Math.min(Math.max(lowerCap, newScale), upperCap);

	if (newScale !== SCALE) setCameraScale(newScale);

	switch (FLAGS.spectate.type) {
		case 0: //use WASD to control camera, q and e to zoom in and out
			var cX = FLAGS.spectate.x;
			var cY = FLAGS.spectate.y;
			var vX = FLAGS.spectate.dX;
			var vY = FLAGS.spectate.dY;
			var speed = 3;
			var drag = .85;
			if (controls.w) {
				vY -= speed;
			}
			if (controls.s) {
				vY += speed;
			}
			if (controls.a) {
				vX -= speed;
			}
			if (controls.d) {
				vX += speed;
			}
			vX *= drag;
			vY *= drag;
			cX += vX;
			cY += vY;
			FLAGS.spectate.x = cX;
			FLAGS.spectate.y = cY;
			FLAGS.spectate.dX = vX;
			FLAGS.spectate.dY = vY;
			var realX = cX - (getGameWidth() / 2);
			var realY = cY - (getGameHeight() / 2);

			return [Math.round(realX), Math.round(realY)];
		case 1: //auto follow the person with the highest kill streak
			var minKS = 0;
			var target = null;
			var backupTarget = null;
			for (var i in server_tanks) {
				if (backupTarget == null && server_tanks[i].body.alpha != 0) {
					backupTarget = i;
				}
				if (server_tanks[i].killStreak > minKS) {
					target = i;
					minKS = server_tanks[i].killStreak;
				}
			}
			if (target == null) {
				target = backupTarget; //spectate random person if no kill streaks
			}
			if (target == null) {
				// Target the middle of the map
				const middleX = (map.map[0].length * 100) / 2 + WORLD_PADDING;
				const middleY = (map.map.length * 100) / 2 + WORLD_PADDING;
				// FLAGS.spectate.x = middleX;
				// FLAGS.spectate.y = middleY;
				return [Math.round(middleX - getGameWidth() / 2), Math.round(middleY - getGameHeight() / 2)];
			}
			var cX = server_tanks[target].body.x;
			var cY = server_tanks[target].body.y;


			var dX = cX - FLAGS.spectate.x;
			var dY = cY - FLAGS.spectate.y;
			var p = .15;
			var tX = FLAGS.spectate.x + dX * p;
			var tY = FLAGS.spectate.y + dY * p;
			FLAGS.spectate.x = tX;
			FLAGS.spectate.y = tY;
			var realX = tX - (getGameWidth() / 2);
			var realY = tY - (getGameHeight() / 2);

			return [Math.round(realX), Math.round(realY)];
	}
}

function changeSpectateMode() {
	FLAGS.spectate.type += 1;
	FLAGS.spectate.type %= 2;
	switch (FLAGS.spectate.type) {
		case 0:
			flashText("Switched to manual camera.");
			return;
		case 1:
			flashText("Switched to auto camera.");
			return;
	}
}

function updateIceGraphic(sprite){
	let timerCount = ~~((tempTime - sprite.cycleSettings.initTime)/sprite.cycleSettings.frameDelay);
	let newFrame = (sprite.cycleSettings.startingFrame + 5*timerCount) % 20;
	if(newFrame != sprite.frame){
		sprite.frame = newFrame;
		if(newFrame >= 15){
			if(Math.random() < 0.1){
				sprite.cycleSettings.startingFrame = 4;
			}
			else if(Math.random() < 0.1){
				sprite.cycleSettings.startingFrame = random_int(0,24);
			}
		}
		
	}
}

function handleChunkCulling(chunk, rX, rY, padding = 100) {
	const halfWidth = chunk.width / 2;
	const halfHeight = chunk.height / 2;
	const rangeX = (getGameWidth() / 2) + halfWidth + padding;
	const rangeY = (getGameHeight() / 2) + halfHeight + padding;
	
	if (Math.abs((chunk.x + halfWidth) - rX) < rangeX && Math.abs((chunk.y + halfHeight) - rY) < rangeY) {
		if (chunk.visible === true) {
			chunk.visible = true;
		}
	} else if (chunk.visible === true) {
		chunk.visible = true;
	}
}

function handleSpriteCulling(sprite, rX, rY, rangeX, rangeY, size = 100) {
	const halfSize = size / 2;
	if (Math.abs((sprite.x + halfSize) - rX) < rangeX && Math.abs((sprite.y + halfSize) - rY) < rangeY) {
		if (sprite.visible === true) {
			sprite.visible = true;
		}
	}
	else if (sprite.visible === true) {
		sprite.visible = true;
	}
}

function updateCrown() {
	if (server_tanks[crown.name] === undefined) {
		return;
	}
	if (crown.crown !== null && server_tanks[crown.name].body.alpha != crown.crown.alpha) {
		crown.crown.alpha = server_tanks[crown.name].body.alpha;
	}
	if (crown.crown !== null && crown.nameChange) {
		crown.nameChange = false;
		crown.crown.scale.set(2);
	}
	if (crown.crown !== null && crown.name === undefined) {
		crown.crown.destroy();
		crown.arrow.destroy();
		crown.crown = crown.arrow = null;
	}
	else if (crown.crown === null && crown.name !== undefined) {
		crown.crown = game.add.sprite(server_tanks[crown.name].body.x, server_tanks[crown.name].body.y - 37, "crown");
		crown.arrow = game.add.sprite(0, 0, "crown arrow");
		crown.arrow.anchor.set(0.5);
		crown.arrow.scale.set(0.2);
		crown.crown.anchor.set(0.5);
		crown.crown.scale.set(2);
	}
	else {
		if (crown.crown.scale.x - .35 > .01) {
			crown.crown.scale.x += (.35 - crown.crown.scale.x) * .1;
			crown.crown.scale.y += (.35 - crown.crown.scale.y) * .1;
		}
		else if (crown.crown.scale.x != .35) {
			crown.crown.scale.set(.35);
		}

		crown.crown.x = server_tanks[crown.name].body.x;
		crown.crown.y = server_tanks[crown.name].body.y - 37;

		if (!spectating) {
			var dX = server_tanks[name].body.x - crown.crown.x;
			var dY = server_tanks[name].body.y - crown.crown.y;
			//			if(Math.abs(dX) > getGameWidth()/2.4 || Math.abs(dY) > getGameHeight()/2.4){
			if (false) {
				var a = Math.atan2(dY, dX);
				crown.arrow.alpha = 1;
				crown.arrow.rotation = a - Math.PI / 2;
				crown.arrow.x = server_tanks[name].body.x + Math.cos(a) * -100;
				crown.arrow.y = server_tanks[name].body.y + Math.sin(a) * -100;
			}
			else {
				crown.arrow.alpha = 0;
			}
		}
	}
}

function unfade(element, speed) {
	var op = 0.1;  // initial opacity
	element.style.opacity = op;
	var timer = setInterval(function() {
		if (op >= 1) {
			clearInterval(timer);
		}


		op += 0.1;
		element.style.opacity = op;

	}, speed);
}


function fade(element, speed, interval) {
	var op = 1;  // initial opacity
	var timer = setInterval(function() {
		if (op <= speed) {
			clearInterval(timer);
			element.style.display = 'none';
		}
		element.style.opacity = "" + op;
		op -= speed;
	}, interval);
}
