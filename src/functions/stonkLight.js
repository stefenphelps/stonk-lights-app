function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function (
	light,
	previousPrice,
	currentPrice
) {
	if (currentPrice > previousPrice) {
		// if stock goes up...
		try {
			light.setColor(0, 128, 0); // green
			console.log("Light color => green");
			await sleep(3000);
		} catch (e) {
			console.log(
				`Something happened while changing light to green ${e}`
			);
		}
	} else if (currentPrice == previousPrice) {
		// if price doesn't change
		try {
			light.setColor(255, 255, 255); // white
			await sleep(3000);
		} catch (e) {
			console.log(
				`Something happened while changing the light to white ${e}`
			);
		}
	} else {
		// if price goes down...
		try {
			light.setColor(255, 0, 0); // red
			console.log("Light color => red");
			await sleep(3000);
		} catch (e) {
			console.log(
				`Something happened while changing the light to red ${e}`
			);
		}
	}
}