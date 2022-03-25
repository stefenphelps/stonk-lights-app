const axios = require('axios').default;

const getPrice = async function (crypto_symbol) {
	try {
		const response = await axios.get(
			'https://api.cryptonator.com/api/ticker/' + crypto_symbol + '-usd'
		);
		var price = response.data.ticker.price;
		return price;
	} catch (error) {
		console.log(error);
	}
};

exports.getPrice = getPrice;
