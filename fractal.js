
js = {}

js.util = {}

js.util.map = (val,inMin,inMax,outMin,outMax) => {
  const a = inMin,
       b = outMin,
       c = inMax,
       d = outMax,
       x = val;

  return (b - d) / (a - c) * (x - a) + b;
}

js.util.renderer = (w,h) => {
 let canvas = document.createElement("canvas");

 canvas.width = w;
 canvas.height = h;

 canvas.style = "border:#eee solid 1px;";
 document.body.appendChild(canvas);

 ctx = canvas.getContext('2d');

 return ctx;
}


js.util.drawSet = async (w,h,iterationTensor,maxIterations,colorFunction,ctx,stride) => {
	const dataPoints = await iterationTensor.data();
	const colors = [];
	
	stride = stride || 1;
	
	ctx = ctx || js.util.renderer(w,h);
	
	dataPoints.forEach((i) => {
		colors.push(colorFunction(i,maxIterations));
	});
	
	for (let x = 0; x < w; x++) {
      	for (let y = 0; y < h; y++) {
          	ctx.fillStyle = colors[x * w + y];
  			ctx.fillRect(stride*y,stride*x,stride,stride);
      	}
  	}
}


js.util.rouge = (i,maxIterations) => {
  if (i === maxIterations) { return "#000000"; }
  return "hsl(0,100%,"+(i%100)+"%)";
}

js.util.yellow = (i,maxIterations) => {
  if (i === maxIterations) { return "#000000"; }
  return "hsl("+(i%360)+",100%,"+(i%100)+"%)";
}

js.util.green = (i,maxIterations) => {
  if (i === maxIterations) { return "#000000"; }
  return "hsl("+(i * 10 %360)+",100%,"+(i%100)+"%)";
}

js.util.blueOrange = (i,maxIterations) => {
  if (i === maxIterations) { return "#000000"; }
  return "hsl("+(i * 0.9 % 360)+",100%,50%)";
}

js.util.rainbow = (i,maxIterations) => {
  if (i === maxIterations) { return "#000000"; }
  return "hsl("+(i * 10 %360)+",100%,50%)";
}

js.util.selectColor = js.util.rainbow;


js.genLookupSpace = (w,h,xMin,xMax,yMin,yMax) => {

	// test params: w=4,h=2,xMin=-2,xMax=2,yMin=-1,yMax=1;
	return tf.tidy(() => {
		const realPrimitive = tf.linspace(xMin, xMax, w).expandDims(0);
		const imagPrimitive = tf.linspace(yMin, yMax, h).reverse(0).expandDims(0);
	
		const real = tf.tile(realPrimitive,[h,1]);
		const imag = tf.tile(imagPrimitive,[w,1]).transpose([1,0]);
		
		realPrimitive.dispose();
		imagPrimitive.dispose();
		
		const complex = tf.complex(real,imag);
		
		real.dispose();
		imag.dispose();
		
		return complex;
	});
	
}


js.complexNorms = (z) => {
	
	return tf.tidy(() => {
		const real = tf.real(z);
		const imag = tf.imag(z);
		
		const squaredReal = real.square();
		const squaredImag = imag.square();
		
		real.dispose();
		imag.dispose();
		
		const norms = squaredReal.add(squaredImag).sqrt();
		
		squaredReal.dispose();
		squaredImag.dispose();
		
		return norms;
	});
	
}


js.threshold = (norms,threshold) => {
	return tf.tidy(() => {
	
		// converts values above threshold into negative numbers
		// values below threshold will stay positive
		// these are only values above the threshold
		// convert the positive values to ones
		// so this output is a bunch of ones and zeros where ones indicate
		// that the norm is above the threshold so it approaches
		// infinity
		const thresholded = threshold.sub(norms).sign().relu();
		
		return thresholded;
	})
}


js.zSquaredPlusC = (z,c) => {
	return tf.tidy(() => {
		
		// computes f_c(z) = z^2 + c
		return z.mul(z).add(c);
		
	})
}


js.mandelbrot = async (lookupSpace,threshold,iterations) => {
	
	return tf.tidy(() => {
	
		threshold = tf.tensor1d([threshold]);
		
		// these are for garbage collecting
		let prevComplexTensor;
		let prevComplexNorms;
		let prevAboveThresholdVals;
		let prevIterationCounts;
		 
		let currentComplexTensor = tf.tensor1d([0]);
		let complexNorms;
		let aboveThresholdVals;
		let iterationCounts = tf.zeros(lookupSpace.shape);
		
		for (var i = 0; i < iterations; i++) {
			
			prevComplexTensor = currentComplexTensor;
			prevComplexNorms = complexNorms;
			prevAboveThresholdVals = aboveThresholdVals;
			prevIterationCounts = iterationCounts;
			
			currentComplexTensor = js.zSquaredPlusC(
				currentComplexTensor,
				lookupSpace
			);
			
			complexNorms = js.complexNorms(currentComplexTensor);
			aboveThresholdVals = js.threshold(complexNorms,threshold);
			iterationCounts = iterationCounts.add(aboveThresholdVals);
			
			// safe garbage collecting
			(prevComplexTensor || {dispose:() => {}}).dispose();
			(prevComplexNorms || {dispose:() => {}}).dispose();
			(prevAboveThresholdVals || {dispose:() => {}}).dispose();
			(prevIterationCounts || {dispose:() => {}}).dispose();
			
		}
		threshold.dispose();
		
		
		
		
		return iterationCounts;
	});
}


js.julia = async (lookupSpace,threshold,iterations,cx,cy) => {
	
	return tf.tidy(() => {
	
		threshold = tf.tensor1d([threshold]);
		
		// these are for garbage collecting
		let prevComplexTensor;
		let prevComplexNorms;
		let prevAboveThresholdVals;
		let prevIterationCounts;
		 
		let currentComplexTensor = lookupSpace;
		let complexNorms;
		let aboveThresholdVals;
		let iterationCounts = tf.zeros(lookupSpace.shape);
		let complexParam = tf.complex(tf.tensor1d([cx]),tf.tensor1d([cy]));
		
		for (var i = 0; i < iterations; i++) {
			
			prevComplexTensor = currentComplexTensor;
			prevComplexNorms = complexNorms;
			prevAboveThresholdVals = aboveThresholdVals;
			prevIterationCounts = iterationCounts;
			
			currentComplexTensor = js.zSquaredPlusC(
				currentComplexTensor,
				complexParam
			);
			
			complexNorms = js.complexNorms(currentComplexTensor);
			aboveThresholdVals = js.threshold(complexNorms,threshold);
			iterationCounts = iterationCounts.add(aboveThresholdVals);
			
			// safe garbage collecting
			(prevComplexTensor || {dispose:() => {}}).dispose();
			(prevComplexNorms || {dispose:() => {}}).dispose();
			(prevAboveThresholdVals || {dispose:() => {}}).dispose();
			(prevIterationCounts || {dispose:() => {}}).dispose();
			
		}
		
		lookupSpace.dispose();
		threshold.dispose();
		
		
		return iterationCounts;
	});
}

js.viewBox = (w,h,cx,cy,zoom) => {
	return [
		w,h,
		cx - zoom,
		cx + zoom,
		cy - zoom,
		cy + zoom
	];
}

js.interactiveMandelbrot = function (w,h,res,x,y,z,threshold) {
	
	this.threshold = threshold || 4;
	this.res = res || 1000;
	
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 2;// zoom factor
	
	this.ctx = js.util.renderer(w,h);
	this.canvas = this.ctx.canvas;
	
	
	this.downsampleFactor = 5;
	this.iterationDecreaseFactor = 2;
	
	this.timer,this.timeOfPrevMouseMove = 0;;
	
	this.canvas.onwheel = async (e) => {
		
	
		const mouseX = e.offsetX;
		const mouseY = e.offsetY;
		
		const zoom = e.deltaY;
		const viewBox = js.viewBox(w,h,this.x,this.y,this.z);
		
		// convert to coordinates in the complex plane
		// this is the coordinate that should stay where the mouse is
		const coordx = js.util.map(mouseX,0,w,viewBox[2],viewBox[3]);
		const coordy = js.util.map(mouseY,h,0,viewBox[4],viewBox[5]);
		
		
		
		this.z *= 1 - 0.05 * (zoom / 80);
		
		const scaledViewBox = js.viewBox(w,h,this.x,this.y,this.z);
		
		// this finds the coordinate that the mouse will be at after the zoom
		const zoomedMouseX = js.util.map(mouseX,0,w,scaledViewBox[2],scaledViewBox[3]);
		const zoomedMouseY = js.util.map(mouseY,h,0,scaledViewBox[4],scaledViewBox[5]);
		
		
		this.x -= zoomedMouseX - coordx;
		this.y -= zoomedMouseY - coordy;
		
		await this.displayLowRes(this.downsampleFactor,this.iterationDecreaseFactor);
		
		// UI CODE
		// TODO remove ui code from here and make better solution for
		// updating ui
		
		
		xpos.value = viewer.x;
		ypos.value = viewer.y;
		window.zoom.value = viewer.z;
	}
	
	this.canvas.onmousedown = (e) => {
		
		const mouseX0 = e.offsetX;
		const mouseY0 = e.offsetY;
		
		
		const viewBox0 = js.viewBox(w,h,this.x,this.y,this.z);
		
		const origX = this.x;
		const origY = this.y;
		
		// convert to coordinates in the complex plane
		// this is the coordinate where mouse is
		const coordx0 = js.util.map(mouseX0,0,w,viewBox0[2],viewBox0[3]);
		const coordy0 = js.util.map(mouseY0,h,0,viewBox0[4],viewBox0[5]);
		
		this.canvas.onmousemove = async (e) => {
		
			
			if (Date.now() - this.timeOfPrevMouseMove < 100) {
				clearTimeout(this.timer);
			}
			
			const mouseX = e.offsetX;
			const mouseY = e.offsetY;
		
			// now this is coordinate of where coordx0 and coordy0 should be
			// after shift
			const coordx = js.util.map(mouseX,0,w,viewBox0[2],viewBox0[3]);
			const coordy = js.util.map(mouseY,h,0,viewBox0[4],viewBox0[5]);
		
		
			this.x = origX + coordx0 - coordx;
			this.y = origY + coordy0 - coordy;
			
			// debounce
			this.timeOfPrevMouseMove = Date.now();
			this.timer = setTimeout(() => {
				this.displayLowRes(this.downsampleFactor,this.iterationDecreaseFactor);
			},5);
			
			// UI CODE
			// TODO remove ui code from here and make better solution for
			// updating ui
		
			xpos.value = viewer.x;
			ypos.value = viewer.y;
			window.zoom.value = viewer.z;
			
		}
		
		
	}
	
	this.canvas.onmouseup = async (e) => {
		this.canvas.onmousemove = null;
	}
	
	this.displayLowRes = async (downsampleFactor,iterationDecreaseFactor) => {
		let a = js.genLookupSpace(...js.viewBox(
			w / downsampleFactor,
			h / downsampleFactor,
			this.x,
			this.y,
			this.z
		));
		
		let b = await js.mandelbrot(a,this.threshold,this.res / iterationDecreaseFactor);
	
		a.dispose();
		
		js.util.drawSet(
			w / downsampleFactor,
			h / downsampleFactor,
			b,
			this.res / iterationDecreaseFactor,
			js.util.selectColor,
			this.ctx,
			downsampleFactor
		);
		
		b.dispose();
	}
	
	this.display = async () => {
		let a = js.genLookupSpace(...js.viewBox(
			w,
			h,
			this.x,
			this.y,
			this.z
		));
		
		let b = await js.mandelbrot(a,this.threshold,this.res);
	
		a.dispose();
		
		js.util.drawSet(
			w,
			h,
			b,
			this.res,
			js.util.selectColor,
			this.ctx
		);
		
		b.dispose();
	}
	

}


js.interactiveJulia = function (w,h,res,x,y,z,threshold,cx,cy) {
	
	this.threshold = threshold || 4;
	this.res = res || 1000;
	
	this.cx = cx || -1;
	this.cy = cy || 0;
	
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 2;// zoom factor
	
	this.ctx = js.util.renderer(w,h);
	this.canvas = this.ctx.canvas;
	
	
	this.downsampleFactor = 5;
	this.iterationDecreaseFactor = 2;
	
	this.canvas.onwheel = async (e) => {
		
	
		const mouseX = e.offsetX;
		const mouseY = e.offsetY;
		
		const zoom = e.deltaY;
		const viewBox = js.viewBox(w,h,this.x,this.y,this.z);
		
		// convert to coordinates in the complex plane
		// this is the coordinate that should stay where the mouse is
		const coordx = js.util.map(mouseX,0,w,viewBox[2],viewBox[3]);
		const coordy = js.util.map(mouseY,h,0,viewBox[4],viewBox[5]);
		
		
		
		this.z *= 1 - 0.05 * (zoom / 80);
		
		const scaledViewBox = js.viewBox(w,h,this.x,this.y,this.z);
		
		// this finds the coordinate that the mouse will be at after the zoom
		const zoomedMouseX = js.util.map(mouseX,0,w,scaledViewBox[2],scaledViewBox[3]);
		const zoomedMouseY = js.util.map(mouseY,h,0,scaledViewBox[4],scaledViewBox[5]);
		
		
		this.x -= zoomedMouseX - coordx;
		this.y -= zoomedMouseY - coordy;
		
		await this.displayLowRes(this.downsampleFactor,this.iterationDecreaseFactor);
		
		// UI CODE
		// TODO remove ui code from here and make better solution for
		// updating ui
		
		
		xpos.value = viewer.x;
		ypos.value = viewer.y;
		window.zoom.value = viewer.z;
		complexX.value = viewer.cx;
		complexY.value = viewer.cy;
	}
	
	this.canvas.onmousedown = (e) => {
		
		const mouseX0 = e.offsetX;
		const mouseY0 = e.offsetY;
		
		
		const viewBox0 = js.viewBox(w,h,this.x,this.y,this.z);
		
		const origX = this.x;
		const origY = this.y;
		
		// convert to coordinates in the complex plane
		// this is the coordinate where mouse is
		const coordx0 = js.util.map(mouseX0,0,w,viewBox0[2],viewBox0[3]);
		const coordy0 = js.util.map(mouseY0,h,0,viewBox0[4],viewBox0[5]);
		
		this.canvas.onmousemove = async (e) => {
		
			
			if (Date.now() - this.timeOfPrevMouseMove < 100) {
				clearTimeout(this.timer);
			}
			
			const mouseX = e.offsetX;
			const mouseY = e.offsetY;
		
			// now this is coordinate of where coordx0 and coordy0 should be
			// after shift
			const coordx = js.util.map(mouseX,0,w,viewBox0[2],viewBox0[3]);
			const coordy = js.util.map(mouseY,h,0,viewBox0[4],viewBox0[5]);
		
		
			this.x = origX + coordx0 - coordx;
			this.y = origY + coordy0 - coordy;
			
			// debounce
			this.timeOfPrevMouseMove = Date.now();
			this.timer = setTimeout(() => {
				this.displayLowRes(this.downsampleFactor,this.iterationDecreaseFactor);
			},5);
			
			// UI CODE
			// TODO remove ui code from here and make better solution for
			// updating ui
		
			xpos.value = viewer.x;
			ypos.value = viewer.y;
			window.zoom.value = viewer.z;
			
		}
		
		
	}
	
	this.canvas.onmouseup = async (e) => {
		this.canvas.onmousemove = null;
	}
	
	this.displayLowRes = async (downsampleFactor,iterationDecreaseFactor) => {
		let a = js.genLookupSpace(...js.viewBox(
			w / downsampleFactor,
			h / downsampleFactor,
			this.x,
			this.y,
			this.z
		));
		
		let b = await js.julia(a,this.threshold,this.res / iterationDecreaseFactor,this.cx,this.cy);
	
		a.dispose();
		
		js.util.drawSet(
			w / downsampleFactor,
			h / downsampleFactor,
			b,
			this.res / iterationDecreaseFactor,
			js.util.selectColor,
			this.ctx,
			downsampleFactor
		);
		
		b.dispose();
	}
	
	this.display = async () => {
		let a = js.genLookupSpace(...js.viewBox(
			w,
			h,
			this.x,
			this.y,
			this.z
		));
		
		let b = await js.julia(a,this.threshold,this.res,this.cx,this.cy);
	
		a.dispose();
		
		js.util.drawSet(
			w,
			h,
			b,
			this.res,
			js.util.selectColor,
			this.ctx
		);
		
		b.dispose();
	}
	

}



magicRect = async (threshold,iterations) => {
	let rect = js.genLookupSpace(...js.viewBox(2,2,-0.5,0,2));
	let results = await js.mandelbrot(rect,threshold,iterations);
	
	
}

// higher complex norms indicates that is increasing in size quite rapidly
// therefore is not bounded and not in mandelbrot set
// if is is not in mandelbrot set, then it is colored based on how fast it
// approaches infinity

/*
const instance = js.drawSet(1-1.61803398875,0,1000,{
  width:500,
  height:500
},{
  xMin:-1.5,
  xMax:1.5,
  yMin:-1.5,
  yMax:1.5
});*/
