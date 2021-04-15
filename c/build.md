# To Build
Run the following

```sh
emcc -O3 -flto -s ENVIRONMENT=web,worker src/qfm.c -o dist/index.html

~/emsdk/upstream/bin/wasm-opt -O4 --vacuum -c -ffm dist/index.wasm -o dist/index.min.wasm
~/emsdk/upstream/bin/wasm-dis dist/index.min.wasm -o dist/index.min.wat
~/emsdk/upstream/bin/wasm-dis dist/index.wasm -o dist/index.wat
```