function isOpen() {
  var currentDate = new Date();
  var currentDay = currentDate.getUTCDay();

  var currentHour = currentDate.getUTCHours();
  var currentMinute = currentDate.getUTCMinutes();

  var stockMarketOpen = 8;
  var stockMarketCloseHour = 24;
  var stockMarketCloseMinute = 00;

  // weekdays between 9am and 4:30pm EST
  if (currentDay >= 1 && currentDay <= 5) {
    if (currentHour >= stockMarketOpen) {
      if (
        currentHour == stockMarketCloseHour &&
        currentMinute < stockMarketCloseMinute
      ) {
        return true;
      } else if (currentHour < stockMarketCloseHour) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}

exports.isOpen = isOpen;
