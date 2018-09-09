/* eslint-disable no-unused-vars, no-mixed-operators */
(function () {
    // Easy access to settings
    var settings = {
        currency: 'USD'
    };

    // Formats the price into currency suffixes
    function formatPrice(price) {
        var ranges = [
            { divider: 1e15, suffix: 'Q' },
            { divider: 1e12, suffix: 'T' },
            { divider: 1e9, suffix: 'B' },
            { divider: 1e6, suffix: 'M' },
            { divider: 1e3, suffix: 'K' }
        ];

        for (var i = 0; i < ranges.length; i++) {
            if (price >= ranges[i].divider) {
                var result = price / ranges[i].divider;

                // Gets the integer part of the price
                var intResult = parseInt(result, 10);


                // Finds the amount of digits the integer part has
                var integerDigits = Math.floor(Math.log(intResult) * Math.LOG10E + 1);
                switch (integerDigits) {
                    case 1:
                        return (Math.floor(10 * result) / 10).toFixed(1) + ranges[i].suffix;
                    case 2:
                    case 3:
                    default:
                        return Math.round(result) + ranges[i].suffix;
                }
            }
        }
        return price.toString();
    }

    function updateBadgeText(price) {
        var badgeText = formatPrice(price);

        chrome.browserAction.setBadgeText({
            text: badgeText
        });

        chrome.browserAction.setTitle({
            title: chrome.i18n.getMessage("badgeTooltip", price.toLocaleString(navigator.language, {
                currency: settings.currency,
                style: 'currency',
                currencyDisplay: 'symbol'
            }))
        });
    }

    function updateBadge() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://blockchain.info/ticker", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var response = JSON.parse(xhr.responseText);
                var price = response[settings.currency].last;

                updateBadgeText(price);
            }
        };
        xhr.send();
    }

    function setupInterval() {
        window.setInterval(function () {
            updateBadge();
        }, 600000);
    }

    function setupStorage() {
        chrome.storage.local.get(['yabpt'], function (prefs) {
            if (prefs.yabpt === undefined) {
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

        chrome.browserAction.onClicked.addListener(function (tab) {
            chrome.tabs.create({
                url: 'https://blockchain.info/'
            });
        });
    }

    function getCurrencyFromStorage() {
        chrome.storage.local.get(['yabpt'], function (prefs) {
            settings = prefs.yabpt;
            updateBadge();
        });
    }

    function onStorageChanged() {
        getCurrencyFromStorage();
    }

    setupBadge();
    setupStorage();
    getCurrencyFromStorage();
    setupInterval();

})();
