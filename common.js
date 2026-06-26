var POS = (function() {
    var pages = {
        'index.html': { label: 'Home', icon: 'fa-home' },
        'dashboard.html': { label: 'Dashboard', icon: 'fa-home' },
        'sales.html': { label: 'SALES', icon: 'fa-shopping-cart' },
        'suspended-sales.html': { label: 'Suspended Sales', icon: 'fa-pause' },
        'receipt.html': { label: 'Receipt', icon: 'fa-receipt' },
        'variations.html': { label: 'Add / Edit Product', icon: 'fa-plus-circle' },
        'inventory.html': { label: 'Inventory', icon: 'fa-boxes' },
        'customers.html': { label: 'Customers', icon: 'fa-users' },
        'suppliers.html': { label: 'Suppliers', icon: 'fa-truck' },
        'reports.html': { label: 'Reports', icon: 'fa-chart-bar' },
        'receiving.html': { label: 'Receiving', icon: 'fa-file-import' },
        'expenses.html': { label: 'Expenses', icon: 'fa-receipt' },
        'employees.html': { label: 'Employees', icon: 'fa-user-tie' },
        'appointments.html': { label: 'Appointments', icon: 'fa-calendar' },
        'giftcards.html': { label: 'Gift Cards', icon: 'fa-gift' },
        'invoices.html': { label: 'Invoices', icon: 'fa-file-invoice' },
        'deliveries.html': { label: 'Deliveries', icon: 'fa-truck-loading' },
        'cashier-closeout.html': { label: 'Cashier Closeout', icon: 'fa-calculator' },
        'sales-returns.html': { label: 'Sales Returns', icon: 'fa-rotate-left' },
        'audit-log.html': { label: 'Audit Log', icon: 'fa-clipboard-list' },
        'stock-transfer.html': { label: 'Stock Transfer', icon: 'fa-truck-ramp-box' },
        'purchase-orders.html': { label: 'Purchase Orders', icon: 'fa-file-invoice-dollar' },
        'daily-summary.html': { label: 'Daily Sales Summary', icon: 'fa-calendar-day' },
        'bank-reconciliation.html': { label: 'Bank Reconciliation', icon: 'fa-building-columns' },
        'user-roles.html': { label: 'User Roles & Permissions', icon: 'fa-user-shield' },
        'tax-settings.html': { label: 'Tax & Vat', icon: 'fa-percent' },
        'backups.html': { label: 'System Backups', icon: 'fa-download' },
        'promo-engine.html': { label: 'Promos & Discounts', icon: 'fa-tags' },
        'prescriptions.html': { label: 'Prescriptions / Rx', icon: 'fa-prescription' },
        'expiry-alerts.html': { label: 'Expiry & Batch Alerts', icon: 'fa-triangle-exclamation' },
        'drug-categories.html': { label: 'Drug Categories', icon: 'fa-tags' },
        'payments.html': { label: 'Payments', icon: 'fa-credit-card' },
        'locations.html': { label: 'Locations', icon: 'fa-store' },
        'messages.html': { label: 'Messages', icon: 'fa-envelope' },
        'config.html': { label: 'Store Config', icon: 'fa-cog' },
        'login.html': { label: 'Logout', icon: 'fa-sign-out-alt' }
    };
    function $(id) { return document.getElementById(id); }
    function esc(value) {
        var text = value == null ? '' : String(value);
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
    function navigateTo(page) { window.location.href = page; }
    function formatCurrency(value) { return '₦' + (parseFloat(value) || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function formatNumber(value) { return (parseFloat(value) || 0).toLocaleString('en-NG'); }
    function formatDate(value, options) {
        if (!value) return '-';
        var s = String(value);
        if (s.indexOf(' ') > -1 && !s.includes('T')) s = s.replace(' ', 'T');
        var d = new Date(s);
        if (isNaN(d.getTime())) return value;
        return d.toLocaleDateString('en-NG', options || { year: 'numeric', month: 'short', day: '2-digit' });
    }
    function today() { return new Date().toISOString().split('T')[0]; }
    function getDatePart(d) {
        if (!d) return '';
        var s = String(d);
        var idx = s.indexOf(' ');
        return idx > -1 ? s.substring(0, idx) : s;
    }
    function getQueryParameter(name) { return new URLSearchParams(window.location.search).get(name) || ''; }
    function showToast(message, isError) {
        var t = $('toast');
        if (!t) return;
        t.textContent = message;
        t.className = 'toast' + (isError ? ' error' : '');
        t.style.display = 'block';
        setTimeout(function() { t.style.display = 'none'; }, 3500);
    }
    function openModal(id) { var el = $(id); if (el) el.classList.add('open'); }
    function closeModal(id) { var el = $(id); if (el) el.classList.remove('open'); }
    function csvCell(value) {
        var text = value == null ? '' : String(value);
        return '"' + text.split('"').join('""') + '"';
    }
    function exportCSV(filename, headers, rows) {
        var lines = [headers.map(csvCell).join(',')];
        rows.forEach(function(row) { lines.push(headers.map(function(h) { return csvCell(row[h] == null ? '' : row[h]); }).join(',')); });
        var blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('CSV exported');
    }
    function printTable(title, headers, rows) {
        var html = '<html><head><title>' + esc(title) + '</title><style>body{font-family:Inter,Arial,sans-serif;padding:24px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:10px;text-align:left;}th{background:#f8fafc;}h2{text-align:center;color:#10b981;}</style></head><body><h2>' + esc(title) + '</h2><p>Generated: ' + esc(new Date().toLocaleString()) + '</p><table><thead><tr>';
        headers.forEach(function(h) { html += '<th>' + esc(h) + '</th>'; });
        html += '</tr></thead><tbody>';
        rows.forEach(function(row) { html += '<tr>'; headers.forEach(function(h) { html += '<td>' + esc(row[h] == null ? '' : row[h]) + '</td>'; }); html += '</tr>'; });
        html += '</tbody></table></body></html>';
        var win = window.open('', '', 'width=980,height=700');
        if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
    }
    function renderSidebar() {
        var el = $('sidebar');
        if (!el) return;
        var current = window.location.pathname.split('/').pop();
        var groups = [
            {title:'Main',items:[['index.html','Home','fa-home'],['dashboard.html','Dashboard','fa-home'],['sales.html','SALES','fa-shopping-cart'],['suspended-sales.html','Suspended Sales','fa-pause'],['variations.html','Add Product','fa-plus-circle'],['inventory.html','Inventory','fa-boxes'],['receiving.html','Receiving','fa-file-import'],['reports.html','Reports','fa-chart-bar']]},
            {title:'Catalogue',items:[['customers.html','Customers','fa-users'],['suppliers.html','Suppliers','fa-truck'],['locations.html','Locations','fa-store'],['product-variations.html','Product Variations','fa-layer-group']]},
            {title:'Pharmacy',items:[['prescriptions.html','Prescriptions / Rx','fa-prescription'],['expiry-alerts.html','Expiry & Batch Alerts','fa-triangle-exclamation'],['drug-categories.html','Drug Categories','fa-tags']]},
            {title:'Finance',items:[['payments.html','Payments','fa-credit-card'],['store_account_payment.html','Store Account','fa-wallet'],['bank-reconciliation.html','Bank Reconciliation','fa-building-columns'],['tax-settings.html','Tax & Vat','fa-percent'],['promo-engine.html','Promos & Discounts','fa-tags'],['expenses.html','Expenses','fa-receipt'],['invoices.html','Invoices','fa-file-invoice'],['purchase-orders.html','Purchase Orders','fa-file-invoice-dollar'],['subscription.html','Subscription Fee','fa-calendar-check']]},
            {title:'Operations',items:[['employees.html','Employees','fa-user-tie'],['user-roles.html','User Roles','fa-user-shield'],['appointments.html','Appointments','fa-calendar'],['suspended-sales.html','Suspended Sales','fa-pause'],['receipt.html','Receipt','fa-receipt'],['giftcards.html','Gift Cards','fa-gift'],['deliveries.html','Deliveries','fa-truck-loading'],['cashier-closeout.html','Cashier Closeout','fa-calculator'],['daily-summary.html','Daily Sales Summary','fa-calendar-day'],['sales-returns.html','Sales Returns','fa-rotate-left'],['stock-transfer.html','Stock Transfer','fa-truck-ramp-box'],['messages.html','Messages','fa-envelope']]},
            {title:'Reports',items:[['reports.html','Reports','fa-chart-bar'],['audit-log.html','Audit Log','fa-clipboard-list'],['backups.html','System Backups','fa-download'],['config.html','Store Config','fa-cog'],['login.html','Logout','fa-sign-out-alt']]}
        ];
        el.innerHTML = '<div class="sidebar-header"><div class="sidebar-brand"><i class="fas fa-clinic-medical"></i><div><h1>SHEDS POS</h1><p>Powered by SHEDS Enterprise</p></div></div></div><div class="sidebar-body">' + groups.map(function(group){return '<div class="sidebar-section"><div class="sidebar-section-title">'+esc(group.title)+'</div>'+group.items.map(function(item){return '<a class="sidebar-link '+(item[0]===current?'active':'')+'" href="#" onclick="POS.navigateTo(\''+item[0]+'\');return false;"><i class="fas '+item[2]+'"></i><span>'+esc(item[1])+'</span></a>';}).join('')+'</div>';}).join('')+'</div><div class="sidebar-footer"><div><strong>SHEDS Enterprise</strong><span>Secure POS Session</span></div><i class="fas fa-shield-alt"></i></div>';
    }
    function renderUserMenu() {
        var el = $('userMenu');
        if (!el) return;
        var name = API.getUserName ? API.getUserName() : 'Admin User';
        var role = API.getRole ? API.getRole() : 'admin';
        var pharm = API.getPharmacyName ? API.getPharmacyName() : 'Danzona POS';
        el.innerHTML = '<span class="user-avatar"><i class="fas fa-user"></i></span><div class="user-text"><strong>' + esc(name || 'Admin User') + '</strong><small>' + esc(role || 'Role') + '</small></div><i class="fas fa-chevron-down"></i><div class="user-dropdown"><div class="user-info"><strong>' + esc(name || 'Admin User') + '</strong><small>' + esc(pharm || 'Danzona POS') + '</small></div><hr><a href="#" onclick="POS.navigateTo(\'config.html\');return false;"><i class="fas fa-cog"></i> Settings</a><a href="#" onclick="POS.navigateTo(\'payments.html\');return false;"><i class="fas fa-credit-card"></i> Store Payments</a><a href="#" onclick="POS.switchToAdmin();return false;"><i class="fas fa-user-shield"></i> Switch to Admin</a><hr><a href="#" onclick="POS.logout();return false;"><i class="fas fa-sign-out-alt"></i> Logout</a></div>';
    }
    function switchToAdmin() {
        if (API.init) API.init('', '', '', { name: 'Admin User', role: 'admin' }, '');
        renderUserMenu();
        showToast('Switched to Admin User');
    }
    function logout() {
        if (!confirm('Are you sure you want to logout?')) return;
        if (API.logout) API.logout();
        navigateTo('login.html');
    }
    function statusBadge(status, extraClass) {
        var s = String(status || '').toLowerCase();
        var cls = 'badge';
        if (extraClass) cls += ' ' + extraClass;
        else if (['active', 'paid', 'completed', 'delivered', 'scheduled', 'read', 'in_stock', 'high', 'confirmed'].indexOf(s) > -1) cls += ' badge-success';
        else if (['inactive', 'cancelled', 'expired', 'used', 'outstanding', 'overdue', 'delayed', 'low', 'out', 'unread', 'pending', 'draft', 'partial'].indexOf(s) > -1) cls += ' badge-warning';
        else cls += ' badge-info';
        return '<span class="' + cls + '">' + esc(status || 'Draft') + '</span>';
    }
    function debounce(fn, delay) {
        var t;
        return function() {
            var args = arguments;
            clearTimeout(t);
            t = setTimeout(function() { fn.apply(null, args); }, delay || 250);
        };
    }
function startClock() {
    var el = $('topClock');
    if (!el) return;
    function update() {
        var now = new Date();
        el.innerHTML = '<i class="fas fa-clock"></i> ' + now.toLocaleString('en-NG', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }
    update();
    setInterval(update, 1000);
}
function checkSubscription() {
    var page = window.location.pathname.split('/').pop();
    if (page === 'subscription.html') return;
    var sub = null;
    var trial = null;
    try { 
        sub = JSON.parse(localStorage.getItem('danzona_subscription') || 'null'); 
        trial = JSON.parse(localStorage.getItem('danzona_trial') || 'null');
    } catch(e) { sub = null; trial = null; }
    
    var isActive = sub && sub.status === 'active';
    var isTrial = trial && trial.status === 'active' && new Date(trial.endDate) >= new Date();
    
    if (isTrial) {
        var remaining = Math.ceil((new Date(trial.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        var overlay = document.createElement('div');
        overlay.id = 'subscriptionLock';
        overlay.style.cssText = 'position:fixed;inset:0;background:linear-gradient(135deg,#0f172a,#1e293b);z-index:99999;display:flex;align-items:center;justify-content:center;color:#fff;font-family:Inter,Arial,sans-serif;';
        overlay.innerHTML = '<div style="text-align:center;max-width:480px;padding:40px;"><div style="font-size:60px;margin-bottom:20px;"><i class="fas fa-gift" style="color:#f59e0b;"></i></div><h1 style="font-size:28px;font-weight:900;margin-bottom:12px;">Free Trial Active</h1><p style="color:#94a3b8;font-size:15px;margin-bottom:8px;">You are on a <strong style="color:#f59e0b;">' + remaining + '-day free trial</strong></p><p style="color:#94a3b8;font-size:13px;margin-bottom:24px;">Subscribe before ' + new Date(trial.endDate).toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'}) + ' to continue uninterrupted access.</p><button onclick="window.location.href=\'subscription.html\'" style="background:#10b981;color:#fff;border:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:8px;"><i class="fas fa-calendar-check"></i> View Subscription Plans</button></div>';
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    } else if (!isActive) {
        var overlay = document.createElement('div');
        overlay.id = 'subscriptionLock';
        overlay.style.cssText = 'position:fixed;inset:0;background:linear-gradient(135deg,#0f172a,#1e293b);z-index:99999;display:flex;align-items:center;justify-content:center;color:#fff;font-family:Inter,Arial,sans-serif;';
        overlay.innerHTML = '<div style="text-align:center;max-width:480px;padding:40px;"><div style="font-size:60px;margin-bottom:20px;"><i class="fas fa-lock" style="color:#ef4444;"></i></div><h1 style="font-size:28px;font-weight:900;margin-bottom:12px;">Subscription Required</h1><p style="color:#94a3b8;font-size:15px;margin-bottom:24px;">Your free trial has ended. Please subscribe to continue using SHEDS POS.</p><button onclick="window.location.href=\'subscription.html\'" style="background:#10b981;color:#fff;border:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:8px;"><i class="fas fa-calendar-check"></i> Go to Subscription</button></div>';
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    }
}
function initCommon() {
    renderSidebar();
    renderUserMenu();
    startClock();
    checkSubscription();
    var name = $('pharmacyName') || $('pharmacyNameDisplay');
    if (name && API.getPharmacyName) name.innerHTML = '<i class="fas fa-clinic-medical"></i> ' + esc(API.getPharmacyName() || 'Danzona POS');
}
    function requireAuth() {
        if (API.isLoggedIn && API.isLoggedIn()) return true;
        if (getQueryParameter('demo') === '1') return true;
        navigateTo('login.html');
        return false;
    }
    return {
        $: $, esc: esc, navigateTo: navigateTo, formatCurrency: formatCurrency, formatNumber: formatNumber, formatDate: formatDate, today: today, getQueryParameter: getQueryParameter, showToast: showToast, openModal: openModal, closeModal: closeModal, exportCSV: exportCSV, printTable: printTable, renderSidebar: renderSidebar, renderUserMenu: renderUserMenu, switchToAdmin: switchToAdmin, logout: logout, statusBadge: statusBadge, debounce: debounce, initCommon: initCommon, requireAuth: requireAuth
    };
})();
window.POS = POS;
document.addEventListener('DOMContentLoaded', function() { POS.initCommon(); });
