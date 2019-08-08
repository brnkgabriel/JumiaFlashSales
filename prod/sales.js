var Sales = function () {
  this.now = new Date()
  this.GMT = 'GMT+0100'
  this.LIVE_LINK = '/flash-sales-live/'
  this.skusParent = document.querySelector('.-skus')
  this.BOB_IMG_LINK = 'https://ng.jumia.is/cms/8-18/FlashSales'
  this.extraHours = 0
  this.extraMinutes = 38
  this.rawSKUs = [
    `Mama's Pride Rice|25kg|August 08 2019 08:10:00 GMT+0100|9,900|4,990|500|mamas-pride-25kg.jpg`,
    `King's Vegetable Oil|5ltrs|August 08 2019 08:10:00 GMT+0100|4,000|2,000|500|kings-oil.jpg`,
    `Scanfrost Washer|6.8kg|August 08 2019 14:00:00 GMT+0100|41,740|38,990|50|washing-machine.jpg`,
    `Laceup Sneakers|Men|August 08 2019 14:00:00 GMT+0100|41,740|38,990|100|mens-laceup-sneakers.jpg`,
    `Elepaq Generator|4.5KVA|August 08 2019 10:00:00 GMT+0100|4,000,000|1,000,000|100|elepaq-gen-4-5.jpg`,
    `Samsung S10|3GB/16GB|August 08 2019 10:30:00 GMT+0100|4,800,000|1,000,000|100|samsung-s10.jpg`,
    `Kuru Mature Ram|35-40kg|August 08 2019 14:00:00 GMT+0100|80,000|49,990|10|kuru-mature-ram.jpg`,
    `Samsung S10|3GB/16GB|August 09 2019 10:00:00 GMT+0100|4,800,000|1,000,000|100|samsung-s10.jpg`,
    `Sony PS4|500GB|August 09 2019 10:00:00 GMT+0100|4,900,000|1,000,000|100|sony-ps4.jpg`,
    `Sony PS4|500GB|August 10 2019 10:00:00 GMT+0100|5,000,000|1,000,000|100|sony-ps4.jpg`,
    `Samsung S10|3GB/16GB|August 10 2019 10:00:00 GMT+0100|4,800,000|1,000,000|100|samsung-s10.jpg`,
  ]
  this.skus = []
  this.months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  this.daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    this.interval = null
}

Sales.prototype.qSort = function (skus) {
  if (skus.length == 0) { return [] }
  var lesser = [], greater = [], pivot = +new Date(skus[0].split('|')[2])

  for (var i = 1; i < skus.length; i++) {
    var time = +new Date(skus[i].split('|')[2])
    if (time < pivot) { lesser.push(skus[i]) }
    else { greater.push(skus[i]) }
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

Sales.prototype.gmt = function (time) {
  var gmtIdx = time.indexOf('GMT')
  return time.substring(gmtIdx, time.length)
}

Sales.prototype.skuTimes = function (skus) {
  var self = this, skuTimes = skus.map(sku => self.time(sku))
  return Array.from(new Set(skuTimes))
}

Sales.prototype.skuDays = function (skus) {
  var self = this, days = skus.map(sku => self.day(sku))
  return Array.from(new Set(days))
}

Sales.prototype.time = function (sku) { return `time-${+new Date(sku['time'])}` }

Sales.prototype.day = function (sku) {
  var date = new Date(sku['time']).getDate()
  var month = new Date(sku['time']).getMonth()
  var mnth = this.months[month]
  return `day-${mnth.toLowerCase()}-${date}`
}

Sales.prototype.updateGroups = function (skus, groupKeys, type) {
  var groups = {}, self = this, fn = (type === 'time') ? self.time : self.day
  groupKeys.forEach(groupKey => {
    groups[groupKey] = skus.filter(sku => fn.call(self, sku) === groupKey)
  })
  return groups
}

Sales.prototype.groupedSKUs = function (skus, groupKeys, type) { return this.updateGroups(skus, groupKeys, type) }

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

Sales.prototype.setState = function (skus) {
  var keys = Object.keys(skus)
  var firstTime = skus[keys[0]][0]['time']
  var firstStartTime = new Date(firstTime)
  var lastIdx = keys.length - 1
  var lastSKUS = skus[keys[lastIdx]]
  var lastTime = lastSKUS[lastSKUS.length - 1]['time']
  var lastEndTime = new Date(this.endTime(lastTime))

  if (+this.now < +firstStartTime) { this.b41stSession(keys) }
  else if (+this.now > +lastEndTime) { this.aftrLastSession() }
  else { this.inAndBtwSessions(skus) }
}

Sales.prototype.b41stSession = function (keys) {
  console.log('before first session')
  var nextTime = this.nextTime(keys)
  this.setCountDownTxt(nextTime)
  this.initializeClock('clockdiv', nextTime['time'])
}

Sales.prototype.setCountDownTxt = function (nextTime) {
  var countDownTxt = document.querySelector('#clockdiv>h3')
  if (nextTime['type'] === 'start') { countDownTxt.textContent = 'next sale starts in' }
  else { countDownTxt.textContent = 'current sale ends in' }
}

Sales.prototype.aftrLastSession = function () {
  var counts = document.querySelectorAll('.frame-wrap>div>div>div:first-of-type')
  counts.forEach(count => count.setAttribute('style', 'display: none'))
}

Sales.prototype.inAndBtwSessions = function (skus) {
  console.log('in and between session')
  var keys = Object.keys(skus), isInSess = false, liveTime = -1
  for (var x = 0; x < keys.length; x++) {
    var keySKUs = skus[keys[x]]; isInSess = this.isInSession(keySKUs)
    if (isInSess['flag']) { liveTime = isInSess['time']; break }
  }
  (isInSess['flag']) ? this.inSession(liveTime) : this.btwSession()
  var nextTime = this.nextTime(keys)
  this.setCountDownTxt(nextTime)
  this.initializeClock('clockdiv', nextTime['time'])
}

Sales.prototype.nextTime = function (keys) {
  var self = this, timesEndTimes = [], nextTime = +new Date()
  var times = keys.map(key => parseInt(key.split('-')[1]))
  for (var i = 0; i < times.length; i++) {
    timesEndTimes.push({ type: 'start', time: times[i] })
    var endTime = +new Date(this.endTime(times[i]))
    timesEndTimes.push({ type: 'end', time: endTime })
  }
  console.log('timesEndTimes', timesEndTimes)
  var comingTimes = timesEndTimes.filter($tme => +self.now < $tme['time'])
  if (times.length > 0) { nextTime = comingTimes[0] }
  return nextTime
}

Sales.prototype.isInSession = function (keySKUs) {
  var flag = false, time = -1
  for (var i = 0; i < keySKUs.length; i++) {
    var startTime = new Date(keySKUs[i]['time'])
    var endTime = new Date(this.endTime(keySKUs[i]['time']))
    if (+this.now >= +startTime && +this.now < +endTime) { flag = true; time = +new Date(keySKUs[i]['time']); break; }
  }
  return { flag, time }
}

Sales.prototype.inSession = function (liveTime) {
  var sku = document.getElementById(`time-${liveTime}`)
  sku.classList.add('-live')
  var time = sku.querySelector('.-dt.-time')
  time.textContent = 'live now'
}

Sales.prototype.btwSession = function () { console.log('between session') }

// the name of this function is because we're grouping by time
// if we're grouping by days it'll be buildDaySKUS
Sales.prototype.buildTimeSKUS = function (marked) {
  var self = this
  Object.keys(marked).forEach(key => {
    var keyPieces = key.split('-')
    var time = (keyPieces.length == 3) ? keyPieces[2] : keyPieces[1]
    var timeFormat = new Date(parseInt(time))
    var sku = self.create('div', { class: '-sku inline-block', id: key }, '', '')
    var top = self.create('div', { class: '-top' }, '', '')
    var dateTime = self.create('div', { class: '-date_time pos-rel' }, '', '')
    var date = self.create('div', { class: '-dt -date pos-abs' }, '', self.dateAndTime(timeFormat)['date'])
    var time = self.create('div', { class: '-dt -time pos-abs' }, '', self.dateAndTime(timeFormat)['time'])

    var nameDescUnits = self.create('div', { class: '-name-desc_units inline-block' }, '', '')
    var name = self.create('div', { class: '-name' }, '', marked[key][0]['name'])
    var descUnits = self.create('div', { class: '-desc_units' }, '', '')
    var desc = self.create('div', { class: '-desc inline-block' }, '', marked[key][0]['desc'])
    var units = self.create('div', { class: '-units inline-block' }, '', `${marked[key][0]['units']} units`)

    var middle = self.create('a', { href: self.LIVE_LINK, class: '-middle pos-rel' }, '', '')
    var shadow = self.create('div', { class: '-shadow pos-abs' }, '', '')
    var iwClass = '';
    (keyPieces.length == 3) ? iwClass = '-img -oos' : iwClass = '-img'
    var imgWrap = self.create('div', { class: iwClass }, '', '')
    marked[key].forEach((sku, idx) => {
      var img = self.create('img', {
        src: `${self.BOB_IMG_LINK}/${sku['img']}`,
        alt: 'sku_img', class: `img-${idx}`,
        class: (idx === 0) ? '-img_el active' : '-img_el'
      }, '', '')
      imgWrap.appendChild(img)
    })

    var bottom = self.create('div', { class: '-bottom' }, '', '')
    var prices = self.create('div', { class: '-prices inline-block' }, '', '')
    var oldPrice = self.create('div', { class: '-old_price' }, '', `₦${marked[key][0]['oldPrice']}`)
    var newPrice = self.create('div', { class: '-new_price' }, '', `₦${marked[key][0]['newPrice']}`)
    var controls = self.create('div', { class: '-controls pos-rel' }, '', '')
    var prev = self.create('div', { class: '-control -prev pos-abs' }, '', '')
    var next = self.create('div', { class: '-control -next pos-abs' }, '', '')
    var count = self.create('div', { class: '-control -count pos-abs' }, '', '')
    var countSpan = self.create('span', '', '', '15/15')

    count.appendChild(countSpan)

    self.appendMany2One(dateTime, [date, time])
    self.appendMany2One(descUnits, [desc, units])
    self.appendMany2One(nameDescUnits, [name, descUnits])
    self.appendMany2One(top, [dateTime, nameDescUnits])
    self.appendMany2One(middle, [shadow, imgWrap])
    self.appendMany2One(prices, [oldPrice, newPrice])
    self.appendMany2One(controls, [prev, next, count])
    self.appendMany2One(bottom, [prices, controls])
    self.appendMany2One(sku, [top, middle, bottom])
    self.skusParent.appendChild(sku)
  })
}

Sales.prototype.append = function (parents, kids) { parents.forEach((parent, idx) => parent.appendChild(kids[idx])) }

Sales.prototype.appendMany2One = function (one, many) { many.forEach(item => one.appendChild(item)) }

Sales.prototype.markAsSold = function (grouped) {
  var self = this, outOfStockSKUs = []
  Object.keys(grouped).forEach(key => {
    var timeTxtNo = key.split('-'), time = parseInt(timeTxtNo[1])
    var endTime = self.endTime(time)
    if (+self.now >= +new Date(endTime)) {
      var outOfStockSKU = document.getElementById(`time-${timeTxtNo[1]}`)
      outOfStockSKU.classList.add('-oos')
      outOfStockSKUs.push(outOfStockSKU)
      self.skusParent.removeChild(outOfStockSKU)
    }
  })
  outOfStockSKUs.forEach(sku => self.skusParent.appendChild(sku))
}

Sales.prototype.create = function (tag, attributes, styles, textContent) {
  var element = document.createElement(tag);
  Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]));
  Object.keys(styles).forEach(key => element.setAttribute(key, styles[key]));
  textContent ? element.innerHTML = textContent : "";
  return element;
}

Sales.prototype.preppedDate = function (date) {
  return `${this.daysOfWeek[date.getDay()]} ${this.months[date.getMonth()].substr(0, 3)} ${date.getDate()}`
}

Sales.prototype.twelveHrFormat = function (hr, min) {
  if (hr === 12) { return this.pad(hr) + ":" + this.pad(min) + " PM"; }
  else if (hr > 12) { return this.pad((hr - 12)) + ":" + this.pad(min) + " PM"; }
  else if (hr === 0) { return 12 + ":" + this.pad(min) + " AM" }
  else { return this.pad(hr) + ":" + this.pad(min) + " AM"; }
}

Sales.prototype.dateAndTime = function (date) {
  return {
    date: this.preppedDate(date),
    time: this.twelveHrFormat(date.getHours(), date.getMinutes())
  }
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

// prev and next listeners
Sales.prototype.addListeners = function (groupedSKUs) {
  var self = this
  var skus = document.querySelectorAll('.-sku')
  // fill up image count
  skus.forEach(sku => {
    var images = sku.querySelectorAll('.-img_el')
    var countEl = sku.querySelector('.-count>span')
    countEl.textContent = `1 / ${images.length}`
    var prevBtn = sku.querySelector('.-prev')
    var nextBtn = sku.querySelector('.-next')
    if (images.length == 1) {
      prevBtn.setAttribute('style', 'display: none')
      nextBtn.setAttribute('style', 'display: none')
    }

    sku.addEventListener('mouseover', function () { self.stopTimer() })
    sku.addEventListener('mouseout', function () { self.startTimer(groupedSKUs) })

    prevBtn.addEventListener('click', function () {
      self.updateSKU(sku, 'prev', groupedSKUs)
    })

    nextBtn.addEventListener('click', function () {
      self.updateSKU(sku, 'next', groupedSKUs)
    })
  })
}

Sales.prototype.updateSKU = function (sku, type, groupedSKUs) {
  var images = sku.querySelectorAll('.-img_el')
  var countEl = sku.querySelector('.-count>span')
  images.forEach(img => img.classList.remove('active'))
  var currentIdx = this.getIdx(countEl)
  var idx = this.updateIdx(currentIdx, images, countEl, type)
  this.updateInfo(sku, groupedSKUs, idx)
  images[idx].classList.add('active')
}

Sales.prototype.updateInfo = function (sku, groupedSKUs, idx) {
  var skuId = sku.getAttribute('id')
  var nextSKUData = groupedSKUs[skuId][idx]
  sku.querySelector('.-name').textContent = nextSKUData['name']
  sku.querySelector('.-desc').textContent = nextSKUData['desc']
  sku.querySelector('.-units').textContent = `${nextSKUData['units']} units`
  sku.querySelector('.-old_price').textContent = `₦${nextSKUData['oldPrice']}`
  sku.querySelector('.-new_price').textContent = `₦${nextSKUData['newPrice']}`
}

Sales.prototype.getIdx = function (el) 
{ return el.textContent.split('/')[0].trim() }

Sales.prototype.updateIdx = function (currentIdx, images, countEl, type) {
  type === 'next' ? currentIdx++ : currentIdx--
  if (currentIdx > images.length) { currentIdx = 1 }
  if (currentIdx < 1) { currentIdx = images.length }
  countEl.textContent = `${currentIdx} / ${images.length}`
  return currentIdx - 1
}

Sales.prototype.startTimer = function (groupedSKUs) {
  var self = this, skus = document.querySelectorAll('.-sku')
  this.interval = setInterval(() => {
    skus
      .forEach(sku => { self.updateSKU(sku, 'next', groupedSKUs) })
  }, 2500);
}

Sales.prototype.stopTimer = function ()
{ clearInterval(this.interval) }