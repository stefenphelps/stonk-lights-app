const { Control, Discovery } = require('magic-home');
const cryptocoins = require('./functions/cryptocoins.js');
const stock = require('./functions/stock.js');
const stockMarket = require('./functions/stockMarket.js');
const stonkLight = require('./functions/stonkLight.js');

// UI Variables
var loadingIndicator = document.querySelector(".scanning");
var lightTemplate = document.querySelector("#lights-item");
var lightsContainer = document.querySelector(".lights");
var lightSettingsTemplate = document.querySelector("#light-settings");

// todo: connect light to network

// scan for lights on network
var discovery = new Discovery();
discovery.scan(500).then((devices) => {
  // find all lights on network
  loadingIndicator.classList.add("hidden");
  
  devices.forEach(function(device, index) {
    // turn light on and initialize stonks
    var light = new Control(device.address);
    light.setPower(true).then((success) => {

      var light = lightTemplate.content.cloneNode(true);
      lightsContainer.appendChild(light);

      var lightSettings = lightSettingsTemplate.content.cloneNode(true);
      document.body.appendChild(lightSettings);
    
      var stockInput = dialogs[index].querySelector("input#stock");
      var stockLabel = dialogs[index].querySelector('label[for="stock"]');
      var cryptoInput = dialogs[index].querySelector("input#crypto");
      var cryptoLabel = dialogs[index].querySelector('label[for="crypto"]');
      var symbolInput = dialogs[index].querySelector("input#symbol");
      var symbolLabel = dialogs[index].querySelector('label[for="symbol"]');
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
        dialogs[index].showModal();
  
        // shows the next inputs after selection
        var category_inputs = dialogs[index].querySelectorAll(
          ".category-fieldset-items input"
        );
        var symbol_fieldset = dialogs[index].querySelector(".symbol-fieldset");
        var symbol_input = dialogs[index].querySelector(".symbol-fieldset input");
        var start_button = dialogs[index].querySelector(".start-button");
        category_inputs.forEach(function (item) {
          item.addEventListener("click", function () {
            symbol_fieldset.style = "display: block";
            var current_category = this.value;
            dialogs[index].querySelector(
              ".symbol-text"
            ).textContent = current_category;
          });
        });
  
        symbol_input.addEventListener("keyup", function () {
          start_button.style = "display: block;";
        });
  
        var startButton = dialogs[index].querySelector(".start-button");
        startButton.addEventListener("click", function () {
          // symbol_input.value
          item.querySelector("span").textContent = symbol_input.value;
          dialogs[index].close();
        });
      });
      var isCrypto = true;
      var symbol = "btc";
      theLoop(light, crypto, symbol);
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
        await stonkLight.colorChange(light, newPrice, oldPrice);
        oldPrice = await cryptocoins.getPrice(symbol);
      }
    }
  } else {
    while (stockMarket.isOpen()) {
      // first loop
      if (oldPrice == 0) {
        oldPrice = await stock.getPrice(symbol);
      } else {
        // every loop after first
        newPrice = await stock.getPrice(symbol);
        await stonkLight.colorChange(light, newPrice, oldPrice);
        oldPrice = await stock.getPrice(symbol);
      }
    }
  }
}
