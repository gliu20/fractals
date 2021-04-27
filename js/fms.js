/**
 * Fast Math Solver
 * This code will attempt to get faster generalizations for Karatsuba's algorithm
 */

var fms = {};

fms.sum = (arr) => arr.flat().reduce((a,b) => a + b); 

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

fms.fillRect = (matrix,x,y,w,h,v) => {
  for (var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {
      matrix[i + y][j + x] = v || 1;
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

fms.mul = (a, b) => {
  const h = a.length;
  const w = a[0].length;
  const arr = [];

  for (var i = 0; i < h; i++) {
    arr.push([]);
    for (var j = 0; j < w; j++) {
      arr[i][j] = a[i][j] * b[i][j];
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
      targetScalar: fms.sum(diagonal),
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
            shape: fms.fillRect(fms.createMatrix(n,n),x,y,w,h),
            history: [{type:"seed",shape:[x,y,w,h]}]
          })
        }
      }
    }
  }
  return enumeratedShapes;
}

fms.genFitness = (n) => {
  const targets = fms.genTargets(n);
  for (let target of targets) {
    target.fitness = fms.sub(
      target.diagonal,
      fms.fillRect(
        fms.createMatrix(n,n),0,0,n,n
      )
    );
  }
  return targets;
}

fms.evalFitnessPartial = (matrix,fitness) => {
  const exactMatchReward = Math.exp(fms.sum(fms.mul(matrix,fitness)));
  const meanSquaredError = fms.mul(fms.sub(matrix,fitness),fms.sub(matrix,fitness));

  return Math.exp(exactMatchReward + meanSquaredError);
}

fms.evalFitness = (matrix,targetFitness) => {
  let fitness = 0;
  for (let target of targetFitness) {
    fitness += Math.floor(fms.evalFitnessPartial(matrix,target.fitness));
  }
  return fitness;
}

fms.genShapeCandidates = (shapeCandidates,iterations) => {
  const len = shapeCandidates.length;
  for (let i = 0; i < iterations; i++) {
    const shape1 = shapeCandidates[Math.floor(Math.random() * len)];
    const shape2 = shapeCandidates[Math.floor(Math.random() * len)];

    if (Math.floor(Math.random() * 2)) {
      shapeCandidates.push({
        shape: fms.add(shape1.shape, shape2.shape),
        history: [...shape1.history, {type:"add",shape1,shape2}]
      });
    }
    else {
      shapeCandidates.push({
        shape: fms.sub(shape1.shape, shape2.shape),
        history: [...shape1.history, {type:"sub",shape1,shape2}]
      });
    }
  }
}

fms.scoreCandidates = (shapeCandidates,targetFitness) => {
  for (let candidate of shapeCandidates) {
    candidate.fitnessScore = fms.evalFitness(candidate.shape, targetFitness);
  }
}

fms.pruneCandidates = (shapeCandidates, threshold) => {
  for (let i = 0; i < shapeCandidates.length; i++) {
    const candidate = shapeCandidates[i];
    if (Math.floor(Math.random() * (candidate.fitnessScore + threshold)) === 0) {
      // delete shape
      shapeCandidates.splice(i,1);
      i--;
    }
  }
}

fms.solve = (n) => {
  const targetFitness = fms.genFitness(n);
  const enumeratedShapes = fms.enumerateShapes(n);
  const shapeCandidates = [...enumeratedShapes];

  fms.genShapeCandidates(shapeCandidates,20);
  console.log({shapeCandidates});
  fms.scoreCandidates(shapeCandidates,targetFitness);
  fms.pruneCandidates(shapeCandidates, 10);

  console.log({targetFitness, shapeCandidates});
} 
