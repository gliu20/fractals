/** 
 * Fractal Viewer Library
 * @author github:gliu20
 */
 
const fv = {};

fv.map = (val,inMin,inMax,outMin,outMax) => {
  const a = inMin,
       b = outMin,
       c = inMax,
       d = outMax,
       x = val;

  return (b - d) / (a - c) * (x - a) + b;
}


fv.genLookupTable = (w,h) => {
 let lookup = [[0,0,w,h]];
 
 const iterationsX = Math.ceil(Math.log2(w));
 const iterationsY = Math.ceil(Math.log2(h));
 const maxIterations = Math.max(iterationsX,iterationsY)
 
 for (var i = 0; i < maxIterations; i++) {
  const currLength = lookup.length;
  for (var j = 0; j < currLength; j++) {
   lookup.push(...fv.genSubdividedLookup(...lookup[j]))
  }
 }
 return lookup;
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
  lookup[lookup.length - 1] = lookup[1];
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
 const ci2 = Math.floor(dist / 2);
 
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
