const cooldown = {};

cooldown.throttle = function (timeout, callback) {
  let instance;
  let lastRun = Date.now();
  
  const wrappedCallback = function (...args) { 
    lastRun = Date.now();
    callback(...args);
  };
  
  return function (...args) {
    clearTimeout(instance);
    if (Date.now() - lastRun >= timeout) {
      wrappedCallback(...args)
    }
    else {
      instance = setTimeout(function () {
        wrappedCallback(...args)
      }, Date.now() - lastRun);
    }
  }
}

/*
    timeout  - how long after function stops triggering to run
    callback - what to do after function stops triggering
    debounceCallback - what to run in the meantime (optional)
*/
cooldown.debounce = function (timeout, deferredCallback, immediateCallback) {
    let instance;
    return function () {
        clearTimeout(instance);
        
        immediateCallback = immediateCallback || function () { };
        immediateCallback();
        
        instance = setTimeout(deferredCallback, timeout);
    }
}
