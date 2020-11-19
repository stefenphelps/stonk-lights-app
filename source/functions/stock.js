const axios = require("axios").default;

const getPrice = async function (stock_symbol) {
  try {
    const response = await axios.get(
      "https://finance.yahoo.com/quote/" + stock_symbol + "/"
    );
    var price = response.data
      .split("currentPrice")[1]
      .split('fmt":"')[1]
      .split('"')[0];
    return price;
  } catch (error) {
    console.log(error);
  }
};

exports.getPrice = getPrice;
