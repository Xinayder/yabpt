(function() {
    // Easy access to settings
    var settings = {
        currency: 'USD'
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
                case "BRL":
                    return "pt-BR";
                case "CLP":
                    return "es";
                case "CNY":
                case "HKD":
                    return "zh";
                case "DKK":
                    return "da-DK";
                case "EUR":
                    return "de-DE";
                case "HKD":
                    return "zn-HK";
                case "ISK":
                    return "is-IS";
                case "JPY":
                    return "jp-JP";
                case "PLN":
                    return "pl-PL";
                case "RUB":
                    return "ru-RU";
                case "SEK":
                    return "sv-SE";

            }
    }

    function updateBadgeText(price) {
        chrome.browserAction.setBadgeText({
            text: Math.floor(price).toString()
        });

        chrome.browserAction.setTitle({
            title: chrome.i18n.getMessage("badgeTooltip", price.toLocaleString(getCountryCodeForCurrency(settings.currency), {
                currency: settings.currency,
                style: 'currency',
                currencyDisplay: 'symbol'
            }))
        })
    }

    function updateBadge() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://blockchain.info/ticker", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var response = JSON.parse(xhr.responseText);
                var price = response[settings.currency].last;
                
                updateBadgeText(price);
            }
        }
        xhr.send();
    }

    function setupInterval() {
        window.setInterval(function() { updateBadge(); }, 600000);
    }

    function setupStorage() {
        chrome.storage.local.get(['yabpt'], function(prefs) {
            if (prefs['yabpt'] === undefined) {
                chrome.storage.local.set({
                    yabpt: settings
                });
            }
        });
        chrome.storage.onChanged.addListener(onStorageChanged);
    }

    function setupBadge() {
        chrome.browserAction.setBadgeBackgroundColor({
            color: "#F7931A"
        });

        chrome.browserAction.setBadgeText({
            text: "0"
        });

        chrome.browserAction.onClicked.addListener(function(tab) {
            chrome.tabs.create({
                url: 'https://blockchain.info/'
            });
        });
    }

    function getCurrencyFromStorage() {
        chrome.storage.local.get(['yabpt'], function(prefs) {
            settings = prefs['yabpt'];
            updateBadge();
        });
    }

    function onStorageChanged(changes, areaName) {
        getCurrencyFromStorage();
    }

    setupBadge();
    setupStorage();
    getCurrencyFromStorage();
    setupInterval();

})();