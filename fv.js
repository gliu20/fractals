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

fv.pixelLookup = ({callback,lookupFunc,viewModel}) => {
  // params is for julia set
  
 
}

/*
perf optimizations
var ctx = canvas.getContext('2d', { alpha: false });



  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  
  
*/
