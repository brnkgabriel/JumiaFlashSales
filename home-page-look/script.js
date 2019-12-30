var FlipClock = function (options) {
  this.tickInterval = false;
  this.digitSelectors = [];
  this.options = options

  this.init();
};

FlipClock.prototype.init = function () {
  if (this.tickInterval !== false) {
    clearInterval(this.tickInterval);
    this.tickInterval = false;
  }
  
  this.appendMarkupToContainer();
  this.setDimensions();
  this.start();
};

FlipClock.prototype.setDimensions = function () {
  var flipHeight = parseInt(this.options.containerElement.style.height)
  var flipWidth = flipHeight / 1.55;
  
  var uls = document.querySelectorAll('ul.flip')
  uls.forEach(ul => {
    ul.style.width = flipWidth + 'px'
    ul.style.fontSize = (flipHeight - 10) + 'px'
    var lis = ul.querySelectorAll('li')
    lis.forEach(li => li.style.lineHeight = (flipHeight) + 'px')
  })
};

FlipClock.prototype.createSegment = function (faceSegmentGroupName) {
  var faceSegmentGroup = this.options.face[faceSegmentGroupName],
    segmentSelectorAddons = ['-ten', '-one'],
    rounded = Math.ceil(faceSegmentGroup.maxValue / 10),
    segment = [];

  if (faceSegmentGroup.maxValue / 10 > 1) {
    segment = [
      {
        selector: this.options.segmentSelectorPrefix + faceSegmentGroupName + segmentSelectorAddons[0],
        ticks: rounded
      }, {
        selector: this.options.segmentSelectorPrefix + faceSegmentGroupName + segmentSelectorAddons[1],
        ticks: 10
      }
    ];
  } else {
    segment = [
      {
        selector: this.options.segmentSelectorPrefix + faceSegmentGroupName + segmentSelectorAddons[1],
        ticks: 10
      }
    ]
  }

  return segment;
};

FlipClock.prototype.appendMarkupToContainer = function () {
  var baseZIndex = 0;

  for (var faceSegmentGroup in this.options.face) {
    this.options.face[faceSegmentGroup].segments = this.createSegment(faceSegmentGroup);

    for (var i = 0; i < this.options.face[faceSegmentGroup].segments.length; i++) {
      var faceSegmentElement = this.createFaceSegment(this.options.face[faceSegmentGroup].segments[i]);

      this.digitSelectors.push(this.options.face[faceSegmentGroup].segments[i].selector);
      
      this.options.containerElement.appendChild(faceSegmentElement)

      faceSegmentElement.setAttribute('data-face-segment-group', faceSegmentGroup)
      faceSegmentElement.classList.add(faceSegmentGroup)
      faceSegmentElement.style.zIndex = baseZIndex++
    }
  }

  this.digitSelectors.reverse();
};

FlipClock.prototype.createFaceSegment = function (faceSegment) {
  
  var faceElement = document.createElement('ul')
  faceElement.className = 'flip ' + faceSegment.selector

  for (var i = 0; i < faceSegment.ticks; i++) {
    var digit = i;

    faceElement.appendChild(this.createFaceDigit(digit))
  }

  return faceElement;
};

FlipClock.prototype.createFaceDigit = function (digit) {
  var digitInnerFragment = '<div class="shadow"></div><div class="inn">' + digit + '</div>';
  var up = this.createDirection('up', digitInnerFragment)
  var down = this.createDirection('down', digitInnerFragment)
  var spanWrap = document.createElement('span')
  spanWrap.appendChild(up)
  spanWrap.appendChild(down)
  var li = document.createElement('li')
  li.setAttribute('data-digit', digit)
  li.appendChild(spanWrap)

  return li
};

FlipClock.prototype.createDirection = function(direction, digitInnerFragment) {
  var el = document.createElement('div')
  el.className = direction
  el.innerHTML = digitInnerFragment
  return el
}

FlipClock.prototype.start = function () {
  this.setToTime(this.options.startTime);

  var self = this;

  this.tickInterval = setInterval(function () {
    self.tick();
  }, this.options.tickDuration);
};

FlipClock.prototype.stop = function () {
  clearInterval(this.tickInterval);
};

FlipClock.prototype.resetDigits = function () {
  this.options.containerElement.classList.remove('play')

  for (var i = 0; i < this.digitSelectors.length; i++) {

    var all = document.querySelectorAll(this.getDigitSelectorByIndex(i))
    var firstSelector = this.getDigitSelectorByIndex(i) + ":first-child"
    var activeSelector = this.getDigitSelectorByIndex(i) + ".current"

    var first = document.querySelector(firstSelector)
    var active = document.querySelector(activeSelector)

    all[0].classList.add('clockFix')
    all.forEach(each => each.classList.remove('current'))

    first.classList.add('current')

    all.forEach(each => each.classList.remove('previous'))
    active.classList.add('previous')
  }
  this.options.containerElement.classList.add('play')
};

FlipClock.prototype.setToTime = function (time) {
  var timeArray = time.replace(/:/g, '').split('').reverse();

  for (var i = 0; i < this.digitSelectors.length; i++) {

    var dgs = document.querySelectorAll(this.getDigitSelectorByIndex(i))
    var dg = Array.from(dgs).find(dg => parseInt(dg.dataset['digit']) == parseInt(timeArray[i]))

    this.options.containerElement.classList.remove('play')

    dg.classList.add('current')
    this.options.containerElement.classList.add('play')
  }
};

FlipClock.prototype.setFaceSegmentGroupMaxValue = function (segmentGroupName) {
  var self = this;
  var group = this.getFaceSegmentGroupDom(segmentGroupName);

  group.forEach(function (_, idx) {
    self.options.containerElement.classList.remove('play')

    var maxValue = self.options.face[segmentGroupName].maxValue.toString().split('');

    var current = _.querySelector('li.current')
    var maxValue = _.querySelector('li[data-digit="' + maxValue[idx] + '"]')
    current.classList.remove('current')
    maxValue.classList.add('current')

    self.options.containerElement.classList.add('play')
  });
};

FlipClock.prototype.tick = function () {
  this.doTick(0);
};

FlipClock.prototype.getCurrentTime = function () {
  var currentTime = [];

  var currents = document.querySelectorAll('li.current')
  currents.forEach(current => {
    var digit = current.getAttribute('data-digit')
    currentTime.push(digit)
  })

  return parseInt(currentTime.join(''), 10);
};

FlipClock.prototype.getDigitSelectorByIndex = function (digitIndex) {
  return 'ul.' + this.digitSelectors[digitIndex] + ' li';
};

FlipClock.prototype.getFaceSegmentGroupNameByDigitElement = function (digitElement) {
  if (digitElement) { return digitElement.parentElement.getAttribute('data-face-segment-group') }
  return 'seconds'
};

FlipClock.prototype.getFaceSegmentByDigitElement = function (digitElement) {
  return this.options.face[this.getFaceSegmentGroupNameByDigitElement(digitElement)];
};

FlipClock.prototype.getFaceSegmentGroupDom = function (segmentGroupName) {
  return document.querySelectorAll('.' + segmentGroupName)
};

FlipClock.prototype.getCurrentDigitDom = function (segmentGroupName) {
  return document.querySelectorAll('.' + segmentGroupName + ' li.current')
};

FlipClock.prototype.getCurrentFaceSegmentGroupValue = function (digitElement) {
  var segmentGroupName = this.getFaceSegmentGroupNameByDigitElement(digitElement),
    values = [];

  this.getCurrentDigitDom(segmentGroupName).forEach(function (_, idx) {
    values[idx] = _.getAttribute('data-digit')
  });

  return values.join('');
};

FlipClock.prototype.doTick = function (digitIndex) {
  var pseudoSelector;

  // check if we reached maxTime and start over at 00:00:00
  if (this.options.isCountdown === false && this.isMaxTimeReached()) {
    this.resetDigits();
    return;
  }

  this.options.containerElement.classList.remove('play')

  if (this.options.isCountdown === true) {
    pseudoSelector = ":first-child";
  } else {
    pseudoSelector = ":last-child";
  }

  var activeDigit = this.activeDigit(digitIndex, pseudoSelector)
  // set segment to maxValue if it would move past it
  var group = this.getFaceSegmentByDigitElement(activeDigit);
  if (this.getCurrentFaceSegmentGroupValue(activeDigit) > group.maxValue) {
    this.setFaceSegmentGroupMaxValue(this.getFaceSegmentGroupNameByDigitElement(activeDigit));
  }

  this.options.containerElement.classList.add('play')
  this.cleanZIndexFix(activeDigit, this.digitSelectors[digitIndex]);
};

FlipClock.prototype.activeDigit = function (digitIndex, pseudoSelector) {
  var selector = this.getDigitSelectorByIndex(digitIndex) + '.current'
  var plusPseudoSelector = this.getDigitSelectorByIndex(digitIndex) + pseudoSelector

  var activeDigit = document.querySelector(selector)
  var aDPseudoSelector = document.querySelector(plusPseudoSelector)

  var nextDigit = document.createElement('div')

  if (activeDigit.innerHTML == '') {
    if (this.options.isCountdown) {
      var lastSelector = this.getDigitSelectorByIndex(digitIndex) + ":last-child"
      activeDigit = document.querySelector(lastSelector)
      nextDigit = activeDigit.previousSibling
    } else {
      var LIs = this.getDigitSelectorByIndex(digitIndex)
      var digits = document.querySelectorAll(LIs)
      activeDigit = digits[0]
      nextDigit = activeDigit.nextSibling()
    }

    activeDigit.classList.add('previous')
    activeDigit.classList.remove('current')
    nextDigit.classList.add('current')

  } else if (activeDigit.innerHTML === aDPseudoSelector.innerHTML) {
    var allSelector = this.getDigitSelectorByIndex(digitIndex)
    var queries = document.querySelectorAll(allSelector)
    queries.forEach(query => query.classList.remove('previous'))

    // countdown target reached, halt
    if (this.options.isCountdown === true && this.isMinTimeReached()) {
      this.stop();
      return;
    }

    activeDigit.classList.add('previous')
    activeDigit.classList.remove('current')

    if (this.options.isCountdown === true) {
      var lastSelector = this.getDigitSelectorByIndex(digitIndex) + ":last-child"
      activeDigit.classList.add('countdownFix')
      activeDigit = document.querySelector(lastSelector)
    } else {
      activeDigit = queries[0]
      activeDigit.classList.add('clockFix')
    }

    activeDigit.classList.add('current')

    if (typeof this.digitSelectors[digitIndex + 1] !== "undefined") {
      this.doTick(digitIndex + 1);
    }
  } else {
    var selector = this.getDigitSelectorByIndex(digitIndex)
    var queries = document.querySelectorAll(selector)
    queries.forEach(query => query.classList.remove('previous'))

    activeDigit.classList.add('previous')
    activeDigit.classList.remove('current')

    if (this.options.isCountdown === true) {
      nextDigit = activeDigit.previousSibling
    } else {
      nextDigit = activeDigit.nextSibling
    }

    nextDigit.classList.add('current')
  }
  return activeDigit
}

FlipClock.prototype.isMaxTimeReached = function () {
  return this.getCurrentTime() >= parseInt(this.options.maxTime.replace(/:/g, ''), 10);
};

FlipClock.prototype.isMinTimeReached = function () {
  return this.getCurrentTime() <= parseInt(this.options.minTime.replace(/:/g, ''), 10);
};

FlipClock.prototype.cleanZIndexFix = function (activeDigit, selector) {
  if (this.options.isCountdown === true) {
    var allSelector = '.' + selector + ' .countdownFix'
    var fix = document.querySelectorAll(allSelector)
    if (fix.length > 0 && !fix[0].classList.contains('previous') && !fix[0].classList.contains('current')) {
      fix[0].classList.remove('countdownFix')
    }
  } else {
    var index = Array.prototype.slice.call(activeDigit.parentElement.children).indexOf(activeDigit)
    var children = activeDigit.parentElement.children
    var siblings = Array.from(children).filter((_, idx) => idx != index)
    siblings.map(sibling => sibling.classList.remove('clockFix'))
  }
};

var Variables = function () {
  this.now = new Date()
  this.GMT = 'GMT+0100'
  this.LIVE_LINK = '/mobile-apps/'
  this.BOB_IMG_LINK = 'https://ng.jumia.is/cms/8-18/christmas/2019/flash-sales'
  this.extraHours = 0
  this.extraMinutes = 59
  this.rawSKUs = [
    "Samsung Galaxy A30s|4GB/64GB|December 30 2019 00:10:00 GMT+0100|₦80,000|₦69,990|100|samsung-galaxy-a30s_.jpg",
    "Apple iPhone 11|4GB/64GB|December 30 2019 00:10:00 GMT+0100|₦350,000|₦249,000|10|iphone-11.jpg",
    "Big Bull Rice|5kg + Cubes|December 30 2019 00:10:00 GMT+0100|₦3,500|₦1,990|100|bigbull-rice-cubes.jpg",
    "Nexus Blender|1.5ltrs|December 30 2019 00:10:00 GMT+0100|₦7,500|₦4,500|100|nexus-blender-1-5ltrs.jpg",
    "Tomato King Rice|50kg|December 30 2019 00:10:00 GMT+0100|₦25,000|₦14,990|100|tomato-king-rice-50kg.jpg",
    "Midea Microwave|20ltrs|December 30 2019 00:10:00 GMT+0100|₦22,000|₦13,500|100|midea-microwave-20ltrs.jpg",
    "Lloyd Home Theatre|Bluetooth|December 30 2019 00:10:00 GMT+0100|₦30,000|₦12,500|100|lloyd-home-theatre.jpg",
    "Canvas Shoes|Men|December 30 2019 00:10:00 GMT+0100|₦7,500|₦2,500|100|mens-canvas-last.jpg",
    "Tomato King Rice|50kg|December 30 2019 00:10:00 GMT+0100|₦25,000|₦14,990|100|tomato-king-rice-50kg.jpg",
    "Midea Microwave|20ltrs|December 30 2019 00:10:00 GMT+0100|₦22,000|₦13,500|100|midea-microwave-20ltrs.jpg",
    "Lloyd Home Theatre|Bluetooth|December 30 2019 00:10:00 GMT+0100|₦30,000|₦12,500|100|lloyd-home-theatre.jpg",
    "Canvas Shoes|Men|December 30 2019 00:10:00 GMT+0100|₦7,500|₦2,500|100|mens-canvas-last.jpg",
    "King Oil|5ltrs|December 30 2019 00:10:00 GMT+0100|₦3,500|₦2,150|100|devon-king-oil.jpg",
    "Samsung Galaxy A30s|4GB/64GB|January 12 2020 12:00:00 GMT+0100|₦80,000|₦69,990|100|samsung-galaxy-a30s_.jpg",
    "Apple iPhone 11|4GB/64GB|January 12 2020 12:00:00 GMT+0100|₦350,000|₦249,000|10|iphone-11.jpg",
    "Big Bull Rice|5kg + Cubes|January 12 2020 12:00:00 GMT+0100|₦3,500|₦1,990|100|bigbull-rice-cubes.jpg",
    "Nexus Blender|1.5ltrs|January 12 2020 12:00:00 GMT+0100|₦7,500|₦4,500|100|nexus-blender-1-5ltrs.jpg",
    "Tomato King Rice|50kg|January 12 2020 12:00:00 GMT+0100|₦25,000|₦14,990|100|tomato-king-rice-50kg.jpg",
    "Midea Microwave|20ltrs|January 12 2020 12:00:00 GMT+0100|₦22,000|₦13,500|100|midea-microwave-20ltrs.jpg",
    "Lloyd Home Theatre|Bluetooth|January 12 2020 12:00:00 GMT+0100|₦30,000|₦12,500|100|lloyd-home-theatre.jpg",
    "Canvas Shoes|Men|January 12 2020 12:00:00 GMT+0100|₦7,500|₦2,500|100|mens-canvas-last.jpg",
    "King Oil|5ltrs|January 12 2020 12:00:00 GMT+0100|₦3,500|₦2,150|100|devon-king-oil.jpg",
  ]
  this.skus = []
  this.skusEl = document.querySelector('.-skus.-fs')
  this.months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  this.daysOfWeek = [
    'sunday', 'monday', 'tuesday',
    'wednesday', 'thursday', 'friday',
    'saturday'
  ]
}

var Sales = function (variables) {
  this.now = variables.now
  this.GMT = variables.GMT
  this.LIVE_LINK = variables.LIVE_LINK
  this.BOB_IMG_LINK = variables.BOB_IMG_LINK
  this.extraHours = variables.extraHours
  this.extraMinutes = variables.extraMinutes
  this.rawSKUs = variables.rawSKUs
  this.skus = []
  this.skusEl = variables.skusEl
  this.months = variables.months
  this.daysOfWeek = variables.daysOfWeek
  this.interval = null
  this.masksFS = document.querySelector('.md-mask.-fs')
}

Sales.prototype.qSort = function (skus) {
  if (skus.length == 0) { return [] }
  var lesser = [], greater = [], pivot = +new Date(skus[0].split('|')[2])

  for (var i = 1; i < skus.length; i++) {
    var time = +new Date(skus[i].split('|')[2]);
    (time < pivot) ? lesser.push(skus[i]) : greater.push(skus[i])
  }
  return this.qSort(lesser).concat(skus[0], this.qSort(greater))
}

Sales.prototype.expand = function (skus) {
  return skus.map(sku => {
    var split = sku.split('|')
    return {
      name: split[0], desc: split[1], time: split[2],
      oldPrice: split[3], newPrice: split[4], units: split[5],
      img: split[6]
    }
  })
}

Sales.prototype.skuDays = function (skus) {
  var self = this, days = skus.map(sku => self.day(sku))
  return Array.from(new Set(days))
}

Sales.prototype.day = function (sku) {
  var date = new Date(sku['time']).getDate()
  var month = new Date(sku['time']).getMonth()
  return `day-${this.months[month].toLowerCase()}-${date}`
}

Sales.prototype.skuDay = function (time) {
  var day = new Date(time).getDay()
  var month = new Date(time).getMonth()
  var date = new Date(time).getDate()
  var dateTxt = date
  if (date === 1) { dateTxt = `${date}st` }
  else if (date === 2) { dateTxt = `${date}nd` }
  else if (date === 3) { dateTxt = `${date}rd` }
  else { dateTxt = `${date}th` }
  return `${this.daysOfWeek[day]} ${this.months[month]} ${dateTxt}`
}

Sales.prototype.groupedSKUs = function (skus, groupKeys, type) { return this.updateGroups(skus, groupKeys, type) }

Sales.prototype.updateGroups = function (skus, groupKeys, type) {
  var self = this, groups = {}, fn = (type === 'time') ? self.time : self.day

  groupKeys.forEach(groupKey => {
    groups[groupKey] = skus.filter(sku => fn.call(self, sku) === groupKey)
  })

  return groups
}

Sales.prototype.setAttributes = function (el, obj) { Object.keys(obj).forEach(key => el.setAttribute(key, obj[key])) }

Sales.prototype.create = function (tag, attributes, styles, textContent) {
  // var tag = props[0], attributes = props[1], styles = props[2], textContent = props[3]
  var el = document.createElement(tag); this.setAttributes(el, attributes);
  this.setAttributes(el, styles); textContent ? el.innerHTML = textContent : ''
  return el
}

Sales.prototype.appendMany2One = function (many, one) { many.forEach(item => one.appendChild(item)) }

Sales.prototype.easeOutQuart = function (x, t, b, c, d) {
  return -c * ((t = t / d - 1) * t * t * t - 1) + b;
}

Sales.prototype.tween = function (start, end, duration, easing, w) {
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

Sales.prototype.buildDaySKUS = function (marked) {
  var self = this, unique = +new Date('October 12 2020 12:00:00 GMT+0100')
  console.log('marked', marked)
  Object.keys(marked).forEach(key => {
    var rowTime = marked[key][0]['time']
    var rowMilli = +new Date(rowTime);
    var rowClass = (rowMilli === unique) ? `-sku_row -unique -sku_row-${rowMilli} pos-rel` : `-sku_row -sku_row-${rowMilli} pos-rel`
    var skuRow = self.create('div', { class: rowClass, id: 'unique' }, '', '')
    var skuDayTitle = self.create('div', { class: '-skuDay_title pos-rel' }, '', '')
    var timeTxt = self.twelveHrForm(new Date(rowTime).getHours())
    var skuDayTitleSpan = self.create('span', '', '', self.skuDay(rowTime) + ': ' + timeTxt)
    var daySKUs = self.create('div', { class: '-day_skus' }, '', '')
    var prev = self.create('div', { class: '-prev pos-abs' }, '', '')
    var next = self.create('div', { class: '-next pos-abs' }, '', '')

    next.addEventListener('click', function (e) {
      var start = daySKUs.scrollLeft + 50, end = daySKUs.scrollLeft + 300
      self.tween(start, end, 500, self.easeOutQuart, daySKUs);
    });
    prev.addEventListener('click', function (e) {
      var start = daySKUs.scrollLeft - 50, end = daySKUs.scrollLeft - 300
      self.tween(start, end, 500, self.easeOutQuart, daySKUs);
    });

    marked[key].forEach(sku => {
      var skuClass = `-sku -sku_${+new Date(sku['time'])}`
      var skuEl = self.create('div', { class: skuClass }, '', '')
      var coming = self.create('span', { class: '-coming pos-abs fs' }, '', '')
      coming.addEventListener('click', () => self.masksFS.classList.add('md-active'))
      var timeTxt = self.twelveHrForm(new Date(sku['time']).getHours())
      var time = self.create('div', { class: '-time' }, '', timeTxt)
      var appOnly = self.create('div', { class: '-app_only' }, '', 'APP ONLY')
      var liveLink = self.LIVE_LINK
      if (window.innerWidth < 481) {
        liveLink = 'https://aal4.adj.st/ng/camp/xmas-flash-sales?adjust_t=itk4eyn_9sytz8o&adjust_campaign=NG&adjust_adgroup=XMAS-19&adjust_creative=FS_PAGE&adjust_deeplink=jumia%3A%2F%2Fng%2Fcamp%2Fxmas-flash-sales&adjust_redirect=https%3A%2F%2Fwww.jumia.com.ng%2Fxmas-flash-sales'
      }
      var imgWrap = self.create('a', {
        class: '-img pos-rel',
        href: liveLink,
        target: '_blank'
      }, '', '')
      var shadow = self.create('div', { class: 'pos-abs -shadow' }, '', '')
      var shadowSpan = self.create('span', { class: 'pos-abs' }, '', 'sold')

      var img = self.create('img', {
        alt: 'sku_img',
        src: `${this.BOB_IMG_LINK}/${sku['img']}`
      }, '', '')
      var details = self.create('div', { class: '-details' }, '', '')
      var name = self.create('div', { class: '-name' }, '', sku['name'])
      var descUnits = self.create('div', { class: '-desc_units' }, '', '')
      var desc = self.create('div', { class: '-du -desc' }, '', sku['desc'])
      var units = self.create('div', { class: '-du -units' }, '', `${sku['units']} units`)
      var prices = self.create('div', { class: '-prices' }, '', '')
      var newPrice = self.create('div', { class: '-price -new_price' }, '', sku['newPrice'])
      var oldPrice = self.create('div', { class: '-price -old_price' }, '', sku['oldPrice'])

      shadow.appendChild(shadowSpan)
      self.appendMany2One([shadow, img], imgWrap)
      self.appendMany2One([desc, units], descUnits)

      self.appendMany2One([newPrice, oldPrice], prices)
      self.appendMany2One([name, descUnits, prices], details)
      self.appendMany2One([time, appOnly, imgWrap, details, coming], skuEl)
      daySKUs.appendChild(skuEl)
    })
    skuDayTitle.appendChild(skuDayTitleSpan)
    self.appendMany2One([skuDayTitle, daySKUs, prev, next], skuRow)
    self.skusEl.appendChild(skuRow)
  })
}

Sales.prototype.twelveHrForm = function (time) {
  if (time === 12) { return time + "pm"; }
  else if (time > 12) { return (time - 12) + "pm"; }
  else if (time === 0) { return 12 + "am" }
  else { return time + "am"; }
}

Sales.prototype.setState = function (skus) {
  var keys = Object.keys(skus)
  var firstTime = skus[keys[0]][0]['time']
  var firstStartTime = new Date(firstTime)
  var lastIdx = keys.length - 1
  var lastSKUS = skus[keys[lastIdx]]
  var lastTime = lastSKUS[lastSKUS.length - 1]['time']
  var lastEndTime = new Date(this.endTime(lastTime))

  if (+this.now < +firstStartTime) { this.b41stSession(skus) }
  else if (+this.now > +lastEndTime) { this.aftrLastSession() }
  else { this.inAndBtwSessions(skus) }

  this.setClock(skus)
}

Sales.prototype.clock = function () {
  var clock = this.create('div', { class: 'clock pos-abs' }, '', '')
  var countdown = this.create('div', { class: '-countdown' }, { style: 'height: 25px'}, '')
  var timeMeasures = this.create('div', { class: '-time_measures' }, '', '')
  var days = this.create('div', { class: '-time_measure -days' }, '', 'dy')
  var hours = this.create('div', { class: '-time_measure -hours' }, '', 'hr')
  var minutes = this.create('div', { class: '-time_measure -minutes' }, '', 'mn')
  var seconds = this.create('div', { class: '-time_measure -seconds' }, '', 'sc')

  this.appendMany2One([days, hours, minutes, seconds], timeMeasures)
  this.appendMany2One([countdown, timeMeasures], clock)
  return clock
}

Sales.prototype.remainingTime = function (endTime) {
  var t = +new Date(endTime) - (+new Date())
  var seconds = Math.floor((t / 1000) % 60)
  var minutes = Math.floor((t / 1000 / 60) % 60)
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24)
  var days = Math.floor(t / (1000 * 60 * 60 * 24))

  return { days, hours, minutes, seconds }
}

Sales.prototype.setClock = function (skus) {
  var nextTime = this.nextTime(skus)
  if (nextTime['type'] === 'start') {
  var milliTime = +new Date(nextTime['time'])
  var clockRow = document.querySelector('.-sku_row-' + milliTime)
  var clockParent = clockRow.querySelector('.-skuDay_title')
  clockParent.appendChild(this.clock())
  
  var rt = this.remainingTime(milliTime)
  var startTime = Object.keys(rt)
  .map(key => ('0' + rt[key]).slice(-2))
  .join(':')
  
  var flip = new FlipClock({
    tickDuration: 1000,
    isCountdown: true,
    startTime,
    maxTime: '30:23:59:59',
    minTime: '00:00:00:00',
    containerElement: document.querySelector('.-countdown'),
    segmentSelectorPrefix: 'flipclock-',
    face: {
      days: { maxValue: 31 },
      hours: { maxValue: 23 },
      minutes: { maxValue: 59 },
      seconds: { maxValue: 59 }
    }
  })
  }
  // this.setCountDownTxt(nextTime)
  // this.initializeClock('clockdiv', nextTime['time'])
}

Sales.prototype.endTime = function (time) {
  var date = new Date(time)
  var mt = this.months[date.getMonth()], dt = date.getDate(), yr = date.getFullYear()
  var ct = this.carryTime(date, this.extraHours, this.extraMinutes)
  return `${mt} ${dt} ${yr} ${ct} ${this.GMT}`
}

Sales.prototype.carryTime = function (date, exHrs, exMns) {
  var hr = date.getHours(), mn = date.getMinutes(), sc = date.getSeconds()
  var totalHours = hr + exHrs, totalMinutes = mn + exMns
  if (totalMinutes > 59) { totalMinutes %= 60; totalHours++ }
  return `${this.pad(totalHours)}:${this.pad(totalMinutes)}:${this.pad(sc)}`
}

Sales.prototype.pad = function (time) { return ('0' + time).slice(-2) }

Sales.prototype.b41stSession = function (skus) {
  console.log('b41stSession session')
  var keys = Object.keys(skus)
  var firstTime = skus[keys[0]][0]['time']
  this.initializeClock('clockdiv', firstTime)
}

Sales.prototype.aftrLastSession = function () {
  console.log('after last session')
}

Sales.prototype.inAndBtwSessions = function (skus) {
  console.log('in and between session')
  var keys = Object.keys(skus), isInSess = false
  keys.forEach(key => {
    var keySKUs = skus[key]
    isInSess = this.isInSession(keySKUs);
    (isInSess['flag']) ? this.inSession(isInSess['time']) : this.btwSession()
  })
}

Sales.prototype.setCountDownTxt = function (nextTime) {
  var countDownTxt = document.querySelector('#clockdiv>h3')
  if (nextTime['type'] === 'start') {
    countDownTxt.textContent = 'next sale starts in'
  } else if (nextTime['type'] === 'end') {
    countDownTxt.textContent = 'current sale ends in'
  } else {
    countDownTxt.textContent = 'flash sales are over'
    var timeCircles = document.querySelectorAll('.frame-wrap>div>div>div:first-of-type')
    timeCircles.forEach(circle => {
      circle.style.display = 'none'
    })
  }
}

Sales.prototype.isInSession = function (keySKUs) {
  var obj = { flag: false, time: keySKUs[0]['time'] };
  for (var i = 0; i < keySKUs.length; i++) {
    var startTime = new Date(keySKUs[i]['time'])
    var endTime = new Date(this.endTime(keySKUs[i]['time']))
    if (+this.now >= +startTime && +this.now < +endTime) {
      obj = { flag: true, time: keySKUs[i]['time'] }
      break
    }
  }
  return obj
}

Sales.prototype.inSession = function (time) {
  // var liveSKUS = document.querySelectorAll(`.-sku_${+new Date(time)}`)
  // liveSKUS.forEach(sku => {
  //   var time = sku.querySelector('.-time')
  //   time.textContent = 'LIVE NOW'
  //   sku.classList.add('-live')
  // })
  var liveSKURow = document.querySelector(`.-sku_row-${+new Date(time)}`)
  liveSKURow.classList.add('-live')
}

Sales.prototype.btwSession = function () {

}

Sales.prototype.uniqueTimes = function (skus) {
  var times = [], $skus = [], uniqueTimes = []
  Object.keys(skus).forEach(key => $skus.push(...skus[key]))
  times = $skus.map(sku => sku['time'])
  uniqueTimes = Array.from(new Set(times))
  return uniqueTimes
}

Sales.prototype.nextTime = function (skus) {
  var self = this, startEndTimes = [], nextTime = { type: 'over', time: new Date() }
  var uniqueTimes = this.uniqueTimes(skus)
  uniqueTimes.forEach(time => {
    startEndTimes.push({ type: 'start', time })
    var endTime = this.endTime(time)
    startEndTimes.push({ type: 'end', time: endTime })
  })
  var comingTimes = startEndTimes
    .filter(tme => +self.now < +new Date(tme['time']))
  if (comingTimes.length > 0) { nextTime = comingTimes[0] }
  return nextTime
}

Sales.prototype.initializeClock = function (id, endTime) {
  var clock = document.getElementById(id), self = this
  var daysSpan = clock.querySelector('.days')
  var hoursSpan = clock.querySelector('.hours')
  var minutesSpan = clock.querySelector('.minutes')
  var secondsSpan = clock.querySelector('.seconds')
  var timeInterval = setInterval(updateClock, 1000)

  function updateClock() {
    var t = self.getTimeRemaining(endTime)
    daysSpan.innerHTML = t['days']
    hoursSpan.innerHTML = ('0' + t['hours']).slice(-2)
    minutesSpan.innerHTML = ('0' + t['minutes']).slice(-2)
    secondsSpan.innerHTML = ('0' + t['seconds']).slice(-2)
    if (t['total'] <= 0) { clearInterval(timeInterval) }
  }
}

Sales.prototype.getTimeRemaining = function (endTime) {
  var t = +new Date(endTime) - (+new Date())
  var seconds = Math.floor((t / 1000) % 60)
  var minutes = Math.floor((t / 1000 / 60) % 60)
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24)
  var days = Math.floor(t / (1000 * 60 * 60 * 24))

  if (days == 0 && hours == 0 && minutes == 0 && seconds == 0) { setTimeout(() => { window.location.reload(true) }, 1000) }
  return { total: t, days, hours, minutes, seconds }
}

Sales.prototype.markAsSold = function (grouped) {
  var self = this
  var uniqueTimes = this.uniqueTimes(grouped)
  uniqueTimes.forEach(uTime => {
    var endTime = self.endTime(uTime)
    var oosSelector = `.-sku_${+new Date(uTime)}`
    if (+self.now > +new Date(endTime)) { self.mark(oosSelector) }
  })
}

Sales.prototype.mark = function (oosSelector) {
  var oosSKUsEls = document.querySelectorAll(oosSelector)
  var parent = null , oosSKUs = []
  oosSKUsEls.forEach(sku => {
    sku.classList.add('-oos')
    oosSKUs.push(sku)
    parent = sku.parentElement
    parent.appendChild(sku)
  })
  this.oosRow(parent)
}

Sales.prototype.oosRow = function (parent) {
  var gParent = parent.parentElement
  var ggParent = gParent.parentElement
  var skusInRow = gParent.querySelectorAll('.-sku')
  var oosSKUs = Array.from(skusInRow).filter(sku => sku.classList.contains('-oos'))
  if (skusInRow.length === oosSKUs.length) {
    ggParent.appendChild(gParent)
  }
}


var Main = function () { this.sales = null }

Main.prototype.init = function () {
  var variables = new Variables()
  this.sales = new Sales(variables)
  var sortedSKUS = this.sales.qSort(this.sales.rawSKUs)
  var expandedSKUS = this.sales.expand(sortedSKUS)
  var dayKeys = this.sales.skuDays(expandedSKUS)
  var groupedSKUS = this.sales.groupedSKUs(expandedSKUS, dayKeys, 'day')
  this.sales.buildDaySKUS(groupedSKUS)
  this.sales.markAsSold(groupedSKUS)
  this.sales.setState(groupedSKUS)
}

var shows = document.querySelectorAll('.md-show');
var masks = document.querySelectorAll('.md-mask');
var closes = document.querySelectorAll('.md-close');

shows.forEach((show, idx) => {
  show.addEventListener('click', function () {
    masks[idx].classList.add('md-active');
  })
})

function closeModal(mask) {
  mask.classList.remove('md-active')
}

closes.forEach((close, idx) => {
  close.addEventListener('click', () => closeModal(masks[idx]));
})

masks.forEach(mask => {
  mask.addEventListener('click', () => closeModal(mask));
})

var main = new Main()
main.init()

// ************* CLOCK *****************

/**
 * FlipClock
 * @param options
 * @constructor
 */
FlipClock = function (options) {
  this.tickInterval = false;
  this.digitSelectors = [];
  this.options = this.createConfig(options);

  this.init();
};

/**
 * returns merged config based on passed config + default config
 * @param options - config object
 * @returns options merged config objects
 */
FlipClock.prototype.createConfig = function (options) {
  return $.extend({}, this.getDefaultConfig(), options);
};

/**
 * returns default config object
 */
FlipClock.prototype.getDefaultConfig = function () {
  return {
    tickDuration: 1000,
    isCountdown: false,
    startTime: '23:59:51',
    maxTime: '23:59:59',
    minTime: '00:00:00',
    containerElement: document.querySelector('.container'),
    segmentSelectorPrefix: 'flipclock-',
    face: {
      hours: {
        maxValue: 23
      },
      minutes: {
        maxValue: 59
      },
      seconds: {
        maxValue: 59
      }
    }
  };
};

/**
 * check browser feature support
 */
FlipClock.prototype.initFeatureDetection = function () {
  $.support.transition = (function () {
    var thisBody = document.body || document.documentElement,
      thisStyle = thisBody.style,
      support = thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined;
    return support;
  })();
};

/**
 * return browser support for given feature
 * @param feature
 * @returns {*}
 */
FlipClock.prototype.isFeatureSupported = function (feature) {
  if (feature && typeof $.support !== undefined && typeof $.support[feature] !== undefined) {
    return $.support[feature];
  }

  return false;
};

/**
 * init
 */
FlipClock.prototype.init = function () {
  this.options.containerElement.empty();

  if (this.tickInterval !== false) {
    clearInterval(this.tickInterval);
    this.tickInterval = false;
  }

  this.appendMarkupToContainer();
  this.setDimensions();

  this.setupFallbacks();

  this.start();
};

/**
 * setupFallbacks
 */
FlipClock.prototype.setupFallbacks = function () {
  this.initFeatureDetection();

  if (this.isFeatureSupported('transition')) {
    $('ul.flip li:first-child', this.options.containerElement).css("z-index", 2);
  } else {
    // < IE9 can't do css animations (@keyframe) - need to fix z-index here since we're setting z-indices inside the keyframe-steps
    $('ul.flip li:first-child', this.options.containerElement).css("z-index", 3);

    // < IE9 doesn't understand nth-child css selector => fallback class that has to be addressed via css separatly
    $('ul.flip:nth-child(2n+2):not(:last-child)', this.options.containerElement).addClass('nth-child-2np2-notlast');
  }
};

/**
 * Sets digit dimensions based on its containers height
 */
FlipClock.prototype.setDimensions = function () {
  var flipHeight = this.options.containerElement.height(),
    flipWidth = flipHeight / 1.55;

  $('ul.flip', this.options.containerElement).css({
    width: flipWidth,
    fontSize: (flipHeight - 10) + 'px'
  }).find('li').css({
    lineHeight: (flipHeight) + 'px'
  });
};

/**
 * Creates segments out of 'digits', calculates ticks per digit based on segment maxValue
 * @param faceSegmentGroupName
 * @returns {Array}
 */
FlipClock.prototype.createSegment = function (faceSegmentGroupName) {
  var faceSegmentGroup = this.options.face[faceSegmentGroupName],
    segmentSelectorAddons = ['-ten', '-one'],
    rounded = Math.ceil(faceSegmentGroup.maxValue / 10),
    segment = [];

  if (faceSegmentGroup.maxValue / 10 > 1) {
    segment = [
      {
        selector: this.options.segmentSelectorPrefix + faceSegmentGroupName + segmentSelectorAddons[0],
        ticks: rounded
      }, {
        selector: this.options.segmentSelectorPrefix + faceSegmentGroupName + segmentSelectorAddons[1],
        ticks: 10
      }
    ];
  } else {
    segment = [
      {
        selector: this.options.segmentSelectorPrefix + faceSegmentGroupName + segmentSelectorAddons[1],
        ticks: 10
      }
    ]
  }

  return segment;
};

/**
 * Appends the markup for each digit to the container
 */
FlipClock.prototype.appendMarkupToContainer = function () {
  var baseZIndex = 0;

  for (var faceSegmentGroup in this.options.face) {
    this.options.face[faceSegmentGroup].segments = this.createSegment(faceSegmentGroup);

    for (var i = 0; i < this.options.face[faceSegmentGroup].segments.length; i++) {
      var faceSegmentElement = this.createFaceSegment(this.options.face[faceSegmentGroup].segments[i]);

      this.digitSelectors.push(this.options.face[faceSegmentGroup].segments[i].selector);
      this.options.containerElement.append(faceSegmentElement);

      // assign common data-attribute to segments of the same group
      faceSegmentElement.data('face-segment-group', faceSegmentGroup);
      faceSegmentElement.addClass(faceSegmentGroup);
      faceSegmentElement.css("z-index", baseZIndex++);
    }
  }

  this.digitSelectors.reverse();

  //    var self = this;
  //    $(document).on('keyup', function(e) {
  //        if(e.keyCode === 13) {
  //            self.stop();
  //        }
  //    });
};

/**
 * Creates face segments
 * @param faceSegment
 * @returns {*|jQuery|HTMLElement}
 */
FlipClock.prototype.createFaceSegment = function (faceSegment) {
  var faceElement = $('<ul>', {
    "class": "flip " + faceSegment.selector
  });

  for (var i = 0; i < faceSegment.ticks; i++) {
    var digit = i;

    faceElement.append(this.createFaceDigit(digit));
  }

  return faceElement;
};

/**
 * Creates digit markup
 * @param digit
 * @returns {string}
 */
FlipClock.prototype.createFaceDigit = function (digit) {
  var digitInnerFragment = '<div class="shadow"></div><div class="inn">' + digit + '</div>';

  return '<li data-digit=' + digit + ' ><span>' +
    '<div class="up">' + digitInnerFragment + '</div>' +
    '<div class="down">' + digitInnerFragment + '</div>' +
    '</span></li>';
};

/**
 * Starts the clock
 */
FlipClock.prototype.start = function () {
  this.setToTime(this.options.startTime);

  var self = this;

  this.tickInterval = setInterval(function () {
    self.tick();
  }, this.options.tickDuration);
};

/**
 * Stops the Clock after the current interval is finished
 */
FlipClock.prototype.stop = function () {
  clearInterval(this.tickInterval);
};

/**
 * Resets to 00:00:00....
 * needed when using this as an actual clock - e.g. can reset to 0 after 23:59:59
 */
FlipClock.prototype.resetDigits = function () {
  this.options.containerElement.removeClass('play');

  for (var i = 0; i < this.digitSelectors.length; i++) {
    var active = $(this.getDigitSelectorByIndex(i) + ".current", this.options.containerElement),
      all = $(this.getDigitSelectorByIndex(i), this.options.containerElement),
      first = $(this.getDigitSelectorByIndex(i) + ":first-child", this.options.containerElement);

    all.eq(0).addClass("clockFix");
    all.removeClass("current");

    first.addClass("current");

    all.removeClass("previous");
    active.addClass("previous");
  }

  this.options.containerElement.addClass('play');
};

/**
 * Sets the clock to a time based on passed string
 * @param time {string} 00:00:00...
 */
FlipClock.prototype.setToTime = function (time) {
  var timeArray = time.replace(/:/g, '').split('').reverse();

  for (var i = 0; i < this.digitSelectors.length; i++) {
    var digit = $(this.getDigitSelectorByIndex(i), this.options.containerElement).eq(parseInt(timeArray[i]));

    this.options.containerElement.removeClass('play');

    digit.addClass("current");
    this.options.containerElement.addClass('play');
  }
};

/**
 * Set Segment to its maximum value
 * @param segmentGroupName
 */
FlipClock.prototype.setFaceSegmentGroupMaxValue = function (segmentGroupName) {
  var self = this;
  var group = this.getFaceSegmentGroupDom(segmentGroupName);

  group.each(function (idx) {
    self.options.containerElement.removeClass('play');

    var maxValue = self.options.face[segmentGroupName].maxValue.toString().split('');

    $(this).find('li.current').removeClass('current');
    $(this).find('li[data-digit="' + maxValue[idx] + '"]').addClass('current');

    self.options.containerElement.addClass('play');
  });
};

/**
 * actual callback for the tick/interval
 */
FlipClock.prototype.tick = function () {
  this.doTick(0);
};

/**
 * Returns current time as int
 * @returns {Number}
 */
FlipClock.prototype.getCurrentTime = function () {
  var currentTime = [];

  $('li.current', this.options.containerElement).each(function () {
    currentTime.push($(this).data('digit'));
  });

  return parseInt(currentTime.join(''), 10);
};

/**
 * gets digit selector string for the given index in the digitselectors array
 * @param digitIndex
 * @returns {string}
 */
FlipClock.prototype.getDigitSelectorByIndex = function (digitIndex) {
  return 'ul.' + this.digitSelectors[digitIndex] + ' li';
};

/**
 * Return the segment group name for a passed digit element
 * @param digitElement
 * @returns {*}
 */
FlipClock.prototype.getFaceSegmentGroupNameByDigitElement = function (digitElement) {
  return digitElement.parent().data('face-segment-group');
};

/**
 * Return the segment group object for a passed digit element
 * @param digitElement
 * @returns {*}
 */
FlipClock.prototype.getFaceSegmentByDigitElement = function (digitElement) {
  return this.options.face[this.getFaceSegmentGroupNameByDigitElement(digitElement)];
};

/**
 * Return segment group dom objects by segment group name
 * @param segmentGroupName
 * @returns {*|jQuery|HTMLElement}
 */
FlipClock.prototype.getFaceSegmentGroupDom = function (segmentGroupName) {
  return $('.' + segmentGroupName, this.options.containerElement)
};

/**
 * Return dom object for the currently active digit for a segment group name
 * @param segmentGroupName
 * @returns {*|jQuery|HTMLElement}
 */
FlipClock.prototype.getCurrentDigitDom = function (segmentGroupName) {
  return $('.' + segmentGroupName + ' li.current', this.options.containerElement)
};

/**
 * Returns the value a segment group is currently representing selected by digit element
 * @param digitElement
 * @returns {string}
 */
FlipClock.prototype.getCurrentFaceSegmentGroupValue = function (digitElement) {
  var segmentGroupName = this.getFaceSegmentGroupNameByDigitElement(digitElement),
    values = [];

  this.getCurrentDigitDom(segmentGroupName).each(function (idx) {
    values[idx] = $(this).data('digit');
  });

  return values.join('');
};

/**
 * handles the tick logic
 * @param digitIndex
 */
FlipClock.prototype.doTick = function (digitIndex) {
  var nextDigit, pseudoSelector;

  // check if we reached maxTime and start over at 00:00:00
  if (this.options.isCountdown === false && this.isMaxTimeReached()) {
    this.resetDigits();
    return;
  }

  this.options.containerElement.removeClass('play');

  if (this.options.isCountdown === true) {
    pseudoSelector = ":first-child";
  } else {
    pseudoSelector = ":last-child";
  }

  var activeDigit = $(this.getDigitSelectorByIndex(digitIndex) + ".current", this.options.containerElement);

  if (activeDigit.html() == undefined) {
    if (this.options.isCountdown) {
      activeDigit = $(this.getDigitSelectorByIndex(digitIndex) + ":last-child", this.options.containerElement);
      nextDigit = activeDigit.prev("li");
    } else {
      activeDigit = $(this.getDigitSelectorByIndex(digitIndex), this.options.containerElement).eq(0);
      nextDigit = activeDigit.next("li");
    }

    activeDigit.addClass("previous").removeClass("current");

    nextDigit.addClass("current");
  } else if (activeDigit.is(pseudoSelector)) {
    $(this.getDigitSelectorByIndex(digitIndex), this.options.containerElement).removeClass("previous");

    // countdown target reached, halt
    if (this.options.isCountdown === true && this.isMinTimeReached()) {
      this.stop();
      return;
    }

    activeDigit.addClass("previous").removeClass("current");

    if (this.options.isCountdown === true) {
      activeDigit.addClass("countdownFix");
      activeDigit = $(this.getDigitSelectorByIndex(digitIndex) + ":last-child", this.options.containerElement);
    } else {
      activeDigit = $(this.getDigitSelectorByIndex(digitIndex), this.options.containerElement).eq(0);
      activeDigit.addClass("clockFix");
    }

    activeDigit.addClass("current");

    // animate the next segment once (if there is one)
    if (typeof this.digitSelectors[digitIndex + 1] !== "undefined") {
      this.doTick(digitIndex + 1);
    }
  } else {
    $(this.getDigitSelectorByIndex(digitIndex), this.options.containerElement).removeClass("previous");

    activeDigit.addClass("previous").removeClass("current");

    if (this.options.isCountdown === true) {
      nextDigit = activeDigit.prev("li");
    } else {
      nextDigit = activeDigit.next("li");
    }

    nextDigit.addClass("current");
  }
  // set segment to maxValue if it would move past it
  var group = this.getFaceSegmentByDigitElement(activeDigit);
  if (this.getCurrentFaceSegmentGroupValue(activeDigit) > group.maxValue) {
    this.setFaceSegmentGroupMaxValue(this.getFaceSegmentGroupNameByDigitElement(activeDigit));
  }

  this.options.containerElement.addClass('play');
  this.cleanZIndexFix(activeDigit, this.digitSelectors[digitIndex]);
};

/**
 * isMaxTimeReached
 * @returns {boolean}
 */
FlipClock.prototype.isMaxTimeReached = function () {
  return this.getCurrentTime() >= parseInt(this.options.maxTime.replace(/:/g, ''), 10);
};

/**
 * isMinTimeReached
 * @returns {boolean}
 */
FlipClock.prototype.isMinTimeReached = function () {
  return this.getCurrentTime() <= parseInt(this.options.minTime.replace(/:/g, ''), 10);
};

/**
 * Fixes flickering top half of digit
 *
 * @param activeDigit
 * @param selector
 */
FlipClock.prototype.cleanZIndexFix = function (activeDigit, selector) {
  if (this.options.isCountdown === true) {
    var fix = $('.' + selector + ' .countdownFix', this.options.containerElement);

    if (fix.length > 0 && !fix.hasClass("previous") && !fix.hasClass("current")) {
      fix.removeClass("countdownFix");
    }
  } else {
    activeDigit.siblings().removeClass("clockFix");
  }
};
