var Main = function () {
  this.sales = null
}

Main.prototype.init = function () {
  this.sales = new Sales()
  var sortedSKUS = this.sales.qSort(this.sales.rawSKUs)
  var expandedSKUS = this.sales.expand(sortedSKUS)
  var timeKeys = this.sales.skuTimes(expandedSKUS)
  // var dayKeys = this.sales.skuDays(expandedSKUS)
  var groupedSKUs = this.sales.groupedSKUs(expandedSKUS, timeKeys, 'time')
  this.sales.buildTimeSKUS(groupedSKUs)
  this.sales.setState(groupedSKUs)
  this.sales.addListeners(groupedSKUs)
  var markedSKUS = this.sales.markAsSold(groupedSKUs)
  this.sales.startTimer(groupedSKUs)
  console.log('markedSKUS', markedSKUS)
  // console.log('expanded', timeKeys)
}

var main = new Main()
main.init()