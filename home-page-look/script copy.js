var Variables = function () {
  this.now = new Date()
  this.GMT = 'GMT+0100'
  this.LIVE_LINK = '/mobile-apps/'
  this.BOB_IMG_LINK = 'https://ng.jumia.is/cms/8-18/christmas/2019/flash-sales'
  this.extraHours = 0
  this.extraMinutes = 59
  this.rawSKUs = [
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

Sales.prototype.groupedSKUs = function (skus, groupKeys, type)
{ return this.updateGroups(skus, groupKeys, type) }

Sales.prototype.updateGroups = function (skus, groupKeys, type) {
  var self = this, groups = {}, fn = (type === 'time') ? self.time : self.day

  groupKeys.forEach(groupKey => {
    groups[groupKey] = skus.filter(sku => fn.call(self, sku) === groupKey)
  })

  return groups
}

Sales.prototype.setAttributes = function (el, obj) 
{ Object.keys(obj).forEach(key => el.setAttribute(key, obj[key])) }

Sales.prototype.create = function (tag, attributes, styles, textContent) {
  var el = document.createElement(tag); this.setAttributes(el, attributes);
  this.setAttributes(el, styles); textContent ? el.innerHTML = textContent : ''
  return el
}

Sales.prototype.appendMany2One = function (many, one) 
{ many.forEach(item => one.appendChild(item)) }

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
  Object.keys(marked).forEach(key => {
    var rowMilli = +new Date(marked[key][0]['time']);
    var rowClass = (rowMilli === unique) ? `-sku_row -unique -sku_row-${rowMilli} pos-rel` : `-sku_row -sku_row-${rowMilli} pos-rel`
    var skuRow = self.create('div', { class: rowClass, id: 'unique' }, '', '')
    var skuDayTitle = self.create('div', { class: '-skuDay_title pos-rel' }, '', '')
    var skuDayTitleSpan = self.create('span', '', '', self.skuDay(marked[key][0]['time']))
    var daySKUs = self.create('div', { class: '-day_skus' }, '', '')
    var prev = self.create('div', { class: '-prev pos-abs' }, '', '')
    var next = self.create('div', { class: '-next pos-abs' }, '', '')

    // prev.onclick = function () { self.move(prev, (daySKUs.scrollLeft - 300), '-') }
    // next.onclick = function () { self.move(next, (daySKUs.scrollLeft + 300), '+') }
    next.addEventListener('click', function (e) {
      var start = daySKUs.scrollLeft, end = daySKUs.scrollLeft + 300
      self.tween(start, end, 500, self.easeOutQuart, daySKUs);
    });
    prev.addEventListener('click', function (e) {
      var start = daySKUs.scrollLeft, end = daySKUs.scrollLeft - 300
      self.tween(start, end, 500, self.easeOutQuart, daySKUs);
    });

    // prev.onclick = function () { daySKUs.scrollLeft += -300; }
    // next.onclick = function () { daySKUs.scrollLeft += 300; }

    marked[key].forEach(sku => {
      var skuClass = `-sku -sku_${+new Date(sku['time'])}`
      var skuEl = self.create('div', { class: skuClass }, '', '')
      var coming = self.create('span', { class: '-coming pos-abs fs' }, '', '')
      coming.addEventListener('click', () => self.masksFS.classList.add('md-active'))
      var timeTxt = self.twelveHrForm(new Date(sku['time']).getHours())
      var time = self.create('div', { class: '-time' }, '', timeTxt )
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
  if (time === 12) { return time + " pm"; }
  else if (time > 12) { return (time - 12) + " pm"; }
  else if (time === 0) { return 12 + " am" }
  else { return time + " am"; }
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

Sales.prototype.setClock = function (skus) {
  var nextTime = this.nextTime(skus)
  this.setCountDownTxt(nextTime)
  this.initializeClock('clockdiv', nextTime['time'])
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
  var obj = {flag: false, time: keySKUs[0]['time']};
  for (var i = 0; i < keySKUs.length; i++) {
    var startTime = new Date(keySKUs[i]['time'])
    var endTime = new Date(this.endTime(keySKUs[i]['time']))
    if (+this.now >= +startTime && +this.now < +endTime){
      obj = {flag: true, time: keySKUs[i]['time']}
      break
    }
  }
  return obj
}

Sales.prototype.inSession = function (time) {
  var liveSKUS = document.querySelectorAll(`.-sku_${+new Date(time)}`)
  liveSKUS.forEach(sku => {
    var time = sku.querySelector('.-time')
    time.textContent = 'LIVE NOW'
    sku.classList.add('-live')
  })
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
  var self = this, oosSKUs = []
  var uniqueTimes = this.uniqueTimes(grouped)
  uniqueTimes.forEach(uTime => {
    var endTime = self.endTime(uTime)
    var oosSelector = `.-sku_${+new Date(uTime)}`
    if (+self.now > +new Date(endTime)) {
      var oosSKUsEls = document.querySelectorAll(oosSelector)
      parent = null
      oosSKUsEls.forEach(sku => {
        sku.classList.add('-oos')
        oosSKUs.push(sku)
        parent = sku.parentElement
        parent.appendChild(sku)
      })
      self.oosRow(parent)
    }
  })
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