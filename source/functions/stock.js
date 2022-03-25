const axios = require('axios').default;

const getPrice = async function (stock_symbol) {
	try {
		const response = await axios.get(
			'https://finance.yahoo.com/quote/' + stock_symbol + '/'
		);
		var currentPrice = response.data
			.split('currentPrice')[1]
			.split('fmt":"')[1]
			.split('"')[0];
		var previousCloseprice = response.data
			.split('summaryDetail')[1]
			.split('previousClose')[1]
			.split('fmt":"')[1]
			.split('"')[0];
		var price = [currentPrice, previousCloseprice];
		return price;
	} catch (error) {
		console.log(error);
	}
};

exports.getPrice = getPrice;
