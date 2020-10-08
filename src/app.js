var { Control, Discovery } = require('magic-home');
var cryptocoins = require("./functions/cryptocoins");
var stock = require("./functions/stock");
var stockMarket = require("./functions/stockMarket");
var stonkLight = require("./functions/stonkLight");

var discovery = new Discovery();
discovery.scan(500).then((devices) => {
  // find all lights on network
  for (var device of devices) {
    // turn light on and initialize stonks
    var light = new Control(device.address);
    light.setPower(true).then((success) => {
      // TODO: need to update these two variables based on the model popup for each stonk light
      var isCrypto = true;
      var symbol = "btc";
      theLoop(light, crypto, symbol);
    });
  }
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

// UI Variables
var loadingIndicator = document.querySelector(".scanning");
var lightTemplate = document.querySelector("#lights-item");
var lightsContainer = document.querySelector(".lights");
var lightSettingsTemplate = document.querySelector("#light-settings");

// todo: move this to loop when looping through each light that was discovered
setTimeout(function () {
  var light1 = lightTemplate.content.cloneNode(true);
  lightsContainer.appendChild(light1);
  var light1settings = lightSettingsTemplate.content.cloneNode(true);
  document.body.appendChild(light1settings);

  var light2 = lightTemplate.content.cloneNode(true);
  lightsContainer.appendChild(light2);
  var light2settings = lightSettingsTemplate.content.cloneNode(true);
  document.body.appendChild(light2settings);

  // settings popup
  var dialogs = document.querySelectorAll("dialog");
  var lights = document.querySelectorAll(".lights-item");
  lights.forEach(function (item, index) {
    // fixes input/label ids so they're unique
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
    item.addEventListener("click", function () {
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
  });
}, 1000);

// todo: move this to discovery after lights have been discoverd
setTimeout(function () {
  loadingIndicator.classList.add("hidden");
}, 2000);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("../service-worker.js").then(
      function (registration) {
        // Registration was successful
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      },
      function (err) {
        // registration failed :(
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
}
