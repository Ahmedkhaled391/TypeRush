export function throttle(callback, wait = 100) {
  let timeoutId = null;
  let lastRun = 0;
  let lastArgs = null;

  function run() {
    lastRun = Date.now();
    timeoutId = null;
    callback(...lastArgs);
    lastArgs = null;
  }

  function throttled(...args) {
    lastArgs = args;
    const remaining = wait - (Date.now() - lastRun);

    if (remaining <= 0 || remaining > wait) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      run();
      return;
    }

    if (!timeoutId) {
      timeoutId = setTimeout(run, remaining);
    }
  }

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = null;
    lastArgs = null;
  };

  throttled.flush = () => {
    if (!lastArgs) return;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    run();
  };

  return throttled;
}
