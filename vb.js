const vb = {};


// why do like this? the purpose is so if 
// we're using native BigInt, we can easily switch
vb._zero = 0;
vb._two = 2;

vb._avg = (a, b) => {
	return (a + b) / vb._two;
}

vb.getMouseCoords = (event) => {
  const ele = event.target;
  const bounds = ele.getBoundingClientRect();
  
  const coords = {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top
  }
  
  // scales position to match canvas size
  coords.x = coords.x / ele.clientWidth * ele.width;
	coords.y = coords.y / ele.clientHeight * ele.height;
  
  return coords;
}

vb.mouseCoordsToCanvasCoords = (mouseX, mouseY, viewbox, width, height) => {
  const canvasX = fv.map(mouseX, vb._zero, width, viewbox[0], viewbox[1]);
  const canvasY = fv.map(mouseY, vb._zero, height, viewbox[2], viewbox[3]);
  
  return { canvasX, canvasY };
}

vb.getCanvasAndMouseCoords = (event, viewbox, width, height) => {
  const { x: mouseX, y: mouseY } = vb.getMouseCoords(event);
  const { canvasX, canvasY } = vb.mouseCoordsToCanvasCoords(mouseX, mouseY, viewbox, width, height);

  return { mouseX, mouseY, canvasX, canvasY };
}

vb.getCenter = (viewbox) => {
  const centerX = vb._avg(viewbox[0], viewbox[1]);
  const centerY = vb._avg(viewbox[2], viewbox[3]);
  
  return { centerX, centerY };
}

vb.calcViewbox = (centerX, centerY, spanX, spanY) => ([
  centerX - spanX,
  centerX + spanX,
  centerY - spanY,
  centerY + spanY
])

vb.getHalfSpan = (viewbox) => {
  const spanX = (viewbox[1] - viewbox[0]) / vb._two;
  const spanY = (viewbox[3] - viewbox[2]) / vb._two;
  
  return { spanX, spanY };
}

vb.calcZoomMultiplier = (event) => {
  const scrollDelta = Math.min(Math.max(event.deltaY, -1), 1);
  const multiplier = (1 + (scrollDelta * .2))
  
  return multiplier;
}

vb.calcHalfSpanAfterZoom = (spanX, spanY, zoomMultiplier) => {
  const zoomedSpanX = spanX * zoomMultiplier;
  const zoomedSpanY = spanY * zoomMultiplier;
  
  return { zoomedSpanX, zoomedSpanY };
}

vb.calcCenterAfterZoom = (mouseX, mouseY, canvasX, canvasY, centerX, centerY, zoomedSpanX, zoomedSpanY, viewbox, width, height) => {
  const viewboxWithoutMouseOffset = vb.calcViewbox(centerX, centerY, zoomedSpanX, zoomedSpanY);
  const { canvasX: zoomedCanvasX, canvasY: zoomedCanvasY } = vb.mouseCoordsToCanvasCoords(mouseX, mouseY, viewbox, width, height);
  
  const zoomedCenterX = centerX + (canvasX - zoomedCanvasX);
	const zoomedCenterY = centerY + (canvasY - zoomedCanvasY);
  
  return {
    zoomedCenterX,
    zoomedCenterY
  };
}

vb.calcViewboxAfterZoom = (event, viewbox, width, height) => {
  const { mouseX, mouseY, canvasX, canvasY } = vb.getCanvasAndMouseCoords(event, viewbox, width, height);
  const { spanX, spanY } = vb.getHalfSpan(viewbox);
  const { centerX, centerY } = vb.getCenter(viewbox);
  
  const zoomMultiplier = vb.calcZoomMultiplier(event);
  const { zoomedSpanX, zoomedSpanY } = vb.calcHalfSpanAfterZoom(spanX, spanY, zoomMultiplier);
  const { zoomedCenterX, zoomedCenterY } = vb.calcCenterAfterZoom(
    mouseX, mouseY, canvasX, canvasY, 
    centerX, centerY, zoomedSpanX, zoomedSpanY, 
    viewbox, width, height
  );
  
  return vb.calcViewbox(zoomedCenterX, zoomedCenterY, zoomedSpanX, zoomedSpanY);
}
