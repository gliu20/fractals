# include <stdio.h>



void zSquaredPlusC (double zReal, double zImag,
    double cReal, double cImag,
    double *real, double *imag) {

    complexSquare(zReal, zImag, real, imag);
    complexAdd(*real, *imag, cReal, cImag, real, imag);
}

void complexSquare(double real1, double imag1,
    double *real, double *imag) {

    const double sum = real1 + imag1;
    const double diff = real1 - imag1;
    const double prod = real1 * imag1;

    *real = sum * diff;
    *imag = prod + prod;
}


void complexAdd (double real1, double imag1, 
    double real2, double imag2, 
    double *real, double *imag) {

    *real = real1 + real2;
    *imag = imag1 + imag2;
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

double complexHalfNorm (double real, double imag) {
    return real * real + imag * imag;
}

int main() {
    double real, imag;
    zSquaredPlusC(1.414,2.1,-3.0,-2.0, &real, &imag);
    
    printf("%.20lf %.20lf\n", real,imag);
    return 0;
}