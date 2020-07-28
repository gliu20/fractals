/** 
 * Fractal Viewer Library
 * @author github:gliu20
 */
 
const fv = {};

fv._wait = () => {
 return new Promise (function (resolve) {
  requestAnimationFrame(resolve);
 })
}

fv.draw = async (lookupFunc,lookupTable,ctx,canceller) => {
 for (var i = 0; i < lookupTable.length; i++) {
  const xi = lookupTable[i][0];
  const yi = lookupTable[i][1];
  
  const xf = lookupTable[i][2];
  const yf = lookupTable[i][3];
  
  const w = xf - xi;
  const h = yf - yi;
  
  ctx.fillStyle = lookupFunc(xi,yi);
  ctx.fillRect(xi,yi,w,h);
  
  if (canceller.cancel) { break; }
  if (i % 100 === 50) { await fv._wait(); }
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


fv.genLookupTable = async (w,h) => {
 const lookup = [[0,0,w,h]];
 const cleanLookup = [];
 
 const index = {};
 
 const iterationsX = Math.ceil(Math.log2(w));
 const iterationsY = Math.ceil(Math.log2(h));
 const maxIterations = Math.max(iterationsX,iterationsY)
 
 for (var i = 0; i < maxIterations; i++) {
  const currLength = lookup.length;
  for (var j = 0; j < currLength; j++) {
   lookup.push(...fv.genSubdividedLookup(...lookup[j]))
   
   // throttle genLookupTable every 100 steps
   if (i * j % 1000 === 0) {
    await fv._wait();
   }
  }
 }
 
 // clean up time
 for (var i = 0; i < lookup.length; i++) {
  if (!index.hasOwnProperty(`${lookup[i][0]},${lookup[i][1]}`)) {
   // mark as done
   index[`${lookup[i][0]},${lookup[i][1]}`] = true;
   
   // move old lookup to cleanLookup
   cleanLookup.push(lookup[i]);
  }
 }
 
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

/*
perf optimizations
var ctx = canvas.getContext('2d', { alpha: false });



  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  
  
*/
