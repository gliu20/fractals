function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/** 
 * Fractal Viewer Library
 * @author github:gliu20
 */
var fv = {};

fv._throttleAt = function (fps, callback, infoCallback) {
  var start = performance.now();
  var end = performance.now();
  var mergeInvocate = 1;
  var averageDuration = 0;
  var totalDuration = 0;
  var skippedInvocations = 0;

  function calcFreq(periodLength) {
    // takes periodLength in ms; so need convert to sec
    periodLength = periodLength / 1000; // since periodLength is exactly 0, we get a NaN answer
    // if we continue with answer so we break out
    // and return Infinity

    if (periodLength === 0) {
      return Infinity;
    }

    return Math.floor(1 / periodLength * 1000) / 1000;
  }

  function timeCallback(callback) {
    skippedInvocations = 0;
    start = performance.now();
    var shouldContinue = callback();
    end = performance.now();
    totalDuration = end - start;
    averageDuration = totalDuration;
    return shouldContinue;
  }

  function mergedCallback(callback, numInvocations) {
    return function () {
      for (var i = 0; i < numInvocations; i++) {
        var shouldContinue = callback();

        if (!shouldContinue) {
          return false;
        }
      }

      return true;
    };
  }

  (function () {
    var _loop = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var shouldContinue;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(calcFreq(averageDuration) < fps)) {
                _context.next = 12;
                break;
              }

              // we're not meeting target fps
              // hence, we have to throttle by skipping invocations
              skippedInvocations++; // the previous end time is this frame's start time

              start = end;
              end = performance.now(); // add duration of how long it took to display this frame
              // the totalDuration measures how long one invocation 
              // and all skipped invocations afterward took

              totalDuration += end - start;
              averageDuration = totalDuration / skippedInvocations; // decrease mergedInvocate by the amount of skipped frames
              // as more frames are skipped, mergeInvocate decreases
              // exponentially
              // so it's like AIMD
              // we also decrease multiplicativly as well

              mergeInvocate *= 0.85;
              mergeInvocate -= skippedInvocations;
              mergeInvocate = Math.floor(mergeInvocate); // make sure merge invocate is 1 or higher

              if (mergeInvocate < 1) mergeInvocate = 1;
              _context.next = 16;
              break;

            case 12:
              // we're meeting targets so we can run the callback
              // instead of waiting
              shouldContinue = timeCallback(mergedCallback(callback, mergeInvocate)); // if the callback wants us to stop there's no
              // point in continuing to throttle so we break 
              // out of the loop

              if (shouldContinue) {
                _context.next = 15;
                break;
              }

              return _context.abrupt("return");

            case 15:
              // AIMD for merge invocate
              // we're faster than the desired average fps so we group the callback together
              if (calcFreq(averageDuration) > fps) {
                mergeInvocate++;
              }

            case 16:
              infoCallback(averageDuration, calcFreq(averageDuration), mergeInvocate, skippedInvocations); // to avoid stack overflow by indirectly calling loop

              setTimeout(loop, 0);

            case 18:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function loop() {
      return _loop.apply(this, arguments);
    }

    return loop;
  })()();
  return function () {
    start = performance.now();
    end = performance.now();
    mergeInvocate = 1;
    averageDuration = 0;
    totalDuration = 0;
    skippedInvocations = 0;
  };
};

fv._wait = function () {
  return new Promise(function (resolve) {
    requestAnimationFrame(resolve);
  });
};

fv.draw = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(lookupFunc, lookupTable, ctx, infoCallback) {
    var i, isIdle, iterate;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            iterate = function _iterate() {
              if (i < lookupTable.length) {
                var xi = lookupTable[i][0];
                var yi = lookupTable[i][1];
                var xf = lookupTable[i][2];
                var yf = lookupTable[i][3];
                var w = xf - xi;
                var h = yf - yi;
                ctx.fillStyle = lookupFunc(xi, yi);
                ctx.fillRect(xi, yi, w, h);
                i++;
                isIdle = false;
              } else {
                // stop doing stuff
                isIdle = true;
              }

              return true;
            };

            i = 0;
            isIdle = false;
            return _context2.abrupt("return", {
              refreshView: function refreshView() {
                i = 0;
              },
              resetThrottle: fv._throttleAt(40, iterate, function (averageDuration, averageFps, mergeInvocate, skippedInvocations) {
                infoCallback(averageDuration, averageFps, mergeInvocate, skippedInvocations, isIdle);
              })
            });

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

fv.map = function (val, inMin, inMax, outMin, outMax) {
  var a = inMin,
      b = outMin,
      c = inMax,
      d = outMax,
      x = val;
  return (b - d) / (a - c) * (x - a) + b;
};

fv.genLookupTable = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(w, h, onprogress) {
    var lookup, cleanLookup, index, iterationsX, iterationsY, maxIterations, i, currLength, j;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            lookup = [[0, 0, w, h]];
            cleanLookup = [];
            index = {};
            iterationsX = Math.ceil(Math.log2(w));
            iterationsY = Math.ceil(Math.log2(h));
            maxIterations = Math.max(iterationsX, iterationsY);
            i = 0;

          case 7:
            if (!(i < maxIterations)) {
              _context3.next = 22;
              break;
            }

            currLength = lookup.length;
            j = 0;

          case 10:
            if (!(j < currLength)) {
              _context3.next = 19;
              break;
            }

            // only if we didn't subdivide this then we subdivide this
            if (!index[lookup[j].join(",")]) {
              lookup.push.apply(lookup, fv.genSubdividedLookup.apply(fv, lookup[j]));
              index[lookup[j].join(",")] = true;
            }

            if (i * j % 10000 === 0) {
              onprogress(j, currLength, i, maxIterations);
            } // throttle genLookupTable every couple steps


            if (!(i * j % 1000 === 0)) {
              _context3.next = 16;
              break;
            }

            _context3.next = 16;
            return fv._wait();

          case 16:
            j++;
            _context3.next = 10;
            break;

          case 19:
            i++;
            _context3.next = 7;
            break;

          case 22:
            i = 0;

          case 23:
            if (!(i < lookup.length)) {
              _context3.next = 32;
              break;
            }

            if (i % 150000 === 0) {
              onprogress(i, lookup.length, 1, 1);
            }

            if (!(i % 50000 === 0)) {
              _context3.next = 28;
              break;
            }

            _context3.next = 28;
            return fv._wait();

          case 28:
            if (!index.hasOwnProperty(lookup[i][0] + "," + lookup[i][1])) {
              // mark as done
              index[lookup[i][0] + "," + lookup[i][1]] = true; // move old lookup to cleanLookup

              cleanLookup.push(lookup[i]);
            }

          case 29:
            i++;
            _context3.next = 23;
            break;

          case 32:
            // indicate done
            onprogress(1, 1, 1, 1);
            return _context3.abrupt("return", cleanLookup);

          case 34:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6, _x7) {
    return _ref2.apply(this, arguments);
  };
}();

fv.genSubdividedLookup = function (xi, yi, xf, yf) {
  var subdividedCoordXs = fv.subdivideCoord1d(xi, xf);
  var subdividedCoordYs = fv.subdivideCoord1d(yi, yf);

  if (subdividedCoordXs.length === 2 && subdividedCoordYs.length === 2) {
    // this is just a single pixel so we return it
    return [[xi, yi, xf, yf]];
  }

  return fv.mergeCoordDims(subdividedCoordXs, subdividedCoordYs);
};

fv.mergeCoordDims = function (subdividedCoordXs, subdividedCoordYs) {
  var lookup = [];

  for (var i = 0; i < subdividedCoordXs.length - 1; i++) {
    for (var j = 0; j < subdividedCoordYs.length - 1; j++) {
      var xi = subdividedCoordXs[i];
      var xf = subdividedCoordXs[i + 1];
      var yi = subdividedCoordYs[j];
      var yf = subdividedCoordYs[j + 1];
      lookup.push([xi, yi, xf, yf]);
    }
  } // case 2x2


  if (lookup.length === 4) {
    // switch last and second element
    var tmp = lookup[1];
    lookup[1] = lookup[lookup.length - 1];
    lookup[lookup.length - 1] = tmp;
  }

  return lookup;
}; // ci = coord initial
// cf = coord final


fv.subdivideCoord1d = function (ci, cf) {
  var dist = cf - ci; // it's a single pixel can't divide further

  if (dist === 1) {
    return [ci, ci + 1];
  } // get second coordinate


  var ci2 = ci + Math.ceil(dist / 2);
  return [ci, ci2, cf];
};
