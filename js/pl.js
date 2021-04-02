/**
 * Peripheral Lookup
 * lookups are done from the center out
 * to maximize usability
 */

// spec
// pixel x,y
// start x,y
// bound w,h
// [px, py, sx, sy, w, h]

var subdiv = (pixel, lookup) => {
	const [_px, _py, sx, sy, w, h] = pixel;
	
	// we don't care about px, py
	// and we will actively ignore them
  
	// end x
	const ex = sx + w;
	const ey = sy + h;

	// sub unit width height
	const sw = w / 3;
	const sh = h / 3;

	// offset to get center of a pixel
	const cx = sw / 2;
	const cy = sh / 2;

	// calc x indices
	const ix0 = sx;
	const ix1 = sx + sw;
	const ix2 = ex - sw;
	const ix3 = ex;	

	// calc y indices
	const iy0 = sy;
	const iy1 = sy + sh;
	const iy2 = ey - sh;
	const iy3 = ey;

	// center
	lookup.push([ 
		ix1 + cx, iy1 + cy,
		sx, sy, w, h
	]);

	// top left rect
	lookup.push([ 
		ix0 + cx, iy1 + cy,
		sx, sy, sw, sh * 2
	]);

	// top right rect
	lookup.push([ 
		ix1 + cx, iy0 + cy,
		ix1, sy, sw * 2, sh
	]);

	// bottom right rect
	lookup.push([ 
		ix2 + cx, iy1 + cy,
		ix2, iy1, sw, sh * 2
	]);

	// bottom left rect
	lookup.push([ 
		ix1 + cx, iy2 + cy,
		ix0, iy2, sw * 2, sh
	]);

	// top left corner
	lookup.push([ 
		sx + cx, sy + cy,
		sx, sy, sw, sh
	]);

	// top right corner
	lookup.push([ 
		ix2 + cx, sy + cy,
		ix2, sy, sw, sh
	]);

	// bottom right corner
	lookup.push([ 
		ix2 + cx, iy2 + cy,
		ix2, iy2, sw, sh
	]);

	// bottom left corner
	lookup.push([ 
		sx + cx, iy2 + cy,
		sx, iy2, sw, sh
	]);
}

subdiv([1.5,1.5,1,1,6,6],lookupTable = []);

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var i = 0;

var lookupColors = [
	"rgb(0,0,0)",//b
	"rgb(255,0,0)",//r
	"rgb(255,255,0)",//y
	"rgb(0,255,0)",//g
	"rgb(0,255,255)",//c
	"rgb(0,0,255)",//b
	"rgb(255,0,255)",//m
	"rgb(255,255,255)",//w
	"rgb(127,127,127)",//gray
]


canvas.width = 10;
canvas.height = 10;
canvas.style = "transform: scale(10) translate(50%, 50%); image-rendering: crisp-edges;";
document.body.appendChild(canvas);


setInterval(function () {
	const randColor = () => Math.floor(Math.random() * 256);
	if (i < lookupTable.length) {
		ctx.fillStyle = lookupColors[i];
		ctx.fillRect(lookupTable[i][2],lookupTable[i][3],lookupTable[i][4],lookupTable[i][5]);
	}

	i = (i + 1) % (lookupTable.length + 5);
}, 1000);



