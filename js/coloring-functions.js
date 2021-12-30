/** 
 * Coloring Function Library
 * @author github:gliu20
 */

const cf = {};


cf.rouge = (i,maxIterations, coloring) => {
  const adjustedI = i * coloring.colorScale + coloring.colorOffset;
  if (i === maxIterations) { return "#000000"; }
  
  let colorValue = adjustedI % 400 / 2;
  if (colorValue > 100) {
    colorValue = 200 - colorValue;
  }
  
  return "hsl(0,100%,"+colorValue+"%)";
}

cf.grayScale = (i,maxIterations, coloring) => {
  const adjustedI = i * coloring.colorScale + coloring.colorOffset;
  if (i === maxIterations) { return "#000000"; }
  
  let colorValue = adjustedI % 400 / 2;
  if (colorValue > 100) {
    colorValue = 200 - colorValue;
  }
  return "hsl(0,0%,"+colorValue+"%)";
}

cf.blueOrange = (i,maxIterations, coloring) => {
  
  if (i === maxIterations) { return "#000000"; }

  const adjustedI = i * coloring.colorScale + coloring.colorOffset;

  let colorValue = adjustedI % 400 / 2;
  
  // make blue orange circular
  if (colorValue > 100) {
    colorValue = 200 - colorValue;
  }

  const colorStop1 = [6, 12, 102];
  const colorStop2 = [255, 255, 255];
  const colorStop3 = [218, 106, 8];

  const interpolate = (val1, val2, extent) => (val1 * (1 - extent) + val2 * extent)

  const r = interpolate(colorStop1[0], colorStop2[0], colorValue * 2 / 100) * (colorValue <= 50) +
            interpolate(colorStop2[0], colorStop3[0], colorValue * 2 / 100 - 1) * (colorValue > 50);
  const g = interpolate(colorStop1[1], colorStop2[1], colorValue * 2 / 100) * (colorValue <= 50) +
            interpolate(colorStop2[1], colorStop3[1], colorValue * 2 / 100 - 1) * (colorValue > 50);
  const b = interpolate(colorStop1[2], colorStop2[2], colorValue * 2 / 100) * (colorValue <= 50) +
            interpolate(colorStop2[2], colorStop3[2], colorValue * 2 / 100 - 1) * (colorValue > 50);

  return "rgb("+Math.floor(r)+","+Math.floor(g)+","+Math.floor(b)+")";
}

cf.rainbow = (i,maxIterations, coloring) => {
  const adjustedI = i * coloring.colorScale + coloring.colorOffset;
  if (i === maxIterations) { return "#000000"; }
  
  return "hsl("+(adjustedI % 360)+",100%,50%)";
}
