const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const CELL_SIZE = 30;
const FONT_SIZE = 18;
const CELL_PADDING = 1;
const MODES = 3;
const GRID_LINE = 5;


const COLORS = [0xFFFFFF,0x000000,0xD3D3D3];

class GameScene extends Phaser.Scene {
	constructor() {
		super({key: "Game"})
	}

	preload() {
    this.GRID_WIDTH = GRID_WIDTH;
    this.GRID_HEIGHT = GRID_HEIGHT;
    this.grid_group = this.add.group();
		this.horizontal_text = this.add.group();
    this.vertical_text = this.add.group();
    
		COLORS.forEach((color,index) => {
			let tmp = this.add.graphics();
			tmp.fillStyle(color, 1.0);
			tmp.fillRect(0, 0, CELL_SIZE, CELL_SIZE);
			tmp.generateTexture(`color_${index}`, CELL_SIZE, CELL_SIZE);
		});
	}

	create() {
		this.loaded = false;
    this.loadGrid(10, 10);
		document.getElementById('create_string').addEventListener('click', () => {
			document.getElementById('picross_string').value = this.generateString();
		});
		document.getElementById('load_string').addEventListener('click', () => {
			this.loadString(document.getElementById('picross_string').value);
    });
    
    document.getElementById('10x10').addEventListener('click', () => {
			this.loadGrid(10, 10);
    });
    document.getElementById('15x15').addEventListener('click', () => {
			this.loadGrid(15, 15);
    });
    document.getElementById('20x20').addEventListener('click', () => {
			this.loadGrid(20, 20);
		});
	}

	loadString(string) {
		this.loaded = true;
    string = atob(string).split('||||');
    this.loadGrid(string[0], string[1], string[2].split(','));
	}

	generateString() {
		return btoa(`${this.GRID_WIDTH}||||${this.GRID_HEIGHT}||||${this.grid.join(',')}`);
  }
  
  loadGrid(w, h, grid=false) {
    this.bg = this.add.graphics();
		this.bg.fillStyle(0x708090, 1.0);
		this.bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    this.GRID_WIDTH = parseInt(w);
    this.GRID_HEIGHT = parseInt(h);
    this.grid = [...Array(this.GRID_HEIGHT*this.GRID_WIDTH).fill(0)];
    this.X = (GAME_WIDTH / 2) - ((CELL_SIZE + CELL_PADDING) * this.GRID_WIDTH)/2;
    this.Y = (GAME_HEIGHT / 2) - ((CELL_SIZE + CELL_PADDING) * this.GRID_HEIGHT)/2;
    this.renderGrid(this.X, this.Y);
    this.renderGridText(this.X, this.Y);
    if(grid) {
      this.grid = grid
    }
    this.updateGridText(!!grid);
    this.grid.fill(0);
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
			let cell_x = (index % this.GRID_WIDTH) * (CELL_SIZE + CELL_PADDING) ;
			let cell_y = Math.floor(index / this.GRID_HEIGHT)  * (CELL_SIZE + CELL_PADDING);
			let cell_gfx = this.add.sprite(x + cell_x, y + cell_y, `color_${cell}`);
			cell_gfx.setInteractive();
			cell_gfx.on('pointerdown', () => {
				cell_gfx.setTintFill(COLORS[this.clickGridAt(index)]);
			});
			this.grid_group.add(cell_gfx);
    });
    this.renderGridLines();
	}

  renderGridLines() {
    for(var i = 1; i < this.GRID_HEIGHT / GRID_LINE; i++) {
      let graphics = this.add.graphics({lineStyle: {
        width: 2,
        color: 0x907080 
      }});
      let line = new Phaser.Geom.Line(
        this.X + ((i* GRID_LINE) * (CELL_SIZE + CELL_PADDING)) - CELL_SIZE/2, this.Y - (CELL_SIZE/2),
        this.X + ((i* GRID_LINE) * (CELL_SIZE + CELL_PADDING)) - CELL_SIZE/2, this.Y + (this.GRID_HEIGHT * (CELL_SIZE + CELL_PADDING)) - (CELL_SIZE/2)
        );
      graphics.strokeLineShape(line);
    }

    for(var i = 1; i < this.GRID_WIDTH / GRID_LINE; i++) {
      let graphics = this.add.graphics({lineStyle: {
        width: 2,
        color: 0x907080 
      }});
      let line = new Phaser.Geom.Line(
        this.X - CELL_SIZE/2, this.Y + ((i * GRID_LINE) * (CELL_SIZE + CELL_PADDING) - CELL_SIZE/2),
        this.X + (this.GRID_WIDTH * (CELL_SIZE + CELL_PADDING)) - CELL_SIZE/2, this.Y + ((i * GRID_LINE) * (CELL_SIZE + CELL_PADDING) - CELL_SIZE/2)
        );
      graphics.strokeLineShape(line); 
    }
  }

	renderGridText(x, y) {
		this.horizontal_text.clear();
    this.vertical_text.clear();
		[...Array(this.GRID_WIDTH)].forEach((_, index) => {
			let text_tmp = this.add.text(x - CELL_SIZE, y + (CELL_SIZE + CELL_PADDING) * index - (CELL_SIZE/4),
				'', {fontSize: `${FONT_SIZE}px`, fontFamily: 'Courier New', align: 'center'}
			);
      this.horizontal_text.add(text_tmp);
		});
		[...Array(this.GRID_HEIGHT)].forEach((_, index) => {
			let text_tmp = this.add.text(x + (CELL_SIZE + CELL_PADDING) * index - (CELL_SIZE/4), y,
				'', {fontSize: `${FONT_SIZE}px`, fontFamily: 'Courier New', align: 'center'}
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
			text.setX(this.X - FONT_SIZE - text.displayWidth);
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
			text.setY(this.Y - FONT_SIZE - text.displayHeight);
		});
	}

	getHorizontalList(num) {
		return [...Array(this.GRID_WIDTH)].map((_, index) => {
			return this.grid[this.GRID_WIDTH*num + index];
		});
	}

	getVerticalList(num) {
		return [...Array(this.GRID_HEIGHT)].map((_, index) => {
			return this.grid[this.GRID_WIDTH*index + num];
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
	width: GAME_WIDTH,
	height: GAME_HEIGHT,
	parent:'canvas',
	scene: [GameScene]
}

const game = new Phaser.Game(gameConfig)

