/**
 *  Quick Fractal Math library
 *  @author github:gliu20
 */

const qfm = {}

qfm.julia = (x,y,cx,cy,maxIterations) => {
  let z = {
    real: x, 
    imag: y 
  }
  
  const c = {
    real: cx,
    imag: cy
  };
  
  for (let i = 0; i < maxIterations; i++) {
    if (qfm.complexHalfNorm(z) > 16) {
      return i;
    }
      
    z = qfm.zSquaredPlusC(z,c);
  }
  
  return maxIterations;
}


qfm.mandelbrot = (x,y,maxIterations) => {
  let z = {
    real: x - x, // same thing as 0, but may be slower
    imag: y - y // purpose is to be type flexible
  }
  
  const c = {
    real:x,
    imag:y
  }
  
  for (let i = 0; i < maxIterations; i++) {
    if (qfm.complexHalfNorm(z) > 16) {
      return i;
    }
      
    z = qfm.zSquaredPlusC(z,c);
  }
  
  return maxIterations;
}

qfm.zSquaredPlusC = (zComplex,cComplex) => {
  const zSquared = qfm.complexSquare(zComplex);
  
  return qfm.complexAdd(zSquared,cComplex);
}

qfm.complexSquare = ({real,imag}) => {
  const sum = real + imag;
  const diff = real - imag;
  const prod = real * imag;
  
  return {
    real: sum * diff,
    imag: prod + prod
  }
}

qfm.complexAdd = (complex1,complex2) => {
  const {real:real1,imag:imag1} = complex1;
  const {real:real2,imag:imag2} = complex2;
  
  return {
    real: real1 + real2,
    imag: imag1 + imag2
  };
}

qfm.complexMult = (complex1,complex2) => {
  const {real:real1,imag:imag1} = complex1;
  const {real:real2,imag:imag2} = complex2;
  
  const realProd = real1 * real2;
  const imagProd = imag1 * imag2;
  
  const sumProd = (real1 + imag1) * (real2 + imag2);
  
  return {
    real: realProd - imagProd,
    imag: sumProd - realProd - imagProd
  }
}

qfm.complexHalfNorm = ({real,imag}) => {
  return real * real + imag * imag;
}
