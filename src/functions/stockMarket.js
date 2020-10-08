export default function() {
	var format = "hh:mm:ss";
	var currentDay = Date.now();
	var stockMarketOpen = "09:30:00"
	var stockMarketClose = "16:00:00"
	var time = "America/New_York";
	// var currentDay = moment().tz("America/New_York").day();
	// var stockMarketOpen = moment("09:30:00", format).tz("America/New_York");
	// var stockMarketClose = moment("16:00:00", format).tz("America/New_York");
	// var time = moment().tz("America/New_York");
	// weekdays between 9am and 4:30pm
	if (
		currentDay >= 1 &&
		currentDay <= 5 &&
		time.isBetween(stockMarketOpen, stockMarketClose)
	) {
		return true;
	} else {
		return false;
	}
}