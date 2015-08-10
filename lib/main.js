var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var Request = require('sdk/request').Request;
var Prefs = require('sdk/simple-prefs');
var Preferences = require('sdk/simple-prefs').prefs;
var Storage = require('sdk/simple-storage').storage;
var { setInterval, clearInterval } = require('sdk/timers');

var INTERVAL_MINUTES = 2 * 60000; // 60000 milliseconds is 1 minute.

var yabptTimer = null;
var button = null;
var req = null;

var onPrefChanged = null;

exports.main = function(options, callbacks) {

    // Instantiate our storage variable if it isn't available.
    if (!Storage.selectedCurrency) {
        Storage.selectedCurrency = "USD";
    }

    // Check if our timer is not set, so we can set it
    if (yabptTimer == null) {
        yabptTimer = setInterval(loadData, INTERVAL_MINUTES); // Calls loadData(); every x minutes (x defined at INTERVAL_MINUTES)
    }

    // Listen for preference changes
    onPrefChanged = function(pref) {
        console.debug("Preference " + pref + " value has changed!");
        Storage[pref] = Preferences[pref];
        loadData();
    }
    Prefs.on("", onPrefChanged);

    // Check if our local storage saved variable isn't null.
    // If it isn't, set our preference to its value.
    if (Storage.selectedCurrency) {
        Preferences.selectedCurrency = Storage.selectedCurrency;
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

    loadData();

    function handleClick(state) {
        tabs.open("http://coindesk.com/price");
    }

    function getSymbolForCurrency(currency) {
        switch (currency) {
            default:
            case "USD":
                return "$";
                break;
            case "GBP":
                return "£";
                break;
            case "EUR":
                return "€";
                break;
            case "CNY":
                return "¥";
                break;
            case "BRL":
                return "R$";
                break;
        }
    }

    // Request the current price from CoinDesk, and update the button badge and label
    function loadData() {
        console.debug("loading data...");
        var selectedCurrency = Preferences.selectedCurrency;
        var apiUrl = "https://api.coindesk.com/v1/bpi/currentprice/{0}.json".replace("{0}", selectedCurrency);
        req = Request({
            url: apiUrl,
            onComplete: function(response) {
                // There's two fields being returned from the endpoint
                // rate is a string object, already formatted
                // rate_float is a number, which isn't formatted
                var usdRate = response.json.bpi[selectedCurrency].rate_float;
                var roundRate = usdRate.toFixed(2).toString().replace(".", ",");

                button.badge = Math.floor(usdRate);
                button.label = "1 bitcoin is worth {1}{0} today".replace("{0}", roundRate).replace("{1}", getSymbolForCurrency(selectedCurrency));
            }
        });
        req.get();
    }
}

// Clear our timer and clear our listener.
// Don't forget to save our selected currency.
exports.onUnload = function(reason) {
    if (onPrefChanged != null) {
        Prefs.removeListener("", onPrefChanged);
    }
    if (yabptTimer != null) {
        clearInterval(yabptTimer);
    }
    Storage.selectedCurrency = Preferences.selectedCurrency;
    console.debug("unloaded");
}
