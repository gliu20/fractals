/** 
 * Coloring Function Library
 * @author github:gliu20
 */

const cf = {};


cf.rouge = (i,maxIterations) => {
  if (i === maxIterations) { return "#000000"; }
  return "hsl(0,100%,"+(i % (maxIterations / 5))+"%)";
}

cf.yellow = (i,maxIterations) => {
  if (i === maxIterations) { return "#000000"; }
  return "hsl("+(i % 360)+",100%,"+(i % (maxIterations / 5))+"%)";
}

cf.green = (i,maxIterations) => {
  if (i === maxIterations) { return "#000000"; }
  return "hsl("+(i * 10 % 360)+",100%,"+(i % (maxIterations / 5))+"%)";
}

cf.blueOrange = (i,maxIterations) => {
  if (i === maxIterations) { return "#000000"; }
  return "hsl("+(i * 0.9 % 360)+",100%,50%)";
}

cf.rainbow = (i,maxIterations) => {
  if (i === maxIterations) { return "#000000"; }
  return "hsl("+(i * 10 % 360)+",100%,50%)";
}
