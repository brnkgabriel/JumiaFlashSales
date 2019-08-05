// var sku = {
//   name: "Men's Sneakers",
//   desc: "Black",
//   time: "July 05 2019 10:00:00 GMT+0100",
//   oldPrice: "4,000,000",
//   newPrice: '1,000,000',
//   units: '100'
// }

var Sales = function () {
  this.now = new Date('August 27 2019 10:58:00 GMT+0100')
  this.GMT = 'GMT+0100'
  this.LIVE_LINK = '/flash-sales-live/'
  this.skusParent = document.querySelector('.-skus')
  this.BOB_IMG_LINK = './'
  this.extraHours = 0
  this.extraMinutes = 58
  this.rawSKUs = [
    `Elepaq Generator|4.5KVA|August 25 2019 10:00:00 GMT+0100|4,000,000|1,000,000|100|elepaq-gen-4-5.jpg`,
    `Samsung S10|3GB/16GB|August 26 2019 10:00:00 GMT+0100|4,000,000|1,000,000|100|samsung-s10.jpg`,
    `Sony PS4|500GB|August 26 2019 10:00:00 GMT+0100|4,000,000|1,000,000|100|sony-ps4.jpg`,
    `Sony PS4|500GB|August 27 2019 10:00:00 GMT+0100|4,000,000|1,000,000|100|sony-ps4.jpg`,
  ]
  this.skus = []
  this.months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August','September',
    'October', 'November', 'December'
  ]
  this.daysOfWeek = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ]
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
  var self = this
  var skuTimes = skus.map(sku => self.time(sku))
  return Array.from(new Set(skuTimes))
}

Sales.prototype.skuDays = function (skus) {
  var self = this
  var days = skus.map(sku => self.day(sku))
  return Array.from(new Set(days))
}

Sales.prototype.time = function (sku) 
{ return `time-${+new Date(sku['time'])}` }

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

Sales.prototype.groupedSKUs = function (skus, groupKeys, type) 
{ return this.updateGroups(skus, groupKeys, type) }

// todo:
// handle situation when hr + exHrs is greater than 24
// handle situation when hr + exMns is greater than 60
Sales.prototype.endTime = function (time) {
  var date = new Date(time), mt = this.months[date.getMonth()]
  var dt = date.getDate(), yr = date.getFullYear(), hr = date.getHours()
  var mn = date.getMinutes(), sc = date.getSeconds()
  return `${mt} ${dt} ${yr} ${this.pad(hr + this.extraHours)}:${this.pad(mn + this.extraMinutes)}:${this.pad(sc)} ${this.GMT}`
}

Sales.prototype.pad = function (time) 
{ return ('0' + time).slice(-2) }

Sales.prototype.setState = function (skus) {
  var keys = Object.keys(skus)
  var firstTime = skus[keys[0]][0]['time']
  var firstStartTime = new Date(firstTime)
  var lastIdx = keys.length - 1
  var lastSKUS = skus[keys[lastIdx]]
  var lastTime = lastSKUS[lastSKUS.length - 1]['time']
  var lastEndTime = new Date(this.endTime(lastTime))

  if (+this.now < +firstStartTime) { this.b41stSession() }
  else if (+this.now > +lastEndTime) { this.aftrLastSession() }
  else { this.inAndBtwSessions(skus) }
}

Sales.prototype.b41stSession = function() { console.log('before first session') }

Sales.prototype.aftrLastSession = function () { console.log('after last session') }


// The liveIdx will always be 0 because the marked skus pushes oos skus below
// Therefore it's not necessary to assign x to liveIdx (liveIdx = x)
// When it's in session idx will always be 0. When it goes oos what's on top
// goes down and the 2nd in the list takes the first place
Sales.prototype.inAndBtwSessions = function (skus) {
  var keys = Object.keys(skus), isInSess = false, liveTime = -1
  for (var x = 0; x < keys.length; x++) {
    var keySKUs = skus[keys[x]]
    isInSess = this.isInSession(keySKUs)
    if (isInSess['flag']) {liveTime = isInSess['time']; break }
  }
  (isInSess['flag']) ? this.inSession(liveTime) : this.btwSession()
}

Sales.prototype.isInSession =  function (keySKUs) {
  var flag = false, time = -1
  for (var i = 0; i < keySKUs.length; i++) {
    var startTime = new Date(keySKUs[i]['time'])
    var endTime = new Date(this.endTime(keySKUs[i]['time']))
    if (+this.now >= +startTime && +this.now < +endTime)
    { flag = true; time = +new Date(keySKUs[i]['time']); break; }
  }
  return { flag, time }
}

Sales.prototype.inSession = function (liveTime) {
  var skus = Array.from(document.querySelectorAll('.-sku'))
  var sku = document.getElementById(`time-${liveTime}`)
  sku.classList.add('-live')
}

Sales.prototype.btwSession = function () { console.log('between session') }

Sales.prototype.buildTimeSKUS = function (marked) {
  var self = this
  Object.keys(marked).forEach(key => {
    var keyPieces = key.split('-')
    var time = (keyPieces.length == 3) ? keyPieces[2] : keyPieces[1]

    var timeFormat = new Date(parseInt(time))
    var sku = self.create('div', {
      class: '-sku inline-block',
      id: key
    }, '', '')
    var top = self.create('div', {
      class: '-top'
    }, '', '')
    var dateTime = self.create('div', {
      class: '-date_time pos-rel'
    }, '', '')
    var date = self.create('div', {
      class: '-dt -date pos-abs'
    }, '', self.dateAndTime(timeFormat)['date'])
    var time = self.create('div', {
      class: '-dt -time pos-abs'
    }, '', self.dateAndTime(timeFormat)['time'])
    
    var nameDescUnits = self.create('div', {
      class: '-name-desc_units inline-block'
    }, '', '')
    var name = self.create('div', {
      class: '-name'
    }, '', marked[key][0]['name'])
    var descUnits = self.create('div', {
      class: '-desc_units'
    }, '', '')
    var desc = self.create('div', {
      class: '-desc inline-block'
    }, '', marked[key][0]['desc'])
    var units = self.create('div', {
      class: '-units inline-block'
    }, '', marked[key][0]['units'])

    var middle = self.create('a', {
      href: self.LIVE_LINK,
      class: '-middle pos-rel'
    }, '', '')
    var shadow = self.create('div', {
      class: '-shadow pos-abs'
    }, '', '')
    var iwClass = '';
    (keyPieces.length == 3) ? iwClass = '-img -oos' : iwClass = '-img'
    var imgWrap = self.create('div', {
      class: iwClass
    }, '', '')
    marked[key].forEach((sku, idx) => {
      var img = self.create('img', {
        src: `${self.BOB_IMG_LINK}/${sku['img']}`,
        alt: 'sku_img',
        class: `img-${idx}`
      }, '', '')
      imgWrap.appendChild(img)
    })

    var bottom = self.create('div', {
      class: '-bottom'
    }, '', '')
    var prices = self.create('div', {
      class: '-prices inline-block'
    }, '', '')
    var oldPrice = self.create('div', {
      class: '-old_price'
    }, '', marked[key][0]['oldPrice'])
    var newPrice = self.create('div', {
      class: '-new_price'
    }, '', marked[key][0]['newPrice'])
    var controls = self.create('div', {
      class: '-controls pos-rel'
    }, '', '')
    var prev = self.create('div', {
      class: '-control -prev pos-abs'
    }, '', '')
    var next = self.create('div', {
      class: '-control -next pos-abs'
    }, '', '')
    var count = self.create('div', {
      class: '-control -count pos-abs'
    }, '', '')

    dateTime.appendChild(date)
    dateTime.appendChild(time)
    
    descUnits.appendChild(desc)
    descUnits.appendChild(units)

    nameDescUnits.appendChild(name)
    nameDescUnits.appendChild(descUnits)

    top.appendChild(dateTime)
    top.appendChild(nameDescUnits)

    middle.appendChild(shadow)
    middle.appendChild(imgWrap)

    prices.appendChild(oldPrice)
    prices.appendChild(newPrice)

    controls.appendChild(prev)
    controls.appendChild(next)
    controls.appendChild(count)

    bottom.appendChild(prices)
    bottom.appendChild(controls)

    sku.appendChild(top)
    sku.appendChild(middle)
    sku.appendChild(bottom)
    self.skusParent.appendChild(sku)
  })
}

Sales.prototype.markAsSold = function (grouped) {
  var self = this, outOfStockSKUs = []
  Object.keys(grouped).forEach(key => {
    var timeTxtNo = key.split('-'), time = parseInt(timeTxtNo[1])
    var endTime = self.endTime(time)
    if (+self.now >= +new Date(endTime)) 
    {
      // todo: remove the oos skus from their position and append them to the end of the sku parent
      // var newKey = `${timeTxtNo[0]}-oos-${timeTxtNo[1]}`
      // grouped[newKey] = grouped[key]; delete grouped[key]
      var outOfStockSKU = document.getElementById(`time-${timeTxtNo[1]}`)
      outOfStockSKU.classList.add('-oos')
      outOfStockSKUs.push(outOfStockSKU)
      self.skusParent.removeChild(outOfStockSKU)
    }    
  })
  outOfStockSKUs.forEach(sku => self.skusParent.appendChild(sku))
  return grouped
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
// // non-auto
// function setChatState(cwEl, tmEl, lTimes, now, vbles, exHrs, exMns, dbDurs) {
//   var firstStartTime = new Date(lTimes[0])
//   var lastTime = lTimes[lTimes.length - 1]
//   var lastEndTime = new Date(timeRange(lastTime, exHrs, exMns, vbles.months)['endTime'])

//   if (+now < +firstStartTime) { b4FirstSession(cwEl, tmEl, lTimes[0], now, dbDurs) }
//   else if (+now > +lastEndTime) { aftrLastSession(cwEl, dbDurs) }
//   else { inAndBtwSessions(cwEl, tmEl, lTimes, now, vbles, exHrs, exMns, dbDurs) }
// }

// function b4FirstSession(chtWdg, tmEl, fstTime, now, dbDurs) {
//   console.log('b4FirstSession')
//   dbDurs.forEach(dbDur => dbDur['listener']())
//   tmEl.classList.add('-not_time')
//   chtWdg.classList.add('-not_time')
//   initializeClock('clockdiv', fstTime, +now);
// }

// function aftrLastSession(chtWdg, dbDurs) {
//   console.log('aftrLastSession')
//   dbDurs.forEach(dbDur => dbDur['listener']())
//   chtWdg.classList.add('-not_time')
//   var timeDigits = document.querySelectorAll('.-time_digit')
//   timeDigits.forEach(el => el.setAttribute('style', 'display: none'))
//   var sessionInfo = document.querySelector('.-session_info')
//   sessionInfo.textContent = 'Jumia Live Giveaways are Ended'
// }

// function inAndBtwSessions(chtWdg, tmEl, lTimes, now, vbles, exHrs, exMns, dbDurs) {
//   console.log('inAndBtwSessions')
//   var timeIdx = -1, startTime, endTime
//   for (var x = 0; x < lTimes.length; x++) {
//     startTime = new Date(timeRange(lTimes[x], exHrs, exMns, vbles.months)['startTime'])
//     endTime = new Date(timeRange(lTimes[x], exHrs, exMns, vbles.months)['endTime'])
//     if (+now >= +startTime && +now < +endTime) {
//       timeIdx = x; break;
//     }
//   }

//   if (timeIdx !== -1) { inSession(chtWdg, tmEl, endTime, now) }
//   else { btwSessions(chtWdg, tmEl, lTimes, vbles, exHrs, exMns, now, dbDurs) }
// }

// function inSession(chtWdg, tmEl, endTime, now) {
//   console.log('inSession')
//   chtWdg.classList.remove('-not_time')
//   tmEl.classList.remove('-not_time')
//   var sessionInfo = document.querySelector('.-session_info')
//   sessionInfo.textContent = 'current session ends in:'
//   initializeClock('clockdiv', endTime, +now);
// }

// function btwSessions(chtWdg, tmEl, lTimes, vbles, exHrs, exMns, now, dbDurs) {
//   console.log('btwSessions')
//   dbDurs.forEach(dbDur => dbDur['listener']())
//   var nextIdx = 0
//   for (var i = 0; i < lTimes.length; i++) {
//     var endTime = timeRange(lTimes[i], exHrs, exMns, vbles.months)['endTime']
//     if (
//       i !== (lTimes.length - 1) &&
//       +now >= +new Date(endTime) &&
//       +now <= +new Date(lTimes[i + 1])
//     ) { nextIdx = i + 1; break; }
//   }
//   chtWdg.classList.add('-not_time')
//   tmEl.classList.add('-not_time')
//   var sessionInfo = document.querySelector('.-session_info')
//   sessionInfo.textContent = 'next session starts in:'
//   initializeClock('clockdiv', lTimes[nextIdx], +now);
// }