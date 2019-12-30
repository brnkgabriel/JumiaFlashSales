var Sales = function () {}

Sales.prototype.tween = function (start, end, duration, easing) {
  var delta = end - start;
  var startTime;
  if (window.performance && window.performance.now) {
    startTime = performance.now();
  } else if (Date.now) {
    startTime = Date.now();
  } else {
    startTime = new Date().getTime();
  }
  var tweenLoop = function (time) {
    var t = (!time ? 0 : time - startTime);
    var factor = easing(null, t, 0, 1, duration);
    w.scrollLeft = start + delta * factor;
    if (t < duration && w.scrollLeft != end)
      requestAnimationFrame(tweenLoop);
  }
  tweenLoop();
};


next.addEventListener('click', function (e) {
  var start = w.scrollLeft, end = w.scrollLeft + 300
  tween(start, end, 1000, self.easeOutQuad);
});
prev.addEventListener('click', function (e) {
  var start = w.scrollLeft, end = w.scrollLeft - 300
  tween(start, end, 1000, self.easeOutQuad);
});

Sales.prototype.easeOutQuad = function (x, t, b, c, d) {
  return -c * (t /= d) * (t - 2) + b;
}
