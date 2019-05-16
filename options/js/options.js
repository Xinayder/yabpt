(function () {
    // eslint-disable-next-line no-unused-vars
    var cs = $('#currency').countrySelect({
        preferredCountries: [],
        responsiveDropdown: true
    });

    var currencies = $.fn.countrySelect.getCountryData();

    function saveOptions() {
        var option = {
            currency: $('#currency').countrySelect('getSelectedCountryData').currency,
            frequency: document.getElementById('frequency').value,
            upperLimit: document.getElementById('upperLimit').value,
            lowerLimit: document.getElementById('lowerLimit').value
        }

        setOption(option);

    }

    function setOption(option) {
        chrome.storage.local.set({
            currency: option['currency'],
            frequency: option['frequency'],
            upperLimit: option['upperLimit'],
            lowerLimit: option['lowerLimit']
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

        chrome.storage.local.get('currency', function (res) {
            var selectedCountry = 'us';
            for (var i = 0; i < currencies.length; i++) {
                var item = currencies[i];
                if (res.currency == item.currency) {
                    selectedCountry = item.iso2;
                }
            }
            $('#currency').countrySelect('selectCountry', selectedCountry);
        });
        chrome.storage.local.get(function (res) {
            document.getElementById('frequency').value = res.frequency;
            document.getElementById('upperLimit').value = res.upperLimit;
            document.getElementById('lowerLimit').value = res.lowerLimit;
        });

    }

    document.addEventListener('DOMContentLoaded', restoreOptions);
    $('#currency').change(function () {
        saveOptions();
    });
    $('input').change(function () {
        saveOptions();
    });
})();
