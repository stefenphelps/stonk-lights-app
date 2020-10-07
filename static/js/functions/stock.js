export default async function(stock_symbol) {
	try {
		var response = await fetch(
			"https://finance.yahoo.com/quote/" + stock_symbol + "/"
		);
		var price = await response.data
			.split("currentPrice")[1]
			.split('fmt":"')[1]
			.split('"')[0];
		return price;
	} catch(error){
		console.log(error);
	}
}
