/* eslint-disable no-unused-vars, no-mixed-operators */
(function () {
    // Easy access to settings
    var settings = {
        currency: 'USD',
        frequency: '6',
        upperLimit: '0',
        lowerLimit: '0'
    };

    var intervals = [];


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
        var refreshTime = getNowFormatDate();
        var badgeText = formatPrice(price);
        if (price>settings.upperLimit&&settings.upperLimit!='0') {
            browser.tabs.create({url: "https://blockchain.info/"});
        } else if (price<settings.lowerLimit&&settings.lowerLimit!='0') {
            browser.tabs.create({url: "https://blockchain.info/"});
        }

        
        chrome.browserAction.setBadgeText({
            text: badgeText
        });
        

        chrome.browserAction.setTitle({
            title: chrome.i18n.getMessage("badgeTooltip", price.toLocaleString(navigator.language, {
                currency: settings.currency,
                style: 'currency',
                currencyDisplay: 'symbol'
            })+ ' at '+refreshTime)
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


    function setupStorage() {
        chrome.storage.local.get(function (prefs) {
            if (prefs.yabpt === undefined) {
                chrome.storage.local.set({
                    currency: settings.currency,
                    frequency: settings.frequency,
                    upperLimit: settings.upperLimit,
                    lowerLimit: settings.lowerLimit
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
        chrome.storage.local.get(function (prefs) {
            settings = {
                currency: prefs.currency,
                frequency: prefs.frequency,
                upperLimit: prefs.upperLimit,
                lowerLimit: prefs.lowerLimit
            };
            updateBadge();

            intervals.forEach(clearInterval);
            seconds = settings.frequency;
            seconds = Number(seconds)*1000;
            refreshSet = '( Every '+settings.frequency+' Seconds)';
            intervalID = window.setInterval(function () {
                updateBadge();
            }, seconds);
            intervals.push(intervalID);
        });

    }

    function onStorageChanged() {
        getCurrencyFromStorage();
    }

    

    function getNowFormatDate() {
            var date = new Date();
            var seperator1 = "-";
            var seperator2 = ":";
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
            if (month >= 1 && month <= 9) {
                    month = "0" + month;
            }
        if (hours >= 1 && hours <= 9) {
                    hours = "0" + hours;
            }
        if (minutes >= 1 && minutes <= 9) {
                    minutes = "0" + minutes;
            }
        if (seconds >= 1 && seconds <= 9) {
                    seconds = "0" + seconds;
            }
            if (strDate >= 0 && strDate <= 9) {
                    strDate = "0" + strDate;
            }
            var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
                    + " " + hours + seperator2 + minutes
                    + seperator2 + seconds;
            return currentdate;
    } 

    setupBadge();
    setupStorage();

})();
