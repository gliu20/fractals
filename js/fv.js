/** 
 * Fractal Viewer Library
 * @author github:gliu20
 */

const fv = {};


fv._throttleAt = (fps, callback, infoCallback) => {
	let start = performance.now();
	let end = performance.now();
	let mergeInvocate = 1;
	let averageDuration = 0;
	let totalDuration = 0;
	let skippedInvocations = 0;
	let targetExecutions = 10;

	const targetDuration = 1000 / fps;


	function timeCallback(callback) {
		skippedInvocations = 0;

		start = performance.now();

		callback();

		end = performance.now();

		totalDuration = end - start;
		averageDuration = totalDuration;
	}

	function mergedCallback(callback, numInvocations) {
		return function () {
			for (var i = 0; i < numInvocations; i++) {
				callback();
			}
		}
	}

	(function loop() {
		// averageDuration is in ms
		// fps is converted to ms as well
		if (averageDuration > targetDuration) {
			// we're not meeting target fps
			// hence, we have to throttle by skipping invocations
			skippedInvocations++;
			averageDuration = totalDuration / skippedInvocations;


			// decrease mergedInvocate by the amount of skipped frames
			// as more frames are skipped, mergeInvocate decreases
			// exponentially
			// so it's like AIMD
			mergeInvocate -= skippedInvocations;
			window.statusText = "Skipping..."; 
		}
		else {

			// we're meeting targets so we can run the callback
			// instead of waiting
			timeCallback(mergedCallback(callback, mergeInvocate));

			// AIMD for merge invocate
			// we're faster than the desired average fps so we group the callback together
			mergeInvocate += 1;
			window.statusText = "...Speeding";
		}

		// target executions calculated from this
		// (totalDuration / mergeInvocate) * (desired num of executions) = targetDuration
		targetExecutions = targetDuration * mergeInvocate / (totalDuration + 1);
		mergeInvocate += (targetExecutions - mergeInvocate) >> 4;

		// make sure merge invocate is 1 or higher
		if (mergeInvocate < 1)
			mergeInvocate = 1;

		infoCallback(averageDuration, mergeInvocate, skippedInvocations);

		// to avoid stack overflow by indirectly calling loop
		setTimeout(loop, 0);
	})();

	return function () {
		start = performance.now();
		end = performance.now();
		mergeInvocate = 1;
		averageDuration = 0;
		totalDuration = 0;
		skippedInvocations = 0;
		targetExecutions = 10;
	}
}


fv._wait = () => {
	return new Promise(function (resolve) {
		requestAnimationFrame(resolve);
	})
}

fv.draw = async (lookupFunc, lookupTable, ctx, infoCallback) => {
	let i = 0;
	let start = performance.now();
	let end = performance.now();
	let isIdle = false; 

	function iterate() {


		if (i === 0)
			start = performance.now();
		if (i === lookupTable.length - 1)
			end = performance.now();
			

		if (i < lookupTable.length) {
			const xi = lookupTable[i][0];
			const yi = lookupTable[i][1];

			const w = lookupTable[i][2];
			const h = lookupTable[i][3];

			ctx.fillStyle = lookupFunc(xi, yi);
			ctx.fillRect(xi, yi, w, h);

			i++;
			isIdle = false;
		}
		else {
			// stop doing stuff and force
			// to reset throttle to prevent overloading
			controlObj.resetThrottle();
			isIdle = true;
		}

		return true;
	}

	

	const controlObj = {
		refreshView: function () {
			i = 0;
		},
		resetThrottle: fv._throttleAt(60, iterate, function (averageDuration, mergeInvocate, skippedInvocations) {
			infoCallback(mergeInvocate, skippedInvocations, isIdle, i / lookupTable.length, end - start);
		})
	}
	
	return controlObj;

}

fv.map = (val, inMin, inMax, outMin, outMax) => {
	const a = inMin,
		b = outMin,
		c = inMax,
		d = outMax,
		x = val;

	return (b - d) / (a - c) * (x - a) + b;
}


fv.genLookupTable = async (w, h, onprogress) => {
	const lookup = [[0, 0, w, h]];
	const cleanLookup = [];

	let index = {};

	const iterationsX = Math.ceil(Math.log2(w));
	const iterationsY = Math.ceil(Math.log2(h));
	const maxIterations = Math.max(iterationsX, iterationsY);

	for (var i = 0; i < maxIterations; i++) {
		const currLength = lookup.length;
		for (var j = 0; j < currLength; j++) {

			// only if we didn't subdivide this then we subdivide this
			if (!index[lookup[j].join(",")]) {
				Array.prototype.push.apply(lookup, fv.genSubdividedLookup(
					lookup[j][0],
					lookup[j][1],
					lookup[j][2],
					lookup[j][3]
				));
				index[lookup[j].join(",")] = true;
			}

			if ((i * maxIterations + j) % 15000 === 0) {
				onprogress(j, currLength, i, maxIterations);
			}

			// throttle genLookupTable every couple steps
			if ((i * maxIterations + j) % 15000 === 0) {
				await fv._wait();
			}


		}
	}

	// clear index
	index = {};

	// clean up time
	for (var i = 0; i < lookup.length; i++) {

		if (i % 30000 === 0) {
			onprogress(i, lookup.length, 1, 1);
		}

		if (i % 15000 === 0) {
			await fv._wait();
		}

		// this a new index for deduplicating
		// unrelated to the before index
		if (!index[lookup[i][0] + "," + lookup[i][1]]) {

			// mark as done
			index[lookup[i][0] + "," + lookup[i][1]] = true;


			const xi = lookup[i][0];
			const yi = lookup[i][1];

			const xf = lookup[i][2];
			const yf = lookup[i][3];

			const pw = xf - xi;
			const ph = yf - yi;


			lookup[i][0] = (lookup[i][0] + Math.floor(w / 2)) % w;
			lookup[i][1] = (lookup[i][1] + Math.floor(h / 2)) % h;

			// switch to using widths and heights
			// so that later operations don't have to compute this
			lookup[i][2] = pw;
			lookup[i][3] = ph;

			// move old lookup to cleanLookup
			cleanLookup.push(lookup[i]);
		}
	}

	// indicate done
	onprogress(1, 1, 1, 1);

	return cleanLookup;
}


fv.genSubdividedLookup = (xi, yi, xf, yf) => {

	const subdividedCoordXs = fv.subdivideCoord1d(xi, xf);
	const subdividedCoordYs = fv.subdivideCoord1d(yi, yf);

	if (subdividedCoordXs.length === 2 &&
		subdividedCoordYs.length === 2) {
		// this is just a single pixel so we return it
		return [[xi, yi, xf, yf]];
	}

	return fv.mergeCoordDims(subdividedCoordXs, subdividedCoordYs);

}

fv.mergeCoordDims = (subdividedCoordXs, subdividedCoordYs) => {
	const lookup = [];

	for (var i = 0; i < subdividedCoordXs.length - 1; i++) {
		for (var j = 0; j < subdividedCoordYs.length - 1; j++) {
			const xi = subdividedCoordXs[i];
			const xf = subdividedCoordXs[i + 1];

			const yi = subdividedCoordYs[j];
			const yf = subdividedCoordYs[j + 1]

			lookup.push([xi, yi, xf, yf]);
		}
	}

	// case 2x2
	if (lookup.length === 4) {
		// switch last and second element
		const tmp = lookup[1];
		lookup[1] = lookup[lookup.length - 1];
		lookup[lookup.length - 1] = tmp;
	}

	return lookup;
}

// ci = coord initial
// cf = coord final
fv.subdivideCoord1d = (ci, cf) => {
	const dist = cf - ci;

	// it's a single pixel can't divide further
	if (dist === 1) {
		return [ci, ci + 1];
	}

	// get second coordinate
	const ci2 = ci + Math.ceil(dist / 2);

	return [ci, ci2, cf];
}


