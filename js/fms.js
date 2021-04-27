/**
 * Fast Math Solver
 * This code will attempt to get faster generalizations for Karatsuba's algorithm
 */

var fms = {};

fms.sum = (...rest) => rest.reduce((a,b) => a + b); 

fms.createDiagonalMatrix = (s,d) => {
  const w = s;
  const h = s;
  const arr = [];
  for (var i = 0; i < h; i++) {
    arr.push([]);
    for (var j = 0; j < w; j++) {
      arr[i][j] = ((i + j) === d) | 0;
    }
  }
  return arr;
}

fms.createMatrix = (w,h) => {
  const arr = [];
  for (var i = 0; i < h; i++) {
    arr.push([]);
    for (var j = 0; j < w; j++) {
      arr[i][j] = 0;
    }
  }
  return arr;
}

fms.fillRect = (matrix,x,y,w,h) => {
  for (var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {
      matrix[i + y][j + x] = 1;
    }
  }
  return matrix;
}

fms.add = (a, b) => {
  const h = a.length;
  const w = a[0].length;
  const arr = [];

  for (var i = 0; i < h; i++) {
    arr.push([]);
    for (var j = 0; j < w; j++) {
      arr[i][j] = a[i][j] + b[i][j];
    }
  }
  return arr;
}

fms.sub = (a, b) => {
  const h = a.length;
  const w = a[0].length;
  const arr = [];

  for (var i = 0; i < h; i++) {
    arr.push([]);
    for (var j = 0; j < w; j++) {
      arr[i][j] = a[i][j] - b[i][j];
    }
  }
  return arr;
}

fms.genTargets = (n) => {
  const targets = [];
  for (let i = 0; i < (2 * n - 1); i++) {
    const diagonal = fms.createDiagonalMatrix(n,i);
    targets.push({
      diagonal: diagonal,
      targetScalar: fms.sum(...diagonal.flat()),
//      reachedByShapes: {}
    });
  }
  return targets;
}

fms.enumerateShapes = (n) => {
  const enumeratedShapes = [];
  for (let x = 0; x < n; x++) {
    for (let w = n - x; w >= 1; w--) {
      for (let y = 0; y < n; y++) {
        for (let h = n - y; h >= 1; h--) {
          enumeratedShapes.push({
            shape: [x,y,w,h],
//            reachesTargets: {}
          })
        }
      }
    }
  }
  return enumeratedShapes;
}

fms.solve = (n) => {
  const targets = fms.genTargets(n);
  const enumeratedShapes = fms.enumerateShapes(n);

  

  console.log({targets, enumeratedShapes});
} 
