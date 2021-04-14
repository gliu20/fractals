#include <stdio.h>
#include <math.h>
#define ESCAPE_RADIUS 16

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

double mandelbrot (double x, double y, int maxIterations) {
    double zReal = 0, zImag = 0;
    double cReal = x, cImag = y;

    
    double halfNorm = complexHalfNorm(zReal, zImag);
    double smoothValue = exp( - halfNorm);

    for (int i = 0; i < maxIterations; i++) {
        halfNorm = complexHalfNorm(zReal, zImag);

        if (halfNorm > ESCAPE_RADIUS) {
            return smoothValue;
        }

        smoothValue += exp( - halfNorm);

        // update z
        zSquaredPlusC(zReal, zImag, cReal, cImag, &zReal, &zImag);
    }

    return maxIterations;
}

double julia (double x, double y, double cx, double cy, int maxIterations) {
    double zReal = x, zImag = y;
    double cReal = cx, cImag = cy;

    
    double halfNorm = complexHalfNorm(zReal, zImag);
    double smoothValue = exp( - halfNorm);

    for (int i = 0; i < maxIterations; i++) {
        halfNorm = complexHalfNorm(zReal, zImag);

        if (halfNorm > ESCAPE_RADIUS) {
            return smoothValue;
        }

        smoothValue += exp( - halfNorm);

        // update z
        zSquaredPlusC(zReal, zImag, cReal, cImag, &zReal, &zImag);
    }

    return maxIterations;
}

int main() {
    double value = mandelbrot(-1,-1,1000);
    double value2 = julia(-1,-1,-1,-1,1000);
    printf("%.20lf %.20lf\n", value, value2);
    return 0;
}