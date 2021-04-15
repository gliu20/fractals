
emcc -O3 -flto -s ENVIRONMENT=web,worker src/qfm.c -o dist/index.html
~/emsdk/upstream/bin/wasm-opt -O4 -ffm -ifwl -all -c \
--vacuum \
dist/index.wasm -o dist/index.min.wasm


~/emsdk/upstream/bin/wasm-dis dist/index.wasm -o dist/index.wat
~/emsdk/upstream/bin/wasm-dis dist/index.min.wasm -o dist/index.min.wat




# --flatten \
# --enable-nontrapping-float-to-int \
# --dae-optimizing \
# --dce \
# --dfo \ # this
# --directize \
# --inlining-optimizing \
# --licm \
# --local-cse \
# --optimize-added-constants \
# --optimize-added-constants-propagate \
# --optimize-instructions \
# --optimize-stack-ir \
# --precompute \
# --precompute-propagate \
# --remove-memory \
# --remove-unused-brs \
# --remove-unused-names \
# --remove-unused-module-elements \
# --remove-unused-nonfunction-module-elements \
# --reorder-functions \
# --reorder-locals \
# --rereloop \
# --rse \
# --simplify-globals \
# --simplify-globals-optimizing \
# --simplify-locals \
# --simplify-locals-notee-nostructure \
# --coalesce-locals \
# --coalesce-locals-learning \
# --merge-blocks \
# --merge-locals \
# --vacuum \
# dist/index.wasm -o dist/index.min.wasm