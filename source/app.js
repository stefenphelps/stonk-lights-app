const { Control, Discovery } = require("magic-home");
const cryptocoins = require("./functions/cryptocoins.js");
const stock = require("./functions/stock.js");
const stockMarket = require("./functions/stockMarket.js");
const stonkLight = require("./functions/stonkLight.js");

var shell = require("electron").shell;

//open links externally by default
$(document).on("click", 'a[href^="http"]', function (event) {
  event.preventDefault();
  shell.openExternal(this.href);
});

// UI Variables
var loadingIndicator = document.querySelector(".scanning");
var lightTemplate = document.querySelector("#lights-item");
var lightsContainer = document.querySelector(".lights");
var lightSettingsTemplate = document.querySelector("#light-settings");
var noResultsMessage = document.querySelector(".no-results");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

var authenticLightIds = [
  "10521CCE8D6D",
  "2462AB32341A",
  "5002912159B3",
  "500291214E93",
  "500291214E45",
  "500291214F74",
  "500291214CE6",
  "500291214E34",
  "500291215197",
  "500291214C32",
  "5002912154BF",
  "500291214E83",
  "500291214F71",
  "500291214C97",
  "5002912152E5",
  "B4E842D6F5D2",
  "B4E842D6FAAE",
  "B4E8424FF02E",
  "B4E842D6F982",
  "B4E842D7526C",
  "B4E8422311D0",
  "B4E842D6B60C",
  "B4E842237CF8",
  "B4E842D71BE6",
  "B4E842D71774",
  "B4E842D743C8",
  "B4E842236FF8",
  "B4E842D6C490",
  "B4E842D6F52E",
  "B4E842D71362",
  "B4E842D72D68",
  "B4E84223649C",
  "B4E842D70E94",
  "B4E842D732BE",
  "B4E842D69DCC",
  "B4E842D714AC",
  "B4E842D6F668",
  "B4E842D6B7EA",
  "B4E842D6F2A0",
  "B4E842D6B17E",
  "B4E842D6F308",
  "B4E842D70264",
  "B4E842D74684",
  "B4E842D70ADC",
  "B4E842D7135A",
];

function discover() {
  // scan for lights on network
  loadingIndicator.classList.remove("hidden");
  noResultsMessage.classList.add("hidden");
  var discovery = new Discovery();
  discovery.scan(500).then((devices) => {
    // find all lights on network
    loadingIndicator.classList.add("hidden");
    // if no lights on network show no results message
    if (devices === undefined || devices.length == 0) {
      noResultsMessage.classList.remove("hidden");
    }

    devices.forEach(function (device, index) {
      // only change our magic home lights
      if (authenticLightIds.includes(device.id)) {
        // turn light on and initialize stonks
        var light = new Control(device.address);
        light.setPower(true).then((success) => {
          var lightButton = lightTemplate.content.cloneNode(true);
          lightButton.querySelector(".lights-item").id =
            "light-button-" + index;
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

              var currentCategory = document.querySelector(
                "#dialog-" + index + ' input[name="category"]:checked'
              ).value;
              var isCrypto;
              if (currentCategory == "crypto") {
                isCrypto = true;
              } else {
                isCrypto = false;
              }
              var symbol = symbol_input.value;
              theLoop(light, isCrypto, symbol);
            });
          });
        });
      } else {
        // no authentic lights found!
        noResultsMessage.classList.remove("hidden");
      }
    });
  });
}

// run on load
discover();

// run on retry scan
var retryButton = document.querySelector(".no-results-retry");
retryButton.addEventListener("click", function () {
  discover();
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
