function optimComplexSquare ({real,imag}) {
  const sum = real + imag;
  const diff = real - imag;
  
  return {
    real: sum * diff,
    imag: real * imag * 2
  }
}

function optimComplexMult (complex1,complex2) {
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
