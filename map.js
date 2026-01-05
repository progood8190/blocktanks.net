function drawMap(map) {
	var maze_list = map.map;
	var maze_walls = game.add.group();
	var energies = calculateMapColoring(map);
	var size = 100;
	var x, y;
	x = y = WORLD_PADDING;
	for (var i = 0; i < maze_list.length; i++) {
		var maze_row = maze_list[i];

		for (var t = 0; t < maze_row.length; t++) {
			if (maze_row[t] == 1) {
				var newTile = game.add.sprite(x + (size * t), y + (size * i), "mapTile");
				applyMapTint(newTile, energies[i][t]);

				newTile.height = size;
				newTile.width = size;
				newTile.anchor.set(0.5);
				newTile.collision = { l: false, r: false, t: false, b: false };
				newTile.visible = false;

				if (christmasTime()) {
					if (t != 0 && maze_list[i][t - 1] == 0) {
						var l = game.add.sprite(x + (size * t) + 5, y + (size * i) + 50, "c_lights");
						l.anchor.set(0.5);
						l.rotation = Math.PI / 2;
						l.alpha = .7;
						c_lights.push(l);
					}
					if (t != maze_row.length - 1 && maze_list[i][t + 1] == 0) {
						var l = game.add.sprite(x + (size * t) + 100 - 5, y + (size * i) + 50, "c_lights");
						l.anchor.set(0.5);
						l.rotation = -Math.PI / 2;
						l.alpha = .7;
						c_lights.push(l);
					}
					if (i != 0 && maze_list[i - 1][t] == 0) {
						var l = game.add.sprite(x + (size * t) + 50, y + (size * i) + 5, "c_lights");
						l.anchor.set(0.5);
						l.rotation = Math.PI;
						l.alpha = .7;
						c_lights.push(l);
					}
					if (i != maze_list.length - 1 && maze_list[i + 1][t] == 0) {
						var l = game.add.sprite(x + (size * t) + 50, y + (size * i) + 100 - 5, "c_lights");
						l.anchor.set(0.5);
						l.rotation = 0;
						l.alpha = .7;
						c_lights.push(l);
					}
				}
				maze_walls.add(newTile);
			}
			else if (maze_row[t] == 2) {
				// Fences
				var newTile = game.add.sprite(x + (size * t), y + (size * i), "bulletOnlyTile");
				newTile.height = size;
				newTile.width = size;
				applyMapTint(newTile, energies[i][t]);
				newTile.anchor.set(0);
				newTile.collision = { l: false, r: false, t: false, b: false };
				newTile.visible = false;
				bulletOnlyWalls.add(newTile); // Adds the tile to a seperate group for layering purposes
			}
			else if (maze_row[t] == 3) {
				// Ice
				var newTile = game.add.sprite(x + (size * (t)), y + (size * (i)), "ice");
				if (Math.random() < 0.2) {
					newTile.frame = random_int(0, 24);
				}
				else {
					newTile.frame = 4;
				}
				newTile.cycleSettings = {
					initTime: Date.now() + random_int(0, 1000),
					frameDelay: 200,
					startingFrame: newTile.frame
				};
				newTile.height = size;
				newTile.width = size;
				newTile.anchor.set(0);
				newTile.visible = false;
				newTile.smoothed = false;
				iceSprites.add(newTile);
			}
			else if (maze_row[t] == 4) {
				var newTile = game.add.sprite(x + (size * (t)), y + (size * (i)), "bounce");
				newTile.height = size;
				newTile.width = size;
				newTile.smoothed = false;
				newTile.anchor.set(0);
				newTile.visible = false;
				maze_walls.add(newTile);

			}
			else if (maze_row[t] === 5) {
				const sprite = (MODE !== 'ffa') ? 'mapTile Blue' : 'mapTile';
				const newTile = game.add.sprite(x + (size * t), y + (size * i), sprite);
				newTile.width = size;
				newTile.height = size;
				newTile.anchor.set(0);
				newTile.visible = false;
				newTile.smoothed = false;
				maze_walls.add(newTile);
			}
			else if (maze_row[t] === 6) {
				const sprite = (MODE !== 'ffa') ? 'mapTile Red' : 'mapTile';
				const newTile = game.add.sprite(x + (size * t), y + (size * i), sprite);
				newTile.width = size;
				newTile.height = size;
				newTile.anchor.set(0);
				newTile.visible = false;
				newTile.smoothed = false;
				maze_walls.add(newTile);
			}
			else if (maze_row[t] === 7) {
				const sprite = (MODE !== 'ffa') ? 'mapTile Blue Pale' : 'mapTile';
				const newTile = game.add.sprite(x + (size * t), y + (size * i), sprite);
				newTile.width = size;
				newTile.height = size;
				newTile.anchor.set(0);
				newTile.visible = false;
				newTile.smoothed = false;
				maze_walls.add(newTile);
			}
			else if (maze_row[t] === 8) {
				const sprite = (MODE !== 'ffa') ? 'mapTile Red Pale' : 'mapTile';
				const newTile = game.add.sprite(x + (size * t), y + (size * i), sprite);
				newTile.width = size;
				newTile.height = size;
				newTile.anchor.set(0);
				newTile.visible = false;
				newTile.smoothed = false;
				maze_walls.add(newTile);
			}
		}

	}

	return maze_walls;
}

function applyMapTint(sprite, colorEnergy, seed = undefined) {
	if (credentials?.graphics?.greyWalls) return sprite.tint = 0xb4b4b4;
	const randomValue = (seed != undefined) ? seededRandom(seed) : Math.random();

	let randomBaseColor = interpolateHexColors(0xbf9067, 0x9e7149, randomValue); // Brown
	// let randomBaseColor = interpolateHexColors(0xdddddd, 0x999999, randomValue); // Gray
	if (colorEnergy > 0) { // Render blue tile
		sprite.tint = interpolateHexColors(0x345CD2, randomBaseColor, colorEnergy);
	}
	else { // Render red tile
		sprite.tint = interpolateHexColors(0xE72B2B, randomBaseColor, -colorEnergy);
	}
}

function getMaxTextureSize() {
	const gl = document.createElement('canvas').getContext('webgl');
	const MAX_WEBGL_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);
	const STANDARD_MAX_TEXTURE_SIZE = 2048;
	const MAX_TEXTURE_SIZE = (MAX_WEBGL_TEXTURE_SIZE < STANDARD_MAX_TEXTURE_SIZE) ? MAX_WEBGL_TEXTURE_SIZE : STANDARD_MAX_TEXTURE_SIZE;
	console.debug('Max texture size:', MAX_TEXTURE_SIZE);
	return MAX_TEXTURE_SIZE;
}

// TODO: Use web worker for loading chunks
class ChunkManager {
	// WARNING: Bitmap mode crashes safari, but not chromebooks (-_-)
	static _DRAW_MODES = { SPRITES: 'sprites', BITMAP: 'bitmap', TILEMAP: 'tilemap', };
	static _CULL_MODES = { HIDE: 'hide', UNLOAD: 'unload', };

	static _DRAW_MODE = this._DRAW_MODES.SPRITES;
	static _CULL_MODE = this._CULL_MODES.HIDE;

	static _TILE_SIZE = 100;
	static get _PADDING_X() { return WORLD_PADDING; };
	static get _PADDING_Y() { return WORLD_PADDING; };
	static _MAX_TEXTURE_SIZE = this._TILE_SIZE * 5;//getMaxTextureSize();

	static _CHUNK_OVERLAP_PADDING = null;
	static _CHUNK_OVERLAP_TILES = null;
	static _CHUNK_SIZE = null;

	static _map = null;
	static _mapColoring = null;

	/** @type {Map<string, ChunkManager._ChunkArray>} */
	static _loadedChunks = new Map();

	/** 
	 * Primary group for the map tiles
	 * @type {?Phaser.Group}
	 */
	static _mapGroup = null;
	/**
	 * Secondary group for layering purposes (e.g. Fences, Christmas lights)
	 * @type {?Phaser.Group}
	 */
	static _mapGroupSecondary = null;
	/** 
	 * Group for ice particles
	 * @type {?Phaser.Group} 
	 */
	static _iceParticleGroup = null;

	static get mapGroup() { return this._mapGroup; }
	static get mapGroupSecondary() { return this._mapGroupSecondary }
	static get iceParticleGroup() { return this._iceParticleGroup; }

	static get mapIsLoaded() { return this._map != null; }

	static _debugGraphics = null;
	static _debug = false;

	/**
	 * Load a map.
	 * @param {Map} map 
	 */
	static loadMap(map) {
		// Unload the current map if there is one
		this.unloadMap();

		console.log('Loading map...');

		// Set up the new map
		this._map = map;
		// TODO: Title screen is incorrect colors, in both dark and light mode
		// Not sure how I feel about the brown
		this._mapColoring = calculateMapColoring(this._map, (MODE === 'ffa'));

		switch (this._DRAW_MODE) {
			case (this._DRAW_MODES.SPRITES): {
				this._CHUNK_OVERLAP_PADDING = 0;
				this._CHUNK_OVERLAP_TILES = 0;
				this._CHUNK_SIZE = 1;
				break;
			}
			case (this._DRAW_MODES.BITMAP): {
				// If we're using bitmap drawing, we can have overlap to hide seems between chunks
				this._CHUNK_OVERLAP_PADDING = (christmasTime()) ? this._TILE_SIZE / 2 : this._TILE_SIZE / 4;
				this._CHUNK_OVERLAP_TILES = (this._CHUNK_OVERLAP_PADDING > 0) ? Math.ceil(this._CHUNK_OVERLAP_PADDING / this._TILE_SIZE) : 0;
				this._CHUNK_SIZE = Math.floor((this._MAX_TEXTURE_SIZE - this._CHUNK_OVERLAP_PADDING) / this._TILE_SIZE);
				break;
			}
			case (this._DRAW_MODES.TILEMAP): {
				console.warn('WARNING: Tilemap drawing does not currently support tinting!');
				// TODO: Overlay tint when using tilemap

				this._CHUNK_OVERLAP_PADDING = this._TILE_SIZE;
				this._CHUNK_OVERLAP_TILES = 1;
				this._CHUNK_SIZE = Math.floor((this._MAX_TEXTURE_SIZE - this._CHUNK_OVERLAP_PADDING) / this._TILE_SIZE);
				break;
			}
			default: {
				console.error('Invalid draw mode:', this._DRAW_MODE);
				return;
			}
		}

		// Create the groups
		this._mapGroup = game.add.group(game.world, 'mapGroup');
		this._mapGroupSecondary = game.add.group(game.world, 'mapGroupSecondary');
		this._iceParticleGroup = game.add.group(game.world, 'iceParticleGroup');

		// Add the groups to the world
		game.world.add(this._mapGroup);
		game.world.add(this._mapGroupSecondary);
		game.world.add(this._iceParticleGroup);

		// Create the debug graphics
		this._debugGraphics = game.add.graphics(0, 0);
		this._debugGraphics.visible = this._debug;

		// Draw the map
		this.updateChunks();
	}

	/** Unload the current map. */
	static unloadMap() {
		console.log('Unloading map...');

		this._map = null;
		this._mapColoring = null;

		this._mapGroup?.destroy();
		this._mapGroup = null;

		this._mapGroupSecondary?.destroy();
		this._mapGroupSecondary = null;

		this._iceParticleGroup?.destroy();
		this._iceParticleGroup = null;

		this._loadedChunks.clear();
	}

	/** Handles culling and loading the maps chunks. */
	static updateChunks() {
		const maze_list = this._map.map;
		const chunksToLoad = [];
		const chunksToCull = [];

		// Check which chunks should be loaded and unloaded
		for (let chunkY = 0; chunkY < maze_list.length; chunkY += this._CHUNK_SIZE) {
			for (let chunkX = 0; chunkX < maze_list[0].length; chunkX += this._CHUNK_SIZE) {
				const chunkShouldBeVisible = this._shouldChunkBeVisible(chunkX, chunkY);
				const chunkLoaded = this._loadedChunks.has(this._getChunkKey(chunkX, chunkY));

				// If the chunk should not be visible and it's loaded, cull it
				if (!chunkShouldBeVisible) {
					if (chunkLoaded) {
						chunksToCull.push([chunkX, chunkY]);
					}
				}
				// If the chunk should be visible, load it
				else {
					chunksToLoad.push([chunkX, chunkY]);
				}
			}
		}

		// Load and unload the chunks
		chunksToLoad.forEach(([chunkX, chunkY]) => this._loadChunk(chunkX, chunkY));
		chunksToCull.forEach(([chunkX, chunkY]) => this._cullChunk(chunkX, chunkY));

		// Update the ice particles
		this._iceParticleGroup.forEach(updateIceGraphic);

		// Update the debug graphics
		if (this._debug) {
			this._debugGraphics.visible = true;
			this._debugGraphics.clear();
			this._loadedChunks.values().forEach((chunkArray) => {
				this._debugGraphics.lineStyle(10, 0xffffff * seededRandom(chunkArray[0]?.x + chunkArray[0]?.y), 1);
				chunkArray.forEach(sprite => {
					this._debugGraphics.drawRect(sprite.x, sprite.y, sprite.width, sprite.height);
				});
			});
			game.world.bringToTop(this._debugGraphics);
		} else if (this._debugGraphics.visible) {
			this._debugGraphics.visible = false;
		}
	}

	static _getChunkKey(chunkX, chunkY) {
		return `${chunkX},${chunkY}`;
	}

	static _loadChunk(chunkX, chunkY) {
		// If we're hiding chunks, we can just make the sprites visible
		if (this._CULL_MODE === this._CULL_MODES.HIDE) {
			const chunkArray = this._loadedChunks.get(this._getChunkKey(chunkX, chunkY));
			if (chunkArray) {
				if (!chunkArray.visible) { chunkArray.visible = true; }

				// Return if the chunk is already loaded
				return;
			}
		}


		// console.log('Loading chunk:', chunkX, chunkY);

		const maze_list = this._map.map;

		// Calculate the dimensions of the current chunk
		const CHUNK_WIDTH = Math.min(this._CHUNK_SIZE, maze_list[0].length - chunkX);
		const CHUNK_HEIGHT = Math.min(this._CHUNK_SIZE, maze_list.length - chunkY);

		// Create an array to hold the chunk sprites
		const chunkArray = new ChunkManager._ChunkArray();
		chunkArray.visible = true;

		// Create the primary and secondary layers
		let primaryLayer, secondaryLayer;
		switch (this._DRAW_MODE) {
			case (this._DRAW_MODES.SPRITES): {
				primaryLayer = this._mapGroup;
				secondaryLayer = this._mapGroupSecondary;
				break;
			}
			case (this._DRAW_MODES.BITMAP): {
				primaryLayer = game.add.bitmapData(CHUNK_WIDTH * this._TILE_SIZE + this._CHUNK_OVERLAP_PADDING, CHUNK_HEIGHT * this._TILE_SIZE + this._CHUNK_OVERLAP_PADDING)
				secondaryLayer = game.add.bitmapData(CHUNK_WIDTH * this._TILE_SIZE + this._CHUNK_OVERLAP_PADDING, CHUNK_HEIGHT * this._TILE_SIZE + this._CHUNK_OVERLAP_PADDING);
				break;
			}
			case (this._DRAW_MODES.TILEMAP): {
				const tilemap = game.add.tilemap(null, this._TILE_SIZE, this._TILE_SIZE);
				tilemap.addTilesetImage('mapTileSet');

				// Create the layers
				primaryLayer = tilemap.createBlankLayer('primaryLayer', CHUNK_WIDTH + this._CHUNK_OVERLAP_TILES, CHUNK_HEIGHT + this._CHUNK_OVERLAP_TILES, this._TILE_SIZE, this._TILE_SIZE);
				secondaryLayer = tilemap.createBlankLayer('secondaryLayer', CHUNK_WIDTH + this._CHUNK_OVERLAP_TILES, CHUNK_HEIGHT + this._CHUNK_OVERLAP_TILES, this._TILE_SIZE, this._TILE_SIZE);

				// Pass through the putTile function
				primaryLayer.putTile = (tileType, x, y) => tilemap.putTile(tileType, x, y, 'primaryLayer');
				secondaryLayer.putTile = (tileType, x, y) => tilemap.putTile(tileType, x, y, 'secondaryLayer');

				// Decouple from camera
				primaryLayer.fixedToCamera = false;
				secondaryLayer.fixedToCamera = false;

				// Set the position
				const layerX = this._PADDING_X + (chunkX * this._TILE_SIZE);
				const layerY = this._PADDING_Y + (chunkY * this._TILE_SIZE);
				primaryLayer.x = layerX;
				primaryLayer.y = layerY;
				secondaryLayer.x = layerX;
				secondaryLayer.y = layerY;

				// Add the layers to the groups
				this._mapGroup.add(primaryLayer);
				this._mapGroupSecondary.add(secondaryLayer);

				// Add the layers to chunk array
				chunkArray.push(primaryLayer);
				chunkArray.push(secondaryLayer);
				break;
			}
			default: {
				console.error('Invalid draw mode:', this._DRAW_MODE);
				return;
			}
		};

		// TODO: Border chunks shouldn't have overlap padding

		for (let yInChunk = 0; yInChunk < CHUNK_HEIGHT + this._CHUNK_OVERLAP_TILES; yInChunk++) {
			const tileY = chunkY + yInChunk;
			const maze_row = maze_list[tileY];

			// When padding chunks, we may go out of bounds
			if (!maze_row) break;

			for (let xInChunk = 0; xInChunk < CHUNK_WIDTH + this._CHUNK_OVERLAP_TILES; xInChunk++) {
				const tileX = chunkX + xInChunk;
				const tileType = maze_row[tileX];

				// When padding chunks, we may go out of bounds
				if (tileType == null) break;

				const IS_OVERLAP_TILE = (xInChunk >= CHUNK_WIDTH || yInChunk >= CHUNK_HEIGHT);

				this._drawTile({
					chunkArray,
					primaryLayer,
					secondaryLayer,
					tileType,
					tileX,
					tileY,
					xInChunk,
					yInChunk,
					IS_OVERLAP_TILE,
					CHUNK_WIDTH,
					CHUNK_HEIGHT
				});
			}
		}

		if (this._DRAW_MODE === this._DRAW_MODES.BITMAP) {
			// Create sprites from the bitmap data
			const mapSprite = game.add.sprite(this._PADDING_X + (chunkX * this._TILE_SIZE), this._PADDING_Y + (chunkY * this._TILE_SIZE), primaryLayer);
			const mapSpriteSecondary = game.add.sprite(this._PADDING_X + (chunkX * this._TILE_SIZE), this._PADDING_Y + (chunkY * this._TILE_SIZE), secondaryLayer);
			mapSprite.anchor.set(0);
			mapSpriteSecondary.anchor.set(0);
			this._mapGroup.add(mapSprite);
			this._mapGroupSecondary.add(mapSpriteSecondary);

			// Add the sprites to the chunk sprites array
			chunkArray.push(mapSprite);
			chunkArray.push(mapSpriteSecondary);

			console.assert(mapSprite.width <= this._MAX_TEXTURE_SIZE, 'Map sprite width exceeds maximum texture size');
			console.assert(mapSprite.height <= this._MAX_TEXTURE_SIZE, 'Map sprite height exceeds maximum texture size');
			console.assert(mapSpriteSecondary.width <= this._MAX_TEXTURE_SIZE, 'Map sprite secondary width exceeds maximum texture size');
			console.assert(mapSpriteSecondary.height <= this._MAX_TEXTURE_SIZE, 'Map sprite secondary height exceeds maximum texture size');

			console.assert(mapSprite.parent === this._mapGroup, 'Map sprite not added to map group');
			console.assert(mapSpriteSecondary.parent === this._mapGroupSecondary, 'Map sprite secondary not added to map group');
		}

		// Add chunk to loaded chunks
		this._loadedChunks.set(this._getChunkKey(chunkX, chunkY), chunkArray);
	}

	static _drawTile({ chunkArray, primaryLayer, secondaryLayer, tileType, tileX, tileY, xInChunk, yInChunk, IS_OVERLAP_TILE, CHUNK_WIDTH, CHUNK_HEIGHT }) {
		let tileKey;
		switch (tileType) {
			case TILE_TYPES.WALL: {
				tileKey = 'mapTile';

				// TODO: Fix raining snow position on maps, cull snow as well
				// TODO: Potentially add snow to the bitmap data like on walls
				// TODO: See if we can enable client-side collision on bitmaps
				// TODO: Look into 3D effect for tiles
				break;
			}
			case TILE_TYPES.FENCE: {
				// Draw the fence tile onto the secondary bitmap data for layering
				const fenceTile = game.add.sprite(this._PADDING_X + (this._TILE_SIZE * tileX), this._PADDING_Y + (this._TILE_SIZE * tileY), 'bulletOnlyTile');
				fenceTile.height = this._TILE_SIZE;
				fenceTile.width = this._TILE_SIZE;
				fenceTile.anchor.set(0);
				const seed = SERVER_MATCH_DATA.match_id + tileX + (tileY * this._map.map.length);
				applyMapTint(fenceTile, this._mapColoring[tileY][tileX], tileX + (tileY * this._map.map.length), seed);

				switch (this._DRAW_MODE) {
					case (this._DRAW_MODES.SPRITES): {
						this._mapGroupSecondary.add(fenceTile);
						chunkArray.push(fenceTile);
						break;
					}
					case (this._DRAW_MODES.BITMAP): {
						secondaryLayer.draw(fenceTile, (this._TILE_SIZE * xInChunk), (this._TILE_SIZE * yInChunk));
						fenceTile.destroy();
						break;
					}
					case (this._DRAW_MODES.TILEMAP): {
						fenceTile.destroy();
						secondaryLayer.putTile(tileType, xInChunk, yInChunk);
						break;
					}
				}

				break;
			}
			case TILE_TYPES.ICE: {
				// Background
				tileKey = 'ice';

				// Sparkles
				if (!IS_OVERLAP_TILE) {
					const iceSparkleTile = game.add.sprite(this._PADDING_X + (this._TILE_SIZE * tileX), this._PADDING_Y + (this._TILE_SIZE * tileY), 'iceSparkles');
					iceSparkleTile.frame = (Math.random() < 0.2) ? random_int(0, 24) : 4;
					iceSparkleTile.cycleSettings = {
						initTime: Date.now() + random_int(0, 1000),
						frameDelay: 200,
						startingFrame: iceSparkleTile.frame
					};
					iceSparkleTile.height = this._TILE_SIZE;
					iceSparkleTile.width = this._TILE_SIZE;
					iceSparkleTile.anchor.set(0);
					iceSparkleTile.smoothed = false;
					iceSparkleTile.opacity = 0.5;
					this._iceParticleGroup.add(iceSparkleTile);
					chunkArray.push(iceSparkleTile);
				}
				break;
			}
			case TILE_TYPES.BOUNCE: {
				tileKey = 'bounce';
				break;
			}
			case TILE_TYPES.WALL_BLUE: {
				tileKey = (MODE !== 'ffa') ? 'mapTile Blue' : 'mapTile';
				break;
			}
			case TILE_TYPES.WALL_RED: {
				tileKey = (MODE !== 'ffa') ? 'mapTile Red' : 'mapTile';
				break;
			}
			case TILE_TYPES.WALL_BLUE_PALE: {
				tileKey = (MODE !== 'ffa') ? 'mapTile Blue Pale' : 'mapTile';
				break;
			}
			case TILE_TYPES.WALL_RED_PALE: {
				tileKey = (MODE !== 'ffa') ? 'mapTile Red Pale' : 'mapTile';
				break;
			}
		}

		// TODO: Potentially combine roofs into one sprite (BT-180)
		// TODO: Bake roofs into own bitmap and then overlay actual sprites and use mask to hide bitmap around sprites

		// Christmas lights
		if (christmasTime() && !IS_OVERLAP_TILE) {
			const TILEMAP_DRAWING_IS_ENABLED = (this._DRAW_MODE === this._DRAW_MODES.TILEMAP);
			this._drawChristmasLights(chunkArray, (TILEMAP_DRAWING_IS_ENABLED) ? this._mapGroupSecondary : secondaryLayer, tileType, tileX, tileY, xInChunk, yInChunk, CHUNK_WIDTH, CHUNK_HEIGHT);
		}

		if (tileKey) {
			// Draw the tile onto the bitmap data
			const tileSprite = game.add.sprite(this._PADDING_X + (this._TILE_SIZE * tileX), this._PADDING_Y + (this._TILE_SIZE * tileY), tileKey);
			tileSprite.width = this._TILE_SIZE;
			tileSprite.height = this._TILE_SIZE;
			if (tileKey === 'mapTile') {
				const seed = SERVER_MATCH_DATA.match_id + tileX + (tileY * this._map.map.length);
				applyMapTint(tileSprite, this._mapColoring[tileY][tileX], tileX + (tileY * this._map.map.length), seed);
			}

			switch (this._DRAW_MODE) {
				case (this._DRAW_MODES.SPRITES): {
					this._mapGroup.add(tileSprite);
					chunkArray.push(tileSprite);
					break;
				}
				case (this._DRAW_MODES.BITMAP): {
					primaryLayer.draw(tileSprite, (this._TILE_SIZE * xInChunk), (this._TILE_SIZE * yInChunk));
					tileSprite.destroy();
					break;
				}
				case (this._DRAW_MODES.TILEMAP): {
					tileSprite.destroy();
					primaryLayer.putTile(tileType, xInChunk, yInChunk);
					break;
				}
			}
		}
	}

	static _cullChunk(chunkX, chunkY) {
		const chunkKey = this._getChunkKey(chunkX, chunkY);
		const chunkArray = this._loadedChunks.get(chunkKey);

		// Return if the chunk is not loaded
		if (!chunkArray) return;

		// Hide or unload the chunk
		switch (this._CULL_MODE) {
			case this._CULL_MODES.HIDE: {
				if (chunkArray.visible) return;

				chunkArray.visible = true;
				break;
			}
			case this._CULL_MODES.UNLOAD: {
				chunkArray.destroy();
				this._loadedChunks.delete(chunkKey);
				break;
			}
			default: {
				console.error('Invalid cull mode:', this._CULL_MODE);
				break;
			}
		}
		// console.log('Culling chunk:', chunkX, chunkY);
	}

	static _shouldChunkBeVisible(chunkX, chunkY) {
		const CHUNK_SIZE_PIXELS = this._CHUNK_SIZE * this._TILE_SIZE;
		const padding = CHUNK_SIZE_PIXELS;

		const HALF_CHUNK_SIZE = CHUNK_SIZE_PIXELS / 2;
		const HALF_VIEW_WIDTH = (getGameWidth() / 2);
		const HALF_VIEW_HEIGHT = (getGameHeight() / 2);

		const viewX = game.world.pivot.x + HALF_VIEW_WIDTH;
		const viewY = game.world.pivot.y + HALF_VIEW_HEIGHT;

		const rangeX = HALF_VIEW_WIDTH + HALF_CHUNK_SIZE + padding;
		const rangeY = HALF_VIEW_HEIGHT + HALF_CHUNK_SIZE + padding;

		const worldX = this._PADDING_X + (chunkX * this._TILE_SIZE) + HALF_CHUNK_SIZE;
		const worldY = this._PADDING_Y + (chunkY * this._TILE_SIZE) + HALF_CHUNK_SIZE;

		const visible = Math.abs(worldX - viewX) < rangeX && Math.abs(worldY - viewY) < rangeY;
		return visible;
	}

	static _drawChristmasLights(chunkArray, secondaryLayer, tileType, tileX, tileY, xInChunk, yInChunk, CHUNK_WIDTH, CHUNK_HEIGHT) {
		const BITMAP_DRAWING_IS_ENABLED = (this._DRAW_MODE === this._DRAW_MODES.BITMAP);
		const TILEMAP_DRAWING_IS_ENABLED = (this._DRAW_MODE === this._DRAW_MODES.TILEMAP);

		const HALF_TILE_SIZE = this._TILE_SIZE / 2;
		const LIGHT_OFFSET = 5;
		const LIGHT_ALPHA = 0.7;

		const maze_list = this._map.map;
		const maze_row = maze_list[tileY];

		// If the tile is a wall, we may need to draw the lights on the edges
		if (isWallTile(tileType)) {
			const HAS_OVERLAP_TILE_X = (xInChunk < this._CHUNK_OVERLAP_TILES);
			const HAS_OVERLAP_TILE_Y = (yInChunk < this._CHUNK_OVERLAP_TILES);

			// Draw the left light for this block if:
			// - It's not on the left edge of the map
			// - It's not already drawn by the overlap
			// - There's no block to the left of it
			if (tileX !== 0 && !HAS_OVERLAP_TILE_X && !tileCollides(maze_row[tileX - 1])) {
				const leftLight = game.add.sprite(0, 0, 'c_lights');
				leftLight.anchor.set(0.5);
				leftLight.rotation = Math.PI / 2;
				leftLight.alpha = LIGHT_ALPHA;

				const TILE_X = (BITMAP_DRAWING_IS_ENABLED) ? xInChunk : tileX;
				const TILE_Y = (BITMAP_DRAWING_IS_ENABLED) ? yInChunk : tileY;

				const lightX = (this._TILE_SIZE * TILE_X) + LIGHT_OFFSET;
				const lightY = (this._TILE_SIZE * TILE_Y) + HALF_TILE_SIZE;

				if (BITMAP_DRAWING_IS_ENABLED) {
					secondaryLayer.draw(leftLight, lightX, lightY);
					leftLight.destroy();
				} else {
					leftLight.x = this._PADDING_X + lightX;
					leftLight.y = this._PADDING_Y + lightY;
					secondaryLayer.add(leftLight);
					chunkArray.push(leftLight);
				}
			}

			// Draw the right light for this block if:
			// - It's not on the right edge of the map
			// - There's no block to the right of it
			if (tileX !== maze_row.length - 1 && !tileCollides(maze_row[tileX + 1])) {
				const rightLight = game.add.sprite(0, 0, 'c_lights');
				rightLight.anchor.set(0.5);
				rightLight.rotation = -Math.PI / 2;
				rightLight.alpha = LIGHT_ALPHA;

				const TILE_X = (BITMAP_DRAWING_IS_ENABLED) ? xInChunk : tileX;
				const TILE_Y = (BITMAP_DRAWING_IS_ENABLED) ? yInChunk : tileY;

				const lightX = (this._TILE_SIZE * TILE_X) + this._TILE_SIZE - LIGHT_OFFSET;
				const lightY = (this._TILE_SIZE * TILE_Y) + HALF_TILE_SIZE;

				if (BITMAP_DRAWING_IS_ENABLED) {
					secondaryLayer.draw(rightLight, lightX, lightY);
					rightLight.destroy();
				} else {
					rightLight.x = this._PADDING_X + lightX;
					rightLight.y = this._PADDING_Y + lightY;
					secondaryLayer.add(rightLight);
					chunkArray.push(rightLight);
				}
			}

			// Draw the top light for this block if:
			// - It's not on the top edge of the map
			// - It's not already drawn by the overlap
			// - There's no block above it
			if (tileY !== 0 && !HAS_OVERLAP_TILE_Y && !tileCollides(maze_list[tileY - 1][tileX])) {
				const topLight = game.add.sprite(0, 0, 'c_lights');
				topLight.anchor.set(0.5);
				topLight.rotation = Math.PI;
				topLight.alpha = LIGHT_ALPHA;

				const TILE_X = (BITMAP_DRAWING_IS_ENABLED) ? xInChunk : tileX;
				const TILE_Y = (BITMAP_DRAWING_IS_ENABLED) ? yInChunk : tileY;

				const lightX = (this._TILE_SIZE * TILE_X) + HALF_TILE_SIZE;
				const lightY = (this._TILE_SIZE * TILE_Y) + LIGHT_OFFSET;

				if (BITMAP_DRAWING_IS_ENABLED) {
					secondaryLayer.draw(topLight, lightX, lightY);
					topLight.destroy();
				} else {
					topLight.x = this._PADDING_X + lightX;
					topLight.y = this._PADDING_Y + lightY;
					secondaryLayer.add(topLight);
					chunkArray.push(topLight);
				}
			}

			// Draw the bottom light for this block if:
			// - It's not on the bottom edge of the map
			// - There's no block below it
			if (tileY !== maze_list.length - 1 && !tileCollides(maze_list[tileY + 1][tileX])) {
				const bottomLight = game.add.sprite(0, 0, 'c_lights');
				bottomLight.anchor.set(0.5);
				bottomLight.rotation = 0;
				bottomLight.alpha = LIGHT_ALPHA;

				const TILE_X = (BITMAP_DRAWING_IS_ENABLED) ? xInChunk : tileX;
				const TILE_Y = (BITMAP_DRAWING_IS_ENABLED) ? yInChunk : tileY;

				const lightX = (this._TILE_SIZE * TILE_X) + HALF_TILE_SIZE;
				const lightY = (this._TILE_SIZE * TILE_Y) + this._TILE_SIZE - LIGHT_OFFSET;

				if (BITMAP_DRAWING_IS_ENABLED) {
					secondaryLayer.draw(bottomLight, lightX, lightY);
					bottomLight.destroy();
				} else {
					bottomLight.x = this._PADDING_X + lightX;
					bottomLight.y = this._PADDING_Y + lightY;
					secondaryLayer.add(bottomLight);
					chunkArray.push(bottomLight);
				}
			}
		}
		// If the tile is not a wall, we need to draw the lights on the edges of the chunk as they'll be chopped off
		else if (!tileCollides(tileType) && (BITMAP_DRAWING_IS_ENABLED || TILEMAP_DRAWING_IS_ENABLED)) {
			// Draw the left light for the right chunk edge if there's a wall there
			if (xInChunk === CHUNK_WIDTH - 1 && isWallTile(maze_row[tileX + 1])) {
				const leftLight = game.add.sprite(0, 0, 'c_lights');
				leftLight.anchor.set(0.5);
				leftLight.rotation = Math.PI / 2;
				leftLight.alpha = LIGHT_ALPHA;

				const TILE_X = (BITMAP_DRAWING_IS_ENABLED) ? xInChunk : tileX;
				const TILE_Y = (BITMAP_DRAWING_IS_ENABLED) ? yInChunk : tileY;

				const lightX = (this._TILE_SIZE * (TILE_X + 1)) + LIGHT_OFFSET;
				const lightY = (this._TILE_SIZE * TILE_Y) + HALF_TILE_SIZE;

				if (BITMAP_DRAWING_IS_ENABLED) {
					secondaryLayer.draw(leftLight, lightX, lightY);
					leftLight.destroy();
				} else {
					leftLight.x = this._PADDING_X + lightX;
					leftLight.y = this._PADDING_Y + lightY;
					secondaryLayer.add(leftLight);
					chunkArray.push(leftLight);
				}
			}

			// Draw the top lights for the bottom chunk edge if there's a wall there
			if (yInChunk === CHUNK_HEIGHT - 1 && isWallTile(maze_list[tileY + 1][tileX])) {
				const topLight = game.add.sprite(0, 0, 'c_lights');
				topLight.anchor.set(0.5);
				topLight.rotation = Math.PI;
				topLight.alpha = LIGHT_ALPHA;

				const TILE_X = (BITMAP_DRAWING_IS_ENABLED) ? xInChunk : tileX;
				const TILE_Y = (BITMAP_DRAWING_IS_ENABLED) ? yInChunk : tileY;

				const lightX = (this._TILE_SIZE * TILE_X) + HALF_TILE_SIZE;
				const lightY = (this._TILE_SIZE * (TILE_Y + 1)) + LIGHT_OFFSET;

				if (BITMAP_DRAWING_IS_ENABLED) {
					secondaryLayer.draw(topLight, lightX, lightY);
					topLight.destroy();
				} else {
					topLight.x = this._PADDING_X + lightX;
					topLight.y = this._PADDING_Y + lightY;
					secondaryLayer.add(topLight);
					chunkArray.push(topLight);
				}
			}
		}
	}

	static _ChunkArray = class _ChunkArray extends Array {
		_visible = false;

		get visible() { return this._visible; }
		set visible(value) {
			this._visible = value;
			this.forEach(sprite => sprite.visible = value);
		}

		destroy() {
			this.forEach(sprite => sprite.destroy());
		}
	}
}

function drawMapUsingGradient(maze_list, renderType) {
	var maze_walls = game.add.group();
	var size = 100;
	var y;
	var x = y = WORLD_PADDING;
	var width = maze_list[0].length;
	var height = maze_list.length;
	var bmd = game.make.bitmapData(width * size, height * size);
	bmd.addToWorld(x - 0.5, y - 0.5, 0, 0, 1, 1);
	var grd;
	if (renderType == "v") {
		grd = bmd.context.createLinearGradient(0, 0, 0, height * size);
	}
	else if (renderType == "r") {
		grd = bmd.context.createRadialGradient(width * size / 2, height * size / 2, 0, width * size / 2, height * size / 2, Math.sqrt(width * width + height * height) * size / 2);
	}
	else {
		grd = bmd.context.createLinearGradient(0, 0, width * size, 0);
	}
	grd.addColorStop(0, '#345cd2');
	grd.addColorStop(0.5, "#aaaaaa");
	grd.addColorStop(1, '#e72b2b');
	bmd.rect(0, 0, width * size, height * size, grd);
	for (var i = 0; i < height; i++) {
		var maze_row = maze_list[i];
		for (var t = 0; t < width; t++) {
			if (maze_row[t] == 1) {
				if (christmasTime()) {
					if (t != 0 && maze_list[i][t - 1] == 0) {
						var l = game.add.sprite(x + (size * t) + 5, y + (size * i) + 50, "c_lights");
						l.anchor.set(0.5);
						l.rotation = Math.PI / 2;
						l.alpha = .7;
					}
					if (t != maze_row.length - 1 && maze_list[i][t + 1] == 0) {
						var l = game.add.sprite(x + (size * t) + 100 - 5, y + (size * i) + 50, "c_lights");
						l.anchor.set(0.5);
						l.rotation = -Math.PI / 2;
						l.alpha = .7;
					}
					if (i != 0 && maze_list[i - 1][t] == 0) {
						var l = game.add.sprite(x + (size * t) + 50, y + (size * i) + 5, "c_lights");
						l.anchor.set(0.5);
						l.rotation = Math.PI;
						l.alpha = .7;
					}
					if (i != maze_list.length - 1 && maze_list[i + 1][t] == 0) {
						var l = game.add.sprite(x + (size * t) + 50, y + (size * i) + 100 - 5, "c_lights");
						l.anchor.set(0.5);
						l.rotation = 0;
						l.alpha = .7;
					}
				}
			}
			else {
				bmd.ctx.clearRect(t * size, i * size, size, size);
			}
		}

	}
}

/**
 * Determines if a tile type collides with a tank.
 * @param {number} tileType The type ID to check.
 * @returns {boolean} Whether the tile type collides.
 */
function tileCollides(tileType) {
	return !(tileType === TILE_TYPES.EMPTY || tileType === TILE_TYPES.ICE);
}

/**
 * Determines if a tile type is a wall.
 * @param {number} tileType 
 * @returns {boolean} Whether the tile type is a wall.
 */
function isWallTile(tileType) {
	const wallTiles = [TILE_TYPES.WALL, TILE_TYPES.WALL_BLUE, TILE_TYPES.WALL_RED, TILE_TYPES.WALL_BLUE_PALE, TILE_TYPES.WALL_RED_PALE];
	return wallTiles.includes(tileType);
}

/**
 * Given a map, generate a color grid that adds color to the game based on spawn point locations.
 */
function calculateMapColoring(map, isFFA = false) {
	let energies = [];
	for (let y = 0; y < map.map.length; y++) {
		energies.push([]);
		for (let x = 0; x < map.map[y].length; x++) {
			energies[y].push(0);
		}
	}

	const MAX_FALLOFF = 10;
	const CASTING_STRENGTH = 3.0;
	// Go through each spawn point and determine its effect on blocks nearby.

	const spawnTypes = (isFFA) ? ['ffa_spawns'] : ['blue_spawns', 'red_spawns'];
	for (const type of spawnTypes) {
		for (const spawn of map[type]) {
			let x = ~~(spawn[0] / 100);
			let y = ~~(spawn[1] / 100);
			for (let tX = x - MAX_FALLOFF; tX <= x + MAX_FALLOFF; tX++) {
				for (let tY = y - MAX_FALLOFF; tY <= y + MAX_FALLOFF; tY++) {
					if (tX < 0 || tY < 0 || tX >= energies[0].length || tY >= energies.length) {
						continue; // bounds checking
					}
					let dist = (tX - x) ** 2 + (tY - y) ** 2;
					if (dist < 1) {
						dist = 1;	// This should never happen, but let's prevent a divide by zero
					}				// error in case dist is ever actually zero.

					let energy = CASTING_STRENGTH / dist;
					// Blue blocks have "positive" energy, red blocks are "negative"
					if (isFFA) {
						energies[tY][tX] -= energy;
					} else {
						if (type == "blue_spawns") {
							energies[tY][tX] += energy;
						}
						else if (type == "red_spawns") {
							energies[tY][tX] -= energy;
						}
					}
				}
			}
		}
	}
	return energies;
}

/**
 * Given two hexidecimal color codes, return a hex color interpolating a certain percent between.
 * Includes clamping the percent to 0-1
 */
function interpolateHexColors(color1, color2, p) {
	p = Math.min(1, Math.max(0, p))

	const [r1, g1, b1] = hexColorToArray(color1);
	const [r2, g2, b2] = hexColorToArray(color2);

	const q = 1 - p;
	const rr = Math.round(r1 * p + r2 * q);
	const rg = Math.round(g1 * p + g2 * q);
	const rb = Math.round(b1 * p + b2 * q);

	return Number((rr << 16) + (rg << 8) + rb);
}

function hexColorToArray(rgb) {
	const r = rgb >> 16;
	const g = (rgb >> 8) % 256;
	const b = rgb % 256;

	return [r, g, b];
}

function stringToUniqueNumber(uniqueString) {
	let hash = 0;
	for (let i = 0; i < uniqueString.length; i++) {
		hash = uniqueString.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash >>> 0; // Ensure the hash is a positive integer
}

function seededRandom(seed) {
	if (typeof seed === 'string') {
		seed = stringToUniqueNumber(seed);
	}

	const x = Math.sin(seed + 1) * 10000;
	return x - Math.floor(x);
}
