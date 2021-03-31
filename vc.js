const vc = {};

vc._zero = 0;

vc.init = (canvas) => {
  const view = {
    canvas: canvas,
    ctx: canvas.getContext("2d", { alpha: false }),
    dimensions: {
      width: canvas.width,
      height: canvas.height,
      viewbox: [-1, 1, -1, 1],
    },
    lookup: {
      lookupTable: [], 
      lookupFunctions: [],
      lookupIndex: 0,
      lookupFunction: () => {},
      lookupColoring: () => {},
    },
    coloring: {
      coloringFunctions: [
        cf.rouge,
        cf.yellow,
        cf.green,
        cf.blueOrange,
        cf.rainbow
      ],
      coloringIndex: 0,
      colorScale: 1,
      colorOffset: 0,
    },
    misc: { },
    modifiers: {
      refreshView: () => {},
      resetThrottle: () => {},
      resetViewbox: () => { 
        view.dimensions.viewbox = [-1, 1, -1, 1];
        view.modifiers.refreshView();
      },
    }
  }
  
  return view;
}

vc.makeMandelbrot = (view) => {
  view.misc.maxIterations = 1000;
  
  view.lookup.lookupIndex = -1 + view.lookup.lookupFunctions.push((x, y) => {
    const i = qfm.mandelbrot(x, y, view.misc.maxIterations);
    return view.lookup.lookupColoring(i, view.misc.maxIterations);
  });
  
  view.modifiers.changeMaxIterations = (maxIterations) => {
    view.misc.maxIterations = maxIterations;
    view.modifiers.refreshView();
  }
}

vc.makeJulia = (view) => {
  view.misc.maxIterations = 1000;
  view.misc.cx = -1;
  view.misc.cy = 0;
  
  view.lookup.lookupIndex = -1 + view.lookup.lookupFunctions.push((x, y) => {
    const i = qfm.julia(x, y, view.misc.cx, view.misc.cy, view.misc.maxIterations);
    return view.lookup.lookupColoring(i, view.misc.maxIterations);
  });
  
  view.modifiers.changeMaxIterations = (maxIterations) => {
    view.misc.maxIterations = maxIterations;
    view.modifiers.refreshView();
  }
  
  view.modifiers.changeComplex = (cx, cy) => {
    view.misc.cx = cx;
    view.misc.cy = cy;
    view.modifiers.refreshView();
  }
}

vc.makeZoomable = (canvas, view) => {
  canvas.onwheel = async (event) => {
    view.dimensions.viewbox = vb.calcViewboxAfterZoom(event, view.dimensions.viewbox, view.dimensions.width, view.dimensions.height);
    view.modifiers.refreshView();
  }
}

vc.makeMovable = (canvas, view) => {
  canvas.onmousedown = (event) => {
    const { 
      mouseX: anchorMouseX, mouseY: anchorMouseY,
      canvasX: anchorCanvasX, canvasY: anchorCanvasY
    } = vb.getCanvasAndMouseCoords(
      event, view.dimensions.viewbox, 
      view.dimensions.width, view.dimensions.height
    );
			
    const anchorViewbox = view.dimensions.viewbox.slice(0);
			
    canvas.onmousemove = (event) => {
      view.dimensions.viewbox = vb.calcViewboxAfterMove(
        event, view.dimensions.viewbox, view.dimensions.width, view.dimensions.height, 
        anchorMouseX, anchorMouseY, anchorViewbox, anchorCanvasX, anchorCanvasY
      );
      
      view.modifiers.refreshView();
    }
  }

  canvas.onmouseleave = canvas.onmouseup = () => { canvas.onmousemove = null; }
}

vc.makeInteractive = (view) => {
  vc.makeZoomable(view.canvas, view);
  vc.makeMovable(view.canvas, view);
}

vc.makeColoring = (view) => {
  view.lookup.lookupColoring = (...args) => { 
    return view.coloring.coloringFunctions[view.coloring.coloringIndex](...args, view.coloring); 
  };
  
  view.modifiers.changeColoring = (coloringIndex) => {
    view.coloring.coloringIndex = coloringIndex;
    view.modifiers.refreshView();
  }
  view.modifiers.changeColorScale = (colorScale) => {
    view.coloring.colorScale = colorScale;
    view.modifiers.refreshView();
  }
  view.modifiers.changeColorOffset = (colorOffset) => {
    view.coloring.colorOffset = colorOffset;
    view.modifiers.refreshView();
  }
  view.modifiers.switchColoring = () => {
    view.modifiers.changeColoring((view.coloring.coloringIndex + 1) % view.coloring.coloringFunctions.length);
    view.modifiers.refreshView();
  }
}

vc.makeLookup = async (view, onProgress) => {
  view.lookup.lookupFunction = (x,y) => {
    const xi = fv.map(x, vc._zero, view.dimensions.width, view.dimensions.viewbox[0], view.dimensions.viewbox[1]);
    const yi = fv.map(y, vc._zero, view.dimensions.height, view.dimensions.viewbox[2], view.dimensions.viewbox[3]);
    
    return view.lookup.lookupFunctions[view.lookup.lookupIndex](xi, yi);
  }
  
  view.modifiers.changeLookup = (lookupIndex) => {
    view.lookup.lookupIndex = lookupIndex;
    view.modifiers.refreshView();
  }
  
  view.lookup.lookupTable = await fv.genLookupTable(view.dimensions.width, view.dimensions.height, onProgress);
}

vc.startView = async (view, onInfo) => {
  const drawObj = await fv.draw(view.lookup.lookupFunction, view.lookup.lookupTable, view.ctx, onInfo);

  view.modifiers.refreshView = drawObj.refreshView;
  view.modifiers.resetThrottle = drawObj.resetThrottle;

  window.onfocus = view.modifiers.resetThrottle;
}
