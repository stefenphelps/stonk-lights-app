export default async function(crypto_symbol) {
	try {
		var response = await fetch(
			"https://api.cryptonator.com/api/ticker/" + crypto_symbol + "-usd"
		);
		var price = await response.data.ticker.price;
		return price;
	} catch(error){
		console.log(error);
	}
}