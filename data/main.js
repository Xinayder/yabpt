var buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var Request = require('sdk/request').Request;
var Prefs = require('sdk/simple-prefs');
var Preferences = require('sdk/simple-prefs').prefs;
var Storage = require('sdk/simple-storage').storage;
var data = require('sdk/self').data;
var { setInterval, clearInterval } = require('sdk/timers');

var yabptTimer = null;
var button = null;
var req = null;

var onPrefChanged = null;

exports.main = function(options, callbacks) {

    // Instantiate our storage variable if it isn't available.
    if (!Storage.selectedCurrency) {
        Storage.selectedCurrency = "USD";
    }
    // Instantiate our interval variable if it isn't available
    if (!Storage.refreshInterval) {
        Storage.refreshInterval = 5;
    }

    // Listen for preference changes
    onPrefChanged = function(pref) {
        Storage[pref] = Preferences[pref];
        loadData();
        reRegisterTimer();
    }
    Prefs.on("", onPrefChanged);

    // Check if our local storage saved variable isn't null.
    // If it isn't, set our preference to its value.
    if (Storage.selectedCurrency) {
        Preferences.selectedCurrency = Storage.selectedCurrency;
    }
    if (Storage.refreshInterval) {
        Preferences.refreshInterval = Storage.refreshInterval;
    }
    
    // Check if our timer is not set, so we can set it
    if (yabptTimer == null) {
        yabptTimer = setInterval(loadData, Preferences.refreshInterval * 6000); // Calls loadData(); every x seconds (x defined at INTERVAL_MINUTES)
    }

    // Create our button
    button = buttons.ActionButton({
        id: "yabpt-button",
        label: "1 bitcoin is worth $0 today",
        icon: {
            "16": data.url("icons/icon-16.png"),
            "32": data.url("icons/icon-32.png"),
            "64": data.url("icons/icon-64.png"),
            "128": data.url("icons/icon-128.png")
        },
        badge: 0,
        badgeColor: "#F7931A",
        onClick: handleClick
    });

    // Load data
    loadData();

    // Handle the button onClick event
    function handleClick(state) {
        tabs.open("https://blockchain.info/");
    }
    
    // If we change the refresh interval setting,
    // we want to re-register the timer using the new value.
    function reRegisterTimer() {
        if (yabptTimer != null) {
            clearInterval(yabptTimer);
            yabptTimer = setInterval(loadData, Preferences.refreshInterval * 6000);
        }
    }

    // Function that returns a language code from a currency code
    function getCountryCodeForCurrency(currency) {
        switch (currency) {
            default:
            case "AUD":
            case "NZD":
            case "CAD":
            case "GBP":
            case "NZD":
            case "SGD":
            case "KRW":
            case "CHF":
            case "TWD":
            case "THB":
            case "USD":
                return "en";
                break;
            case "BRL":
                return "pt-BR";
                break;
            case "CLP":
                return "es";
                break;
            case "CNY":
            case "HKD":
                return "zh";
                break;
            case "DKK":
                return "da-DK";
                break;
            case "EUR":
                return "de-DE";
                break;
            case "HKD":
                return "zn-HK";
                break;
            case "ISK":
                return "is-IS";
                break;
            case "JPY":
                return "jp-JP";
                break;
            case "PLN":
                return "pl-PL";
                break;
            case "RUB":
                return "ru-RU";
                break;
            case "SEK":
                return "sv-SE";
                break;
        }
    }

    // Request the current price from Blockchain, and update the button badge and label
    function loadData() {
        var selectedCurrency = Preferences.selectedCurrency;
        var apiUrl = "https://blockchain.info/ticker";
        req = Request({
            url: apiUrl,
            onComplete: function(response) {
                var badgePrice = response.json[selectedCurrency].last;
                // Format the currency according to the country/region it belongs to
                var currencyPrice = badgePrice.toLocaleString(getCountryCodeForCurrency(selectedCurrency),
                {
                    currency: selectedCurrency,
                    style: 'currency',
                    currencyDisplay: 'symbol'
                });
                var labelText = "1 bitcoin is worth {0} today".replace("{0}", currencyPrice);

                button.badge = Math.floor(badgePrice);
                button.label = labelText;
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
    Storage.refreshInterval = Preferences.refreshInterval;
    button.destroy();
}
