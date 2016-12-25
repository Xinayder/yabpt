(function() {
    function saveOptions() {
        setOption('currency', document.querySelector('#currency').value);
    }

    function setOption(option, value) {
        var yabpt = {};
        yabpt[option] = value;

        chrome.storage.local.set({yabpt: yabpt});
    }

    function restoreOptions() {
        document.querySelector('#setting_description span.title').textContent = chrome.i18n.getMessage("optionCurrency");
        document.querySelector('#setting_description description').textContent = chrome.i18n.getMessage("optionCurrencyDesc");
        chrome.storage.local.get('yabpt', function(res) {
            document.querySelector('#currency').value = res.yabpt.currency || 'USD';
        });
    }

    document.addEventListener('DOMContentLoaded', restoreOptions);
    document.querySelector('#currency').addEventListener('change', saveOptions);
})();