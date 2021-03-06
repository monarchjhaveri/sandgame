class SandMote {
	constructor() {
		this.state = {};
		this.element = ELEMENTS[0];	
	}

	calculateNextPosition(oldColIndex, oldRowIndex) {
		var newRowIndex = Math.min(oldRowIndex + 1, CONFIG.ROWS - 1);
		var newColIndex = oldColIndex;
		return [newColIndex, newRowIndex];
	}
}


var CANVAS = document.getElementById('canvas');

var CONFIG = {};
CONFIG.COLS = 1024 / 8;
CONFIG.ROWS = 768 / 8;
CONFIG.MOTE_HEIGHT = CANVAS.height / CONFIG.ROWS;
CONFIG.MOTE_WIDTH = CANVAS.width / CONFIG.COLS;
CONFIG.SCALE_X = CANVAS.width / CONFIG.COLS;
CONFIG.SCALE_Y = CANVAS.height / CONFIG.ROWS;
// for the coefficients, higher = faster
CONFIG.STATE_LOOP_SPEED = 6;
CONFIG.RENDER_LOOP_SPEED = 60;

var COLORS = {
	BLACK: "rgb(0,0,0)"
};

var ELEMENTS = {
	0: {
		name: "Sand",
		color: "rgb(255,0,0)"
	}
};

var CONTEXT = canvas.getContext('2d');
var COLUMNS = newBiDimArray(CONFIG.COLS, CONFIG.ROWS);
COLUMNS[2] = COLUMNS[2] || [];
COLUMNS[2][2] = new SandMote();

CANVAS.addEventListener('click', function(event) {
	var location = getScaledEventLocation(event);

	COLUMNS[location.x] = COLUMNS[location.x] || [];
	var ROWS = COLUMNS[location.x];
	ROWS[location.y] = ROWS[location.y] || new SandMote();
}, false);

setInterval(stateLoop, 1000 / CONFIG.STATE_LOOP_SPEED);
setInterval(renderLoop, 1000 / CONFIG.RENDER_LOOP_SPEED);

function stateLoop() {
	COLUMNS = calculateNextState(COLUMNS);
}
function renderLoop() {
	renderTick(COLUMNS);
}

function colIndexToX(colIndex) {
	return CONFIG.SCALE_X * colIndex;
}

function rowIndexToY(rowIndex) {
	return CONFIG.SCALE_Y * rowIndex;
}

function xToColIndex(x) {
	return Math.floor(x / CONFIG.SCALE_X);
}

function yToRowIndex(y) {
	return Math.floor(y / CONFIG.SCALE_Y);
}

// a mote is an object {element: ELEMENT[0], state: {...}}
function drawMote(colIndex, rowIndex, mote) {
	CONTEXT.fillStyle = mote.element.color;
	CONTEXT.fillRect(colIndexToX(colIndex), rowIndexToY(rowIndex), CONFIG.MOTE_WIDTH, CONFIG.MOTE_HEIGHT);
}

function calculateNextState(columnsArray) {
	var newColumnsArray = newBiDimArray(CONFIG.COLS, CONFIG.ROWS);

	columnsArray.forEach((rowsArray, colIndex) => {
		rowsArray.forEach((mote, rowIndex) => {
			if (!mote) return;
			
			var nextPosition = mote.calculateNextPosition(colIndex, rowIndex);
			newColumnsArray[nextPosition[0]][nextPosition[1]] = mote;
		})
	});

	return newColumnsArray;
}

function clearScreen() {
	CONTEXT.fillStyle = "#000000";
	CONTEXT.fillRect(0, 0, colIndexToX(CONFIG.COLS), rowIndexToY(CONFIG.ROWS));
}

function renderTick(columnsArray) {
	clearScreen();

	columnsArray.forEach((rowsArray, colIndex) => {
		rowsArray.forEach((mote, rowIndex) => {
			if (!mote)
				return;

			drawMote(colIndex, rowIndex, mote);
		})
	});
}

function newBiDimArray(cols, rows) {
	var columns = [];

	for (var i = 0; i < cols; i++) {
		columns[i] = new Array(rows);
	}

	return columns;
}

function findInArray(columns, predicate) {
	for (var i = 0; i < columns.length; i++) {
		for (var j = 0; j < columns.length; j++) {
			if (predicate(columns[i][j])) {
				return columns[i][j];
			}
		}
	}
}

//http://ourcodeworld.com/articles/read/185/how-to-get-the-pixel-color-from-a-canvas-on-click-or-mouse-event-with-javascript
function getElementPosition(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

//http://ourcodeworld.com/articles/read/185/how-to-get-the-pixel-color-from-a-canvas-on-click-or-mouse-event-with-javascript
function getEventLocation(element,event){
    // Relies on the getElementPosition function.
    var pos = getElementPosition(element);
    
    return {
    	x: event.pageX - pos.x,
      	y: event.pageY - pos.y
    };
}

function getScaledEventLocation(event) {
	var location = getEventLocation(CANVAS, event);
	location.x = xToColIndex(location.x);
	location.y = yToRowIndex(location.y);
	return location;
}
