#include <stdio.h>
#include <math.h>
#include <emscripten.h>

#define ESCAPE_RADIUS 4
#define MATCH_THRESHOLD 1e-154

/*double exp (double x) {
    const double x2 = x * x;
    const double x3 = x2 * x;

    // we are using a purposely bad approximation of exp
    // so that it works reasonaly on the range of 0 to 2
    return 1 + x + x2 / 2 + x3 / 6;
}*/

double exp(double x) {
    return (362880+x*(362880+x*(181440+x*(60480+x*(15120+x*(3024+x*(504+x*(72+x*(9+x)))))))))*2.75573192e-6;
}


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

double EMSCRIPTEN_KEEPALIVE mandelbrot (double x, double y, int maxIterations) {
    double zReal = 0, zImag = 0;
    double cReal = x, cImag = y;

    
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

double EMSCRIPTEN_KEEPALIVE julia (double x, double y, double cx, double cy, int maxIterations) {
    double zReal = x, zImag = y;
    double cReal = cx, cImag = cy;

    
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

int main() {
    printf("Performing sanity check\n");
    printf("Expected output:    2.27071596640298789538 0.40605124963960059770\n");
    printf("Actual output:      %.20lf %.20lf\n", mandelbrot(-1,-1,1000), julia(-1,-1,-1,-1,1000));

    return 0;
}