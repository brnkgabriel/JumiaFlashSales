function initializeClock(id, endTime) {
  var clock = document.getElementById(id)
  var daysSpan = clock.querySelector('.days')
  var hoursSpan = clock.querySelector('.hours')
  var minutesSpan = clock.querySelector('.minutes')
  var secondsSpan = clock.querySelector('.seconds')
  var timeInterval = setInterval(updateClock, 1000)

  function updateClock() {
    var t = getTimeRemaining(endTime, +new Date())
    daysSpan.innerHTML = t['days']
    hoursSpan.innerHTML = ('0' + t['hours']).slice(-2)
    minutesSpan.innerHTML = ('0' + t['minutes']).slice(-2)
    secondsSpan.innerHTML = ('0' + t['seconds']).slice(-2)
    if (t['total'] <= 0) { clearInterval(timeInterval) }
  }
}

function getTimeRemaining(endTime, startTime) {
  var t = Date.parse(endTime) - Date.parse(new Date(startTime))
  var seconds = Math.floor((t / 1000) % 60)
  var minutes = Math.floor((t / 1000 / 60) % 60)
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24)
  var days = Math.floor(t / (1000 * 60 * 60 * 24))

  if (days == 0 && hours == 0 && minutes == 0 && seconds == 0) { window.location.reload(true) }
  return { total: t, days, hours, minutes, seconds }
}

var Main = function () {
  this.sales = null
}

Main.prototype.init = function () {
  this.sales = new Sales()
  var expandedSKUS = this.sales.expand(this.sales.rawSKUs)
  var timeKeys = this.sales.skuTimes(expandedSKUS)
  // var dayKeys = this.sales.skuDays(expandedSKUS)
  var groupedSKUs = this.sales.groupedSKUs(expandedSKUS, timeKeys, 'time')
  this.sales.buildTimeSKUS(groupedSKUs)
  this.sales.setState(groupedSKUs)
  var markedSKUS = this.sales.markAsSold(groupedSKUs)
  
  console.log('markedSKUS', markedSKUS)
  // console.log('expanded', timeKeys)
}

var main = new Main()
main.init()
initializeClock('clockdiv', 'August 25 2019 10:00:00 GMT+0100')