#include <math.h>
#include <emscripten.h>

#define DEBUG 0
#define ESCAPE_RADIUS 4
#define MATCH_THRESHOLD 1e-77

#define TYPE_MANDELBROT 0
#define TYPE_JULIA 1

#define DISABLE_SMOOTHING 0
#define ENABLE_SMOOTHING 1


/*double exp(double x) {
    return (362880+x*(362880+x*(181440+x*(60480+x*(15120+x*(3024+x*(504+x*(72+x*(9+x)))))))))*2.75573192e-6;
}*/


double complexHalfNorm (double real, double imag) {
    return real * real + imag * imag;
}

void complexMult (double real1, double imag1, 
    double real2, double imag2, 
    double *real, double *imag) {
    
    const double realProd = real1 * real2;
    const double imagProd = imag1 * imag2;

    const double sumProd = (real1 + imag1) * (real2 + imag2);

    *real = realProd - imagProd;
    *imag = sumProd - realProd - imagProd;
}

void complexAdd (double real1, double imag1, 
    double real2, double imag2, 
    double *real, double *imag) {

    *real = real1 + real2;
    *imag = imag1 + imag2;
}


void complexSquare(double real1, double imag1,
    double *real, double *imag) {

    const double sum = real1 + imag1;
    const double diff = real1 - imag1;
    const double prod = real1 * imag1;

    *real = sum * diff;
    *imag = prod + prod;
}

void zSquaredPlusC (double zReal, double zImag,
    double cReal, double cImag,
    double *real, double *imag) {

    complexSquare(zReal, zImag, real, imag);
    complexAdd(*real, *imag, cReal, cImag, real, imag);
}

double fractalSetSmooth (double x, double y, double cx, double cy, int maxIterations, int type) {
    double zReal = type == TYPE_MANDELBROT ? 0 : x;
    double zImag = type == TYPE_MANDELBROT ? 0 : y;
    double cReal = type == TYPE_MANDELBROT ? x : cx;
    double cImag = type == TYPE_MANDELBROT ? y : cy;
    
    double halfNorm = complexHalfNorm(zReal, zImag);
    double smoothValue = exp( - halfNorm);

    double zRealOld = zReal;
    double zImagOld = zImag;

    for (int i = 0; i < maxIterations; i++) {
        halfNorm = complexHalfNorm(zReal, zImag);

        if (halfNorm > ESCAPE_RADIUS) {
            return smoothValue;
        }

        smoothValue += exp( - halfNorm);

        // update z
        zSquaredPlusC(zReal, zImag, cReal, cImag, &zReal, &zImag);

        // end whenever we found that it roughly matches old values
        // since it is roughly periodic
        if (fabs(zReal - zRealOld) < MATCH_THRESHOLD && 
            fabs(zImag - zImagOld) < MATCH_THRESHOLD)
            return maxIterations;
    }

    return maxIterations;

}


double fractalSet (double x, double y, double cx, double cy, int maxIterations, int type) {
    double zReal = type == TYPE_MANDELBROT ? 0 : x;
    double zImag = type == TYPE_MANDELBROT ? 0 : y;
    double cReal = type == TYPE_MANDELBROT ? x : cx;
    double cImag = type == TYPE_MANDELBROT ? y : cy;
    
    double halfNorm = complexHalfNorm(zReal, zImag);
    double zRealOld = zReal;
    double zImagOld = zImag;

    int maxPeriodDetection = 2;
    int period = 0;

    for (int i = 0; i < maxIterations; i++) {
        halfNorm = complexHalfNorm(zReal, zImag);

        if (halfNorm > ESCAPE_RADIUS) {
            return maxIterations;
        }



        // update z
        zSquaredPlusC(zReal, zImag, cReal, cImag, &zReal, &zImag);

        // end whenever we found that it roughly matches old values
        // since it is roughly periodic
        if (fabs(zReal - zRealOld) < MATCH_THRESHOLD && 
            fabs(zImag - zImagOld) < MATCH_THRESHOLD)
            return period;

        if (period++ > maxPeriodDetection) {
            zRealOld = zReal;
            zImagOld = zImag;
            maxPeriodDetection += period / 2;
        }

    }

    return maxIterations;

}

double EMSCRIPTEN_KEEPALIVE mandelbrot (double x, double y, int maxIterations, int useSmooth) {
    return useSmooth ?
        fractalSetSmooth(x, y, 0, 0, maxIterations, TYPE_MANDELBROT) :
        fractalSet(x, y, 0, 0, maxIterations, TYPE_MANDELBROT);
}

double EMSCRIPTEN_KEEPALIVE julia (double x, double y, double cx, double cy, int maxIterations, int useSmooth) {
    return useSmooth ? 
        fractalSetSmooth(x, y, cx, cy, maxIterations, TYPE_JULIA) :
        fractalSet(x, y, cx, cy, maxIterations, TYPE_JULIA);
}

int main() {
    return 0;
}