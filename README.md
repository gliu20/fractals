<meta http-equiv="refresh" content="0; URL='https://gliu20.github.io/projects/fractals'" />


# Fractals
 A quick WebAssembly-based fractal viewer for the Mandelbrot and Julia sets built with native web technologies 
 
- Link to demo: https://gliu20.github.io/fractals/
- Link to project details: https://gliu20.github.io/projects/fractals/

## Key features
- **Progressive Refinement** - The viewer starts with a pixelated image and iteratively increases the resolution of the output. This UX consideration gives the user immediate feedback
- **Gesture support** - Uses touch APIs to support pinching in and out to zoom and dragging to move the image around
- **Adaptive throttling** - adapts to your computer's hardware and/or workload to maintain responsiveness while rendering as many pixels as it can
- **Performance** - Key code is run on WebAssembly for better performance, plus optimizations to escape iterations early to avoid doing unnecessary work 

## Limitations
- Arbitrary precision arithmetic is not yet supported 

## Project structure
 - `c/dist` - wasm binaries for computing fractal calculations
 - `c/src` - c source code for fractal computations
 - `js/` - javascript for the fractal website

## Key files
 - `cf.js` - collection of hand crafted functions to programatically determine the color of each pixel
 - `fv.js` - responsible for generating the lookup tables for progressive refinement
 - `vb.js` - utilities for calculating viewboxes after zooming, panning, etc
 - `vc.js` - utilities for making the viewer interactive, aka handling touch and mouse inputs, changing fractals and colouring functions, etc.
 - `index.js` - glue code

## Project details and technical decisions
- See project details link under [#fractals](#fractals)
