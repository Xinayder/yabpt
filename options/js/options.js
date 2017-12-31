(function () {
    // eslint-disable-next-line no-unused-vars
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

            var title = element.find('span.title');
            var desc = element.find('description');

            title.text(chrome.i18n.getMessage('option_' + pref + '_title'));
            desc.text(chrome.i18n.getMessage('option_' + pref + '_summary'));
        });

        chrome.storage.local.get('yabpt', function (res) {
            var selectedCountry = 'us';
            for (var i = 0; i < currencies.length; i++) {
                var item = currencies[i];
                if (res.yabpt.currency == item.currency) {
                    selectedCountry = item.iso2;
                }
            }
            $('#currency').countrySelect('selectCountry', selectedCountry);
        });
    }

    document.addEventListener('DOMContentLoaded', restoreOptions);
    $('#currency').change(function () {
        saveOptions();
    });
})();
