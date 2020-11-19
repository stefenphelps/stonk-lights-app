const colorChange = async function (light, previousPrice, currentPrice) {
  if (currentPrice > previousPrice) {
    // if stock goes up...
    try {
      light.setColor(0, 128, 0); // green
      console.log("Light color => green");
    } catch (e) {
      console.log(`Something happened while changing light to green ${e}`);
    }
  } else if (currentPrice == previousPrice) {
    // if price doesn't change
    try {
      light.setColor(255, 255, 255); // white
      console.log("Light color => white");
    } catch (e) {
      console.log(`Something happened while changing the light to white ${e}`);
    }
  } else {
    // if price goes down...
    try {
      light.setColor(255, 0, 0); // red
      console.log("Light color => red");
    } catch (e) {
      console.log(`Something happened while changing the light to red ${e}`);
    }
  }
};

exports.colorChange = colorChange;
