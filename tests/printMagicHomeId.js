const { Control, Discovery } = require("magic-home");

// scan for lights on network
var discovery = new Discovery();
discovery.scan(500).then((devices) => {
  // find all lights on network
  devices.forEach(function (device, index) {
    // turn light on and initialize stonks
    var light = new Control(device.id);
    console.log(device.id);
  });
});
