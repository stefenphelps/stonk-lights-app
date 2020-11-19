function isOpen() {
  var currentDate = new Date();
  var currentDay = currentDate.getUTCDay();

  var currentHour = currentDate.getUTCHours();
  var currentMinute = currentDate.getUTCMinutes();

  var stockMarketOpen = 13;
  var stockMarketCloseHour = 20;
  var stockMarketCloseMinute = 30;

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
