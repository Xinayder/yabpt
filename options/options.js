(function () {
    var cs = $('#currency').countrySelect({
        preferredCountries: [],
        onlyCountries: ['au', 'br', 'gb', 'ca', 'cl', 'cn', 'dk', 'eu', 'hk', 'in', 'is', 'jp', 'nz', 'pl', 'ru', 'si', 'kr', 'se', 'ch', 'tw', 'ta', 'us'],
        responsiveDropdown: true
    });

    var currencies = $.fn.countrySelect.getCountryData();

    function saveOptions() {
        setOption('currency', $('#currency').countrySelect('getSelectedCountryData').currency);
    }

    function setOption(option, value) {
        var yabpt = {};
        yabpt[option] = value;

        chrome.storage.local.set({
            yabpt: yabpt
        });
    }

    function restoreOptions() {
        document.querySelector('#setting_description span.title').textContent = chrome.i18n.getMessage("optionCurrency");
        document.querySelector('#setting_description description').textContent = chrome.i18n.getMessage("optionCurrencyDesc");
        chrome.storage.local.get('yabpt', function (res) {
            // Need to adapt to the new system
            if (res.yabpt.currency.length == 3) {
                var prevOption = res.yabpt.currency;
                var selectedCountry = 'us';
                $.each(currencies, function (idx, c) {
                    if (prevOption == c.currency) {
                        selectedCountry = c.iso2;
                    }
                });
                $('#currency').countrySelect('selectCountry', selectedCountry);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', restoreOptions);
    $('#currency').change(function () {
        saveOptions();
    })
})();