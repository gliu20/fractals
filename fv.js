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

fv.pixelLookup = ({callback,fractalFunc,viewBox,params}) => {
  // params is for julia set
  

}
