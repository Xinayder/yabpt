var { setInterval, clearInterval } = require('sdk/timers');
var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var Request = require('sdk/request').Request;

var INTERVAL_MINUTES = 2 * 60000; // 60000 milliseconds is 1 second.

var yabptTimer = null;
var button = null;
var req = null;

exports.main = function(options, callbacks) {
    // Check if our timer is not set, so we can set it
    if (yabptTimer == null) {
        yabptTimer = setInterval(loadData(), INTERVAL_MINUTES); // Calls loadData(); every x minutes (x defined at INTERVAL_MINUTES)
    }

    // Create our button
    button = buttons.ActionButton({
        id: "yabpt-button",
        label: "1 bitcoin is worth $0 today",
        icon: {
            "16": "./icon-16.png",
            "32": "./icon-32.png",
            "64": "./icon-64.png"
        },
        badge: 0,
        badgeColor: "#F7931A",
        onClick: handleClick
    });

    function handleClick(state) {
        tabs.open("http://coindesk.com/price");
    }

    // Request the current price from CoinDesk, and update the button badge and label
    function loadData() {
        req = Request({
            url: "https://api.coindesk.com/v1/bpi/currentprice.json",
            onComplete: function(response) {
                // There's two fields being returned from the endpoint
                // rate is a string object, already formatted
                // rate_float is a number, which isn't formatted
                var usdRate = response.json.bpi.USD.rate_float;
                var roundRate = usdRate.toFixed(2).toString().replace(".", ",");

                button.badge = Math.floor(usdRate);
                button.label = "1 bitcoin is worth ${0} today".replace("{0}", roundRate);
            }
        });
        req.get();
    }
}

exports.onUnload = function(reason) {
    if (yabptTimer != null) {
        clearInterval(yabptTimer);
    }
}
