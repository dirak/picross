const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GRID_WIDTH = 11;
const GRID_HEIGHT = 11;
const CELL_SIZE = 25;
const CELL_PADDING = 2;
const MODES = 2;

const X = 200;
const Y = 200;
const COLORS = [0xFFFFFF,0x000000,0xD3D3D3];

class GameScene extends Phaser.Scene {
	constructor() {
		super({key: "Game"})
	}

	preload() {
		COLORS.forEach((color,index) => {
			let tmp = this.add.graphics();
			tmp.fillStyle(color, 1.0);
			tmp.fillRect(0, 0, CELL_SIZE, CELL_SIZE);
			tmp.generateTexture(`color_${index}`, CELL_SIZE, CELL_SIZE);
		});
		this.bg = this.add.graphics();
		this.bg.fillStyle(0x708090, 1.0);
		this.bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

		this.grid = Array(GRID_WIDTH*GRID_HEIGHT).fill(0);
		this.grid_group = this.add.group();
		this.horizontal_text = this.add.group();
		this.vertical_text = this.add.group();
	}

	create() {
		this.loaded = false;
		this.renderGrid(X, Y);
		this.renderGridText(X, Y);
		document.getElementById('create_string').addEventListener('click', () => {
			document.getElementById('picross_string').value = this.generateString();
		});
		document.getElementById('load_string').addEventListener('click', () => {
			this.loadString(document.getElementById('picross_string').value);
		});
	}

	loadString(string) {
		this.loaded = true;
		this.grid = atob(string).split(',');
		this.updateGridText(true);
		this.grid = Array(GRID_WIDTH*GRID_HEIGHT).fill(0);
		this.grid_group.getChildren().forEach(child => {
			child.setTintFill(COLORS[0]);
		});
	}

	generateString() {
		return btoa(this.grid.join(','));
	}

	clickGridAt(index) {
		this.grid[index]++;
		this.grid[index] %= MODES;
		this.updateGridText();
		return this.grid[index];
	}

	renderGrid(x, y) {
		this.grid_group.clear();
		this.grid.forEach((cell, index) => {
			let cell_x = (index % GRID_WIDTH) * (CELL_SIZE + CELL_PADDING) ;
			let cell_y = Math.floor(index / GRID_HEIGHT)  * (CELL_SIZE + CELL_PADDING);
			let cell_gfx = this.add.sprite(x + cell_x, y + cell_y, `color_${cell}`);
			cell_gfx.setInteractive();
			cell_gfx.on('pointerdown', () => {
				cell_gfx.setTintFill(COLORS[this.clickGridAt(index)]);
			});
			this.grid_group.add(cell_gfx);
		});
	}

	renderGridText(x, y) {
		this.horizontal_text.clear();
		this.vertical_text.clear();
		Array(GRID_WIDTH).fill(0).forEach((_, index) => {
			let text_tmp = this.add.text(x - CELL_SIZE, y + (CELL_SIZE + CELL_PADDING) * index - (CELL_SIZE/4),
				'', {fontSize: '16px', fontFamily: 'Courier New', align: 'center'}
			);
			this.horizontal_text.add(text_tmp);
		});

		Array(GRID_HEIGHT).fill(0).forEach((_, index) => {
			let text_tmp = this.add.text(x + (CELL_SIZE + CELL_PADDING) * index - (CELL_SIZE/4), y,
				'', {fontSize: '16px', fontFamily: 'Courier New', align: 'center'}
			);
			this.vertical_text.add(text_tmp);
		});
	}

	updateGridText(force=false) {
		this.horizontal_text.getChildren().forEach((text, index) => {
			let grid_text = this.toPicrossNotation(this.getHorizontalList(index));
			if(!this.loaded || force) text.setText(grid_text);
			else {
				if(grid_text == text.text) {
					text.setFill("#000000");
				} else {
					text.setFill("#FFFFFF");
				}
			}
			text.setX(X - 16 - text.displayWidth);
		});
		this.vertical_text.getChildren().forEach((text, index) => {
			let grid_text = this.toPicrossNotation(this.getVerticalList(index),'\n');
			if(!this.loaded || force) text.setText(grid_text);
			else {
				if(grid_text == text.text) {
					text.setFill("#000000");
				} else {
					text.setFill("#FFFFFF");
				}
			}
			text.setY(Y - 16 - text.displayHeight);
		});
	}

	getHorizontalList(num) {
		return Array(GRID_WIDTH).fill(0).map((_, index) => {
			return this.grid[GRID_WIDTH*num + index];
		});
	}

	getVerticalList(num) {
		return Array(GRID_HEIGHT).fill(0).map((_, index) => {
			return this.grid[GRID_WIDTH*index + num];
		});
	}

	toPicrossNotation(list, sep=' ') {
		return list.reduce((acc, cur) => {
			if(cur == 1) acc[acc.length-1]++;
			else if(acc[acc.length-1] != 0) acc.push(0);
			return acc;
		}, [0]).filter(num => num != 0).join(sep);
	}
}

const gameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	parent:'canvas',
	scene: [GameScene]
}

const game = new Phaser.Game(gameConfig)

