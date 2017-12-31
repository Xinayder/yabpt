/* eslint-disable no-unused-vars, no-mixed-operators */
(function () {
    // Easy access to settings
    var settings = {
        currency: 'USD'
    };

    function updateBadgeText(price) {
        var floorPrice = Math.floor(price);
        // Get the number of digits the price has
        var numDigits = Math.floor(Math.log(floorPrice) * Math.LOG10E + 1);

        var badgeText = floorPrice.toString();

        // Firefox can't have more than 4 characters on the badge text.
        // Instead, we display a '+', indicating that there are more digits.
        if (numDigits > 4) {
            var re = new RegExp(/^\d{3}/);
            var match = re.exec(floorPrice.toString());

            badgeText = match[0] + "+";
        }

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
