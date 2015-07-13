var { setInterval } = require('sdk/timers');
var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var Request = require('sdk/request').Request;
var Preferences = require('sdk/simple-prefs').prefs;

var INTERVAL_MINUTES = 2 * 60000; // 60000 milliseconds is 1 second.

var yabptTimer = null;

// Create our button
var button = buttons.ActionButton({
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

// Check if our timer is not set, so we can set it
if (yabptTimer == null) {
    yabptTimer = setInterval(loadData(), INTERVAL_MINUTES); // Calls loadData(); every x minutes (x defined at INTERVAL_MINUTES)
}

// Request the current price from CoinDesk, and update the button badge and label
function loadData() {
    var selectedCurrency = Preferences.selectedCurrency;
    console.log(selectedCurrency);
    var apiUrl = "https://api.coindesk.com/v1/bpi/currentprice/{0}.json".replace("{0}", selectedCurrency);
    var req = Request({
        url: apiUrl,
        onComplete: function(response) {
            // There's two fields being returned from the endpoint
            // rate is a string object, already formatted
            // rate_float is a number, which isn't formatted
            var usdRate = response.json['bpi'][selectedCurrency]['rate_float'];
            var roundRate = usdRate.toFixed(2).toString().replace(".", ",");

            button.badge = Math.floor(usdRate);
            button.label = "1 bitcoin is worth {0}{1} today".replace("{0}", selectedCurrency['symbol']).replace("{1}", roundRate);
        }
    });
    req.get();
}
