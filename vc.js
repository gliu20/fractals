const vc = {};

vc._zero = 0;

vc.init = async (canvas, onProgress) => {
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
      lookupFunction: () => {},
      lookupColoring: () => {},
    },
    misc: { },
    modifiers: {
      refreshView: () => {},
      resetThrottle: () => {},
      resetViewbox: () => { view.viewbox = [-1, 1, -1, 1] },
    }
  }
  
  view.lookup.lookupTable = await fv.genLookupTable(view.dimensions.width, view.dimensions.height, onProgress);
  
  return view;
}

vc.makeMandelbrot = (view) => {
  view.misc.maxIterations = 1000;
  
  view.lookup.lookupFunction = (x, y) => {
    const xi = fv.map(x, vc._zero, view.dimensions.width, view.dimensions.viewbox[0], view.dimensions.viewbox[1]);
    const yi = fv.map(y, vc._zero, view.dimensions.height, view.dimensions.viewbox[2], view.dimensions.viewbox[3]);
    const i = qfm.mandelbrot(xi, yi, view.misc.maxIterations);

    return view.lookup.lookupColoring(i, view.misc.maxIterations);
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
