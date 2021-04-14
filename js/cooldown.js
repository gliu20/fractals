const cooldown = {};

cooldown.throttle = function (timeout, callback) {
  let instance;
  let lastRun = Date.now();
  
  const wrappedCallback = function () { 
    lastRun = Date.now();
    callback();
  };
  
  return function () {
    clearTimeout(instance);
    if (Date.now() - lastRun >= timeout) {
      wrappedCallback()
    }
    else {
      instance = setTimeout(wrappedCallback, Date.now() - lastRun);
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
