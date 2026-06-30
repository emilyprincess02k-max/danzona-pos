/* Store Configuration - Centralized settings for all pages */
var StoreConfig = (function() {
    var KEY = 'danzona_store_config';
    var defaults = {
        storeName: 'SHEDS Enterprise', storeAddress: '', phoneNumber: '', emailAddress: '',
        currency: '₦', currencyLocale: 'en-NG', lowStockThreshold: 5, sessionTimeout: 30,
        storeLogo: '', footerText: 'Thank you for choosing SHEDS Enterprise!', printerType: 'small',
        pharmacyName: 'SHEDS Enterprise',
        taxEnabled: false, taxRate: 7.5, taxName: 'VAT',
        allowDiscount: true, maxDiscount: 20,
        requireManagerForDiscount: false, requireManagerForVoid: true,
        receiptPrefix: 'DAN', autoPrintReceipt: true, showReceiptLogo: true,
        expiryAlertDays: 30, expiryBlockSales: false,
        lowStockAlert: true, lowStockEmail: '',
        openingTime: '08:00', closingTime: '20:00', openDays: 'Mon-Sat',
        allowStoreAccount: true, allowGiftCard: true, allowCardPayment: true, allowPosPayment: true
    };

    function getAll() {
        try {
            var raw = localStorage.getItem(KEY);
            if (!raw) return JSON.parse(JSON.stringify(defaults));
            var parsed = JSON.parse(raw);
            return Object.assign({}, defaults, parsed);
        } catch (e) {
            return JSON.parse(JSON.stringify(defaults));
        }
    }

    function get(key) {
        var cfg = getAll();
        return cfg[key] !== undefined ? cfg[key] : defaults[key];
    }

    function set(key, value) {
        var cfg = getAll();
        cfg[key] = value;
        save(cfg);
    }

    function save(cfg) {
        try {
            localStorage.setItem(KEY, JSON.stringify(cfg));
        } catch (e) {}
    }

    function formatCurrency(amount) {
        var currency = get('currency');
        var locale = get('currencyLocale');
        try {
            return currency + (parseFloat(amount) || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } catch (e) {
            return currency + (parseFloat(amount) || 0).toFixed(2);
        }
    }

    function formatDate(dateStr) {
        try {
            return new Date(dateStr).toLocaleDateString(get('currencyLocale'), { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            return dateStr || '-';
        }
    }

    function getStoreName() { return get('storeName') || defaults.storeName; }
    function getCurrency() { return get('currency') || defaults.currency; }
    function getLowStockThreshold() { return parseInt(get('lowStockThreshold')) || defaults.lowStockThreshold; }
    function getPharmacyName() { return get('pharmacyName') || get('storeName') || defaults.storeName; }

    return {
        getAll: getAll,
        get: get,
        set: set,
        save: save,
        formatCurrency: formatCurrency,
        formatDate: formatDate,
        getStoreName: getStoreName,
        getCurrency: getCurrency,
        getLowStockThreshold: getLowStockThreshold,
        getPharmacyName: getPharmacyName,
        defaults: defaults,
        KEY: KEY
    };
})();

