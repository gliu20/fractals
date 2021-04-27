/**
 * Fast Math Solver
 * This code will attempt to get faster generalizations for Karatsuba's algorithm
 */

var fms = {};

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
      matrix[i + x][j + y] = 1;
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
