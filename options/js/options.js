(function () {
    var cs = $('#currency').countrySelect({
        preferredCountries: [],
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
        $('label#setting_description').each(function (idx, e) {
            var element = $(e);
            var pref = element.attr('for');

            var title = element.find('span.title')
            var desc = element.find('description');

            title.text(chrome.i18n.getMessage('option_' + pref + '_title'));
            desc.text(chrome.i18n.getMessage('option_' + pref + '_summary'));
        });

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