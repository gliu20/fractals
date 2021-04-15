# To Build
Run the following

```sh
emcc -O3 -flto -s FILESYSTEM=0 -s ENVIRONMENT=web,worker -s ASSERTIONS=0 src/qfm.c -o dist/index.html
```