/** 
 * View Box Library
 * @author github:gliu20
 */
const vb = {};


// why do like this? the purpose is so if 
// we're using native BigInt, we can easily switch
vb._zero = 0;
vb._two = 2;

vb._avg = (a, b) => {
  return (a + b) / vb._two;
}

vb.getTouchCoords = (event) => {
  
  const ele = event.target;
  const bounds = ele.getBoundingClientRect();
  
  const touchX1 = ((event.touches && event.touches[0] && event.touches[0].clientX || 0) 
                    - bounds.left) / ele.clientWidth * ele.width;
  const touchY1 = ((event.touches && event.touches[0] && event.touches[0].clientY || 0) 
                    - bounds.top) / ele.clientHeight * ele.height;
  const touchX2 = ((event.touches && event.touches[1] && event.touches[1].clientX || 0) 
                    - bounds.left) / ele.clientWidth * ele.width;
  const touchY2 = ((event.touches && event.touches[1] && event.touches[1].clientY || 0) 
                    - bounds.top) / ele.clientHeight * ele.height;
  
  return { touchX1, touchY1, touchX2, touchY2 };
}

vb.getTouchDist = (event) => {
  const { touchX1, touchY1, touchX2, touchY2 } = vb.getTouchCoords(event);
  return Math.hypot(touchX2 - touchX1, touchY2 - touchY1);
}

vb.getTouchCenter = (event) => {
  const { touchX1, touchY1, touchX2, touchY2 } = vb.getTouchCoords(event);
  return {
    centerX: vb._avg(touchX1, touchX2),
    centerY: vb._avg(touchY1, touchY2)
  };
}

vb.getMouseCoords = (event) => {
  const ele = event.target;
  const bounds = ele.getBoundingClientRect();
  
  const coords = {
    x: (event.clientX || event.touches && event.touches[0] && event.touches[0].clientX || 0) - bounds.left,
    y: (event.clientY || event.touches && event.touches[0] && event.touches[0].clientY || 0) - bounds.top
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

vb.getHalfSpan = (viewbox) => {
  const spanX = (viewbox[1] - viewbox[0]) / vb._two;
  const spanY = (viewbox[3] - viewbox[2]) / vb._two;
  
  return { spanX, spanY };
}

vb.calcViewbox = (centerX, centerY, spanX, spanY) => ([
  centerX - spanX,
  centerX + spanX,
  centerY - spanY,
  centerY + spanY
])

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
  const { canvasX: zoomedCanvasX, canvasY: zoomedCanvasY } = vb.mouseCoordsToCanvasCoords(mouseX, mouseY, viewboxWithoutMouseOffset, width, height);
  
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

vb.calcCenterAfterMove = (anchorCenterX, anchorCenterY, anchorCanvasX, anchorCanvasY, canvasX, canvasY) => {
  const movedCenterX = anchorCenterX - (canvasX - anchorCanvasX);
  const movedCenterY = anchorCenterY - (canvasY - anchorCanvasY);
  
  return { movedCenterX, movedCenterY };
}

vb.calcViewboxAfterMove = (event, viewbox, width, height, anchorMouseX, anchorMouseY, anchorViewbox, anchorCanvasX, anchorCanvasY) => {
  const { mouseX, mouseY, canvasX, canvasY } = vb.getCanvasAndMouseCoords(event, anchorViewbox, width, height);
  const { centerX: anchorCenterX, centerY: anchorCenterY } = vb.getCenter(anchorViewbox);
  
  const { movedCenterX, movedCenterY } = vb.calcCenterAfterMove(anchorCenterX, anchorCenterY, anchorCanvasX, anchorCanvasY, canvasX, canvasY);
  const { spanX, spanY } = vb.getHalfSpan(anchorViewbox);
  
  return vb.calcViewbox(movedCenterX, movedCenterY, spanX, spanY);
}
