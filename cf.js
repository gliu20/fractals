/** 
 * Coloring Function Library
 * @author github:gliu20
 */

const cf = {};


cf.rouge = (i,maxIterations, coloring) => {
  const adjustedI = i * coloring.colorScale + coloring.offset;
  if (i === maxIterations) { return "#000000"; }
  
  return "hsl(0,100%,"+(adjustedI % 100)+"%)";
}

cf.grayScale = (i,maxIterations, coloring) => {
  const adjustedI = i * coloring.colorScale + coloring.offset;
  if (i === maxIterations) { return "#000000"; }
  
  return "hsl(0,0%,"+(adjustedI % 100)+"%)";
}

cf.blueOrange = (i,maxIterations) => {
  const adjustedI = i * coloring.colorScale + coloring.offset;
  const hue = adjustedI % 160;
  const brightness = 4 * adjustedI ** 2 / 160 ** 2 - 4 * adjustedI / 160 + 1;
  if (i === maxIterations) { return "#000000"; }
  
  return "hsl("+(hue + 40)+",100%,"+Math.floor(brightness * 100)+"%)";
}

cf.rainbow = (i,maxIterations) => {
  const adjustedI = i * coloring.colorScale + coloring.offset;
  if (i === maxIterations) { return "#000000"; }
  
  return "hsl("+(adjustedI % 360)+",100%,50%)";
}
