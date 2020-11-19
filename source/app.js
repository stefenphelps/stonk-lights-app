const { Control, Discovery } = require("magic-home");
const cryptocoins = require("./functions/cryptocoins.js");
const stock = require("./functions/stock.js");
const stockMarket = require("./functions/stockMarket.js");
const stonkLight = require("./functions/stonkLight.js");

// UI Variables
var loadingIndicator = document.querySelector(".scanning");
var lightTemplate = document.querySelector("#lights-item");
var lightsContainer = document.querySelector(".lights");
var lightSettingsTemplate = document.querySelector("#light-settings");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// scan for lights on network
var discovery = new Discovery();
discovery.scan(500).then((devices) => {
  // find all lights on network
  loadingIndicator.classList.add("hidden");

  devices.forEach(function (device, index) {
    // turn light on and initialize stonks
    var light = new Control(device.address);
    light.setPower(true).then((success) => {
      var lightButton = lightTemplate.content.cloneNode(true);
      lightButton.querySelector(".lights-item").id = "light-button-" + index;
      lightsContainer.appendChild(lightButton);

      var lightSettings = document.importNode(
        lightSettingsTemplate.content,
        true
      );
      lightSettings.querySelector(".dialog").id = "dialog-" + index;
      document.body.appendChild(lightSettings);

      var stockInput = document.querySelector(
        "#dialog-" + index + " input#stock"
      );
      var stockLabel = document.querySelector(
        "#dialog-" + index + ' label[for="stock"]'
      );
      var cryptoInput = document.querySelector(
        "#dialog-" + index + " input#crypto"
      );
      var cryptoLabel = document.querySelector(
        "#dialog-" + index + ' label[for="crypto"]'
      );
      var symbolInput = document.querySelector(
        "#dialog-" + index + " input#symbol"
      );
      var symbolLabel = document.querySelector(
        "#dialog-" + index + ' label[for="symbol"]'
      );

      stockInput.setAttribute("id", "stock-" + index);
      stockLabel.setAttribute("for", "stock-" + index);
      cryptoInput.setAttribute("id", "crypto-" + index);
      cryptoLabel.setAttribute("for", "crypto-" + index);
      symbolInput.setAttribute("id", "symbol-" + index);
      symbolLabel.setAttribute("for", "symbol-" + index);

      // open Settings popup
      var thelightbutton = document.querySelectorAll(".lights-item")[index];
      thelightbutton.addEventListener("click", function () {
        // opens modal
        document.querySelector("#dialog-" + index).showModal();

        // shows the next inputs after selection
        var category_inputs = document.querySelectorAll(
          ".category-fieldset-items input"
        );
        var symbol_fieldset = document.querySelector(".symbol-fieldset");
        var symbol_input = document.querySelector(".symbol-fieldset input");
        var start_button = document.querySelector(".start-button");
        category_inputs.forEach(function (item) {
          item.addEventListener("click", function () {
            symbol_fieldset.style = "display: block";
            var current_category = this.value;
            document.querySelector(
              ".symbol-text"
            ).textContent = current_category;
          });
        });

        symbol_input.addEventListener("keyup", function () {
          start_button.style = "display: block;";
        });

        var startButton = document.querySelector(
          "#dialog-" + index + " .start-button"
        );
        startButton.addEventListener("click", function () {
          // symbol_input.value
          document.querySelector(
            "#light-button-" + index + " span"
          ).textContent = symbol_input.value;
          document.querySelector("#dialog-" + index).close();
          // todo: update these variables with the current input value in the current dialog popup
          var isCrypto = false;
          var symbol = "TSLA";
          theLoop(light, isCrypto, symbol);
        });
      });
    });
  });
});

async function theLoop(light, crypto, symbol) {
  var oldPrice = 0;
  var newPrice = 0;
  if (crypto) {
    while (crypto) {
      // first loop
      if (oldPrice == 0) {
        oldPrice = await cryptocoins.getPrice(symbol);
      } else {
        await sleep(31000);
        // every loop after first
        newPrice = await cryptocoins.getPrice(symbol);
        console.log({ newPrice });
        await stonkLight.colorChange(light, newPrice, oldPrice);
        await sleep(31000);
        oldPrice = await cryptocoins.getPrice(symbol);
        console.log({ oldPrice });
      }
    }
  } else {
    while (stockMarket.isOpen()) {
      // first loop
      if (oldPrice == 0) {
        oldPrice = await stock.getPrice(symbol);
      } else {
        // every loop after first
        await sleep(2000);
        newPrice = await stock.getPrice(symbol);
        await stonkLight.colorChange(light, newPrice, oldPrice);
        await sleep(2000);
        oldPrice = await stock.getPrice(symbol);
      }
    }
  }
}
