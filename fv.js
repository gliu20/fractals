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

	function calcFreq (periodLength) {
		// takes periodLength in ms; so need convert to sec
		periodLength = periodLength / 1000;

		// since periodLength is exactly 0, we get a NaN answer
		// if we continue with answer so we break out
		// and return Infinity
		if (periodLength === 0) {
			return Infinity;
		}
		
		return Math.floor((1 / periodLength) * 1000) / 1000;
	}

	function timeCallback (callback) {
		skippedInvocations = 0;

		start = performance.now();

		const shouldContinue = callback();

		end = performance.now();

		totalDuration = end - start;
		averageDuration = totalDuration;

		return shouldContinue;
	}
	
	function mergedCallback(callback, numInvocations) {
		return function () {
			for (var i = 0; i < numInvocations; i++) {
				const shouldContinue = callback();
				if (!shouldContinue) {
					return false;
				}
			}
			return true;
		}
	}

	(async function loop () {
		
		if (calcFreq(averageDuration) < fps) {
			// we're not meeting target fps
			// hence, we have to throttle by skipping invocations
			skippedInvocations++;
			
			// skip invocation and wait instead
			await fv._wait();
			
			// the previous end time is this frame's start time
			start = end;
			end = performance.now();

			// add duration of how long it took to display this frame
			// the totalDuration measures how long one invocation 
			// and all skipped invocations afterward took
			totalDuration += end - start;
			averageDuration = totalDuration / skippedInvocations;

			// cut mergeInvocate by 2
			// AIMD
			mergeInvocate = Math.floor(mergeInvocate / 2) + 1;
		}
		else {
			
			// we're meeting targets so we can run the callback
			// instead of waiting
			const shouldContinue = timeCallback(mergedCallback(callback, mergeInvocate));

			// if the callback wants us to stop there's no
			// point in continuing to throttle so we break 
			// out of the loop
			if (!shouldContinue) { return; }
			
			// AIMD for merge invocate
			// we're so much faster than the desired average fps so we group the callback together
			if (calcFreq(averageDuration) > fps * 5) {
				mergeInvocate++;
			}
		}

		
		infoCallback(averageDuration, calcFreq(averageDuration), mergeInvocate, skippedInvocations);

		// to avoid stack overflow by indirectly calling loop
		setTimeout(loop,0);
	})();
}


fv._wait = () => {
 return new Promise (function (resolve) {
  requestAnimationFrame(resolve);
 })
}

fv.draw = async (lookupFunc,lookupTable,ctx) => {
 let i = 0; 
 
 function iterate () {
  
  
  
  if (i < lookupTable.length) {
	  const xi = lookupTable[i][0];
	  const yi = lookupTable[i][1];

	  const xf = lookupTable[i][2];
	  const yf = lookupTable[i][3];

	  const w = xf - xi;
	  const h = yf - yi;

	  ctx.fillStyle = lookupFunc(xi,yi);
	  ctx.fillRect(xi,yi,w,h);
	  
	  i++;
  }
	 else {
		 // call this function to make sure we're doing stuff
		 // even when waiting
		 lookupFunc(Math.random(),Math.random());
	 }
	 
	 return true;
 }
 
 fv._throttleAt(40, iterate);
	
 return function () {
	 i = 0;
 }
 
}

fv.map = (val,inMin,inMax,outMin,outMax) => {
  const a = inMin,
       b = outMin,
       c = inMax,
       d = outMax,
       x = val;

  return (b - d) / (a - c) * (x - a) + b;
}


fv.genLookupTable = async (w,h,onprogress) => {
 const lookup = [[0,0,w,h]];
 const cleanLookup = [];
 
 const index = {};
 
 const iterationsX = Math.ceil(Math.log2(w));
 const iterationsY = Math.ceil(Math.log2(h));
 const maxIterations = Math.max(iterationsX,iterationsY)
 
 for (var i = 0; i < maxIterations; i++) {
  const currLength = lookup.length;
  for (var j = 0; j < currLength; j++) {
   
   // only if we didn't subdivide this then we subdivide this
   if (!index[lookup[j].join(",")]) {
    lookup.push(...fv.genSubdividedLookup(...lookup[j]))
    index[lookup[j].join(",")] = true;
   }
   
   if (i * j % 10000 === 0) {
    onprogress(j,currLength,i,maxIterations);
   }
   
   // throttle genLookupTable every couple steps
   if (i * j % 1000 === 0) {
    await fv._wait();
   }
   
   
  }
 }

 
 
 // clean up time
 for (var i = 0; i < lookup.length; i++) {
  
  if (i % 150000 === 0) {
   onprogress(i,lookup.length,1,1);
  }
  
  if (i % 50000 === 0) {
   await fv._wait();
  }
  
  
  if (!index.hasOwnProperty(`${lookup[i][0]},${lookup[i][1]}`)) {
   
   // mark as done
   index[`${lookup[i][0]},${lookup[i][1]}`] = true;
   
   // move old lookup to cleanLookup
   cleanLookup.push(lookup[i]);
  }
 }
 
 // indicate done
 onprogress(1,1,1,1);
 
 return cleanLookup;
}


fv.genSubdividedLookup = (xi,yi,xf,yf) => {
 
 const subdividedCoordXs = fv.subdivideCoord1d(xi,xf);
 const subdividedCoordYs = fv.subdivideCoord1d(yi,yf);
 
 if (subdividedCoordXs.length === 2 && 
     subdividedCoordYs.length === 2) {
  // this is just a single pixel so we return it
  return [[xi,yi,xf,yf]];
 }
 
 return fv.mergeCoordDims(subdividedCoordXs, subdividedCoordYs);
 
}

fv.mergeCoordDims = (subdividedCoordXs, subdividedCoordYs) => {
 const lookup = [];
 
 for (var i = 0; i < subdividedCoordXs.length - 1; i++) {
  for (var j = 0; j < subdividedCoordYs.length - 1; j++) {
   const xi = subdividedCoordXs[i];
   const xf = subdividedCoordXs[i+1];
   
   const yi = subdividedCoordYs[j];
   const yf = subdividedCoordYs[j+1]
   
   lookup.push([xi,yi,xf,yf]);
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
fv.subdivideCoord1d = (ci,cf) => {
 const dist = cf - ci;
 
 // it's a single pixel can't divide further
 if (dist === 1) {
  return [ci, ci+1];
 }
 
 // get second coordinate
 const ci2 = ci + Math.ceil(dist / 2);
 
 return [ci, ci2, cf];
}


