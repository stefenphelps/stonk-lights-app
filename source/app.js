const { Control, Discovery } = require('magic-home');
const cryptocoins = require('./functions/cryptocoins.js');
const stock = require('./functions/stock.js');
const stockMarket = require('./functions/stockMarket.js');
const stonkLight = require('./functions/stonkLight.js');
const Store = require('electron-store');
const shell = require('electron').shell;

// open links externally by default
$(document).on('click', 'a[href^="http"]', function (event) {
	event.preventDefault();
	shell.openExternal(this.href);
});

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// UI Variables
var loadingIndicator = document.querySelector('.scanning');
var lightTemplate = document.querySelector('#lights-item');
var lightsContainer = document.querySelector('.lights');
var lightSettingsTemplate = document.querySelector('#light-settings');
var noResultsMessage = document.querySelector('.no-results');

async function theLoop(light, crypto, symbol) {
	var oldPrice = 0;
	var newPrice = 0;
	document.querySelector(
		'button[data-ip="' + light._address + '"] .lights-item-price'
	).textContent = newPrice;
	if (crypto) {
		while (crypto) {
			// first loop
			if (oldPrice == 0) {
				oldPrice = await cryptocoins.getPrice(symbol);
			} else {
				await sleep(31000);
				// every loop after first
				newPrice = await cryptocoins.getPrice(symbol);
				document.querySelector(
					'button[data-ip="' + light._address + '"] .lights-item-price'
				).textContent = newPrice;
				await stonkLight.colorChange(light, newPrice, oldPrice);
				await sleep(31000);
				oldPrice = await cryptocoins.getPrice(symbol);
			}
		}
	} else {
		while (stockMarket.isOpen()) {
			// wait 5 seconds before checking price each time
			await sleep(5000);
			var price = await stock.getPrice(symbol);
			var currentPrice = price[0];
			var previousClosePrice = price[1];
			document.querySelector(
				'button[data-ip="' + light._address + '"] .lights-item-price'
			).textContent = currentPrice;
			await stonkLight.colorChange(light, currentPrice, previousClosePrice);
		}
	}
}

function discover() {
	// scan for lights on network
	loadingIndicator.classList.remove('hidden');
	noResultsMessage.classList.add('hidden');
	var discovery = new Discovery();
	discovery.scan(500).then((devices) => {
		// find all lights on network
		loadingIndicator.classList.add('hidden');
		// if no lights on network show no results message
		if (devices === undefined || devices.length == 0) {
			noResultsMessage.classList.remove('hidden');
		}

		devices.forEach(function (device, index) {
			// create persistent data store for light settings
			const store = new Store();
			const deviceId = device.id;

			// turn light on and initialize stonks
			var light = new Control(device.address);
			light.setPower(true).then((success) => {
				var lightButton = lightTemplate.content.cloneNode(true);
				lightButton.querySelector('.lights-item').id =
					'light-button-' + deviceId;
				lightButton.querySelector('.lights-item').dataset.ip = device.address;
				lightsContainer.appendChild(lightButton);

				var lightSettings = document.importNode(
					lightSettingsTemplate.content,
					true
				);
				lightSettings.querySelector('.dialog').id = 'dialog-' + index;
				document.body.appendChild(lightSettings);

				var stockInput = document.querySelector(
					'#dialog-' + index + ' input#stock'
				);
				var stockLabel = document.querySelector(
					'#dialog-' + index + ' label[for="stock"]'
				);
				var cryptoInput = document.querySelector(
					'#dialog-' + index + ' input#crypto'
				);
				var cryptoLabel = document.querySelector(
					'#dialog-' + index + ' label[for="crypto"]'
				);
				var symbolInput = document.querySelector(
					'#dialog-' + index + ' input#symbol'
				);
				var symbolLabel = document.querySelector(
					'#dialog-' + index + ' label[for="symbol"]'
				);

				stockInput.setAttribute('id', 'stock-' + index);
				stockLabel.setAttribute('for', 'stock-' + index);
				cryptoInput.setAttribute('id', 'crypto-' + index);
				cryptoLabel.setAttribute('for', 'crypto-' + index);
				symbolInput.setAttribute('id', 'symbol-' + index);
				symbolLabel.setAttribute('for', 'symbol-' + index);

				if (store.get(deviceId + '-symbol')) {
					var savedSymbol = store.get(deviceId + '-symbol');
					document.querySelector(
						'#light-button-' + deviceId + ' .lights-item-symbol'
					).textContent = savedSymbol;
				}

				// open Settings popup
				var thelightbutton = document.querySelectorAll('.lights-item')[index];
				thelightbutton.addEventListener('click', function () {
					// opens modal
					var modal = document.querySelector('#dialog-' + index);
					modal.showModal();

					// shows the next inputs after selection
					var category_inputs = modal.querySelectorAll(
						'.category-fieldset-items input'
					);
					var symbol_fieldset = modal.querySelector('.symbol-fieldset');
					var symbol_input = modal.querySelector('.symbol-fieldset input');
					var start_button = modal.querySelector('.start-button');
					category_inputs.forEach(function (item) {
						if (store.get(deviceId + '-category')) {
							symbol_fieldset.style = 'display: block';
							var current_category = store.get(deviceId + '-category');
							$(":radio[value='" + current_category + "']").attr(
								'checked',
								true
							);
							modal.querySelector('.symbol-text').textContent =
								current_category;
						}
						item.addEventListener('click', function () {
							symbol_fieldset.style = 'display: block';
							var current_category = this.value;
							modal.querySelector('.symbol-text').textContent =
								current_category;
						});
					});

					if (store.get(deviceId + '-symbol')) {
						var savedSymbol = store.get(deviceId + '-symbol');
						symbol_input.value = savedSymbol;
						start_button.style = 'display: block;';
					}
					symbol_input.addEventListener('keyup', function () {
						// save symbol setting to data store
						store.set(deviceId + '-symbol', this.value);
						// show start button
						start_button.style = 'display: block;';
					});

					var startButton = document.querySelector(
						'#dialog-' + index + ' .start-button'
					);
					startButton.addEventListener('click', function () {
						// symbol_input.value
						document.querySelector(
							'#light-button-' + deviceId + ' span'
						).textContent = symbol_input.value;
						modal.close();

						var currentCategory = document.querySelector(
							'#dialog-' + index + ' input[name="category"]:checked'
						).value;

						// save setting to data store
						store.set(deviceId + '-category', currentCategory);

						// start the loop/main function
						var isCrypto;
						if (currentCategory == 'crypto') {
							isCrypto = true;
						} else {
							isCrypto = false;
						}
						var symbol = symbol_input.value;
						theLoop(light, isCrypto, symbol);
					});
				});
			});
		});
	});
}

// run on load
discover();

// run on retry scan
var retryButton = document.querySelector('.no-results-retry');
retryButton.addEventListener('click', function () {
	discover();
});
