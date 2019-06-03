# Fractals
Generating images of fractals directly in the browser. Gpu-accelerated via Tensorflow.js (which uses WebGL).
## Demo
 * [Mandelbrot Set Generator](https://gliu20.github.io/fractals/mandelbrot.html)
 * [Julia Set Generator](https://gliu20.github.io/fractals/julia.html)

### Limitations
Do not view on a mobile device. Zooming controls will not work and there may be performance issues.
Also, due to the limitations of the hardware / software, if you see bars or a solid color, you need to zoom out. 
 
### Notes
You'll need to scroll with your mouse in order to zoom in and out. 
In addition, if you set the x and y coordinates, you need to click on gen high res image in order for changes to update.
Zoom indicates the size of the view window; if it's small, then you see a small part of the fractal, and if it's big you see more of the fractal. This number is usually between 0 and 1.5.
 
### Here are some other coordinates to try in the Mandelbrot set
 * x: -0.761574           y: -0.0847596         zoom: 0.0000192
 * x: -1.04180483110546   y: 0.346342664848392  zoom: 0.008
 * x: -0.751095959125087  y: -0.116817186889238 zoom: 0.009
 * x: -0.812223315621338  y: -0.185453926110785 zoom: 0.0008
 * x: -0.5659231995767843 y: 0.6389989720095453 zoom: 0.000194

## Examples
![](https://gliu20.github.io/fractals/img/download.png)
![](https://gliu20.github.io/fractals/img/download%20(1).png)
![](https://gliu20.github.io/fractals/img/download%20(2).png)
![](https://gliu20.github.io/fractals/img/download%20(3).png)
![](https://gliu20.github.io/fractals/img/download%20(4).png)
![](https://gliu20.github.io/fractals/img/download%20(5).png)
![](https://gliu20.github.io/fractals/img/download%20(6).png)
![](https://gliu20.github.io/fractals/img/download%20(7).png)
![](https://gliu20.github.io/fractals/img/download%20(8).png)
![](https://gliu20.github.io/fractals/img/download%20(9).png)
![](https://gliu20.github.io/fractals/img/download%20(10).png)
![](https://gliu20.github.io/fractals/img/download%20(11).png)
![](https://gliu20.github.io/fractals/img/download%20(12).png)
![](https://gliu20.github.io/fractals/img/download%20(13).png)
![](https://gliu20.github.io/fractals/img/download%20(14).png)
![](https://gliu20.github.io/fractals/img/download%20(15).png)
![](https://gliu20.github.io/fractals/img/download%20(16).png)
![](https://gliu20.github.io/fractals/img/download%20(17).png)
![](https://gliu20.github.io/fractals/img/download%20(18).png)

## Limitations
 * Currently, only quadratic complex equations are supported
 * Better coloring functions need to be developed
 * Zooming in too much results in distorted images or horizontal bars
