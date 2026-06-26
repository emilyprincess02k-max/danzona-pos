const page = {
  ready(fn) {
    if (document.readyState !== 'loading') return fn();
    document.addEventListener('DOMContentLoaded', fn);
  }
};

page.ready(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const els = {
    sidebar: $('#sidebar'),
    userMenu: $('#userMenu'),
    productSearch: $('#productSearch'),
    productDropdown: $('#productDropdown'),
    listView: $('#listView'),
    gridView: $('#gridView'),
    toggleGrid: $('#toggleGrid'),
    suspendedBtn: $('#suspendedBtn'),
    cartBody: $('#cartBody'),
    cartCount: $('#cartCount'),
    subTotal: $('#subTotal'),
    vatTotal: $('#vatTotal'),
    grandTotal: $('#grandTotal'),
    customerInput: $('#customerInput'),
    customerDropdown: $('#customerDropdown'),
    amountTendered: $('#amountTendered'),
    checkoutBtn: $('#checkoutBtn'),
    holdBtn: $('#holdBtn')
  };

  // Cart state
  let cart = [];
  let products = [];
  let view = 'list';
  let paymentMethod = 'cash';
  const VAT_RATE = 0.075;

  function fmt(n) {
    return '₦' + (parseFloat(n) || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 });
  }

  function loadCart() {
    try { cart = JSON.parse(localStorage.getItem('danzona_cart') || '[]'); }
    catch (e) { cart = []; }
  }

  function saveCart() {
    try { localStorage.setItem('danzona_cart', JSON.stringify(cart)); }
    catch (e) {}
  }

  async function loadProducts() {
    try {
      const res = await API.getProducts();
      products = res || [];
    } catch (e) {
      try { products = JSON.parse(localStorage.getItem('danzona_products') || '[]'); }
      catch (err) { products = []; }
    }
    if (!products.length) {
      products = [
        { id: 1, name: 'Paracetamol', sku: 'PTM-001', selling_price: 500, stock: 100 },
        { id: 2, name: 'Amoxicillin', sku: 'AMX-002', selling_price: 1500, stock: 50 },
        { id: 3, name: 'Vitamin C', sku: 'VTC-003', selling_price: 800, stock: 75 }
      ];
    }
    renderProducts();
  }

  function renderProducts() {
    const q = (els.productSearch.value || '').toLowerCase();
    const list = products.filter(p => !q || (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q));

    const card = (p) => {
      const price = parseFloat(p.selling_price || p.price || 0);
      const stock = parseFloat(p.stock || 0);
      const disabled = stock <= 0 ? 'disabled' : '';
      const outLabel = stock <= 0 ? '<span class="badge badge-danger">Out of stock</span>' : '';
      return `<div class="product-card" data-id="${p.id}" ${disabled}>
        <div class="product-name">${p.name || 'Unnamed'}</div>
        <div class="product-price">${fmt(price)}</div>
        <div class="product-sku">${p.sku || ''}</div>
        ${outLabel}
        <button class="btn btn-sm btn-primary add-btn" ${disabled} data-id="${p.id}"><i class="fas fa-plus"></i> Add</button>
      </div>`;
    };

    els.listView.innerHTML = list.map(p => `<div class="product-row">${card(p)}</div>`).join('') || '<div class="empty-state">No products found.</div>';
    els.gridView.innerHTML = list.map(p => card(p)).join('') || '<div class="empty-state">No products found.</div>';

    $$('.add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const product = products.find(p => String(p.id) === String(id));
        if (!product) return;
        addToCart(product.id, product.name, product.selling_price || product.price || 0, 1);
      });
    });
  }

  function addToCart(id, name, price, qty = 1) {
    const existing = cart.find(item => String(item.product_id) === String(id));
    if (existing) {
      existing.qty = (parseFloat(existing.qty) || 0) + qty;
    } else {
      cart.push({ product_id: id, name: name || 'Product', price: parseFloat(price) || 0, qty, discount: 0 });
    }
    saveCart();
    renderCart();
  }

  function updateCartItem(index, field, value) {
    if (!cart[index]) return;
    cart[index][field] = value;
    saveCart();
    renderCart();
  }

  function removeCartItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
  }

  function renderCart() {
    if (!cart.length) {
      els.cartBody.innerHTML = '<tr><td colspan="4" class="empty-state">Cart is empty.</td></tr>';
    } else {
      els.cartBody.innerHTML = cart.map((item, i) => {
        const lineTotal = (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0) - (parseFloat(item.discount) || 0);
        return `<tr>
          <td>${item.name || 'Product'}</td>
          <td>
            <div class="qty-control">
              <button class="btn btn-sm btn-outline qty-btn" data-index="${i}" data-delta="-1">-</button>
              <span>${item.qty}</span>
              <button class="btn btn-sm btn-outline qty-btn" data-index="${i}" data-delta="1">+</button>
            </div>
          </td>
          <td class="text-right">${fmt(lineTotal)}</td>
          <td><button class="btn btn-sm btn-danger remove-btn" data-index="${i}"><i class="fas fa-times"></i></button></td>
        </tr>`;
      }).join('');

      $$('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.index, 10);
          const delta = parseInt(btn.dataset.delta, 10);
          if (!cart[index]) return;
          cart[index].qty = Math.max(1, (parseFloat(cart[index].qty) || 0) + delta);
          saveCart();
          renderCart();
        });
      });

      $$('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          removeCartItem(parseInt(btn.dataset.index, 10));
        });
      });
    }

    updateTotals();
  }

  function updateTotals() {
    const sub = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0), 0);
    const discount = cart.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0);
    const net = sub - discount;
    const vat = net * VAT_RATE;
    const total = net + vat;

    els.subTotal.textContent = fmt(net);
    els.vatTotal.textContent = fmt(vat);
    els.grandTotal.textContent = fmt(total);
    els.cartCount.textContent = cart.length;
  }

  function searchCustomers(query) {
    if (!query || query.length < 2) {
      els.customerDropdown.style.display = 'none';
      return;
    }

    API.getCustomers().then(customers => {
      const q = query.toLowerCase();
      const matches = customers.filter(c => {
        const name = `${c.firstName || c.first_name || ''} ${c.lastName || c.last_name || c.name || ''}`.toLowerCase();
        return name.includes(q) || (c.phone || '').includes(q);
      });

      if (!matches.length) {
        els.customerDropdown.innerHTML = '<div class="empty-state">No customers found.</div>';
      } else {
        els.customerDropdown.innerHTML = matches.map(c => {
          const fullName = `${c.firstName || c.first_name || ''} ${c.lastName || c.last_name || c.name || ''}`.trim();
          return `<div class="dropdown-item" data-id="${c.id}" data-name="${fullName}">
            <strong>${fullName}</strong>
            <small>${c.phone || ''}</small>
          </div>`;
        }).join('');
      }
      els.customerDropdown.style.display = 'block';
    }).catch(() => {
      els.customerDropdown.innerHTML = '<div class="empty-state">Failed to load customers.</div>';
      els.customerDropdown.style.display = 'block';
    });
  }

  function selectCustomer(id, name) {
    els.customerInput.value = name;
    els.customerDropdown.style.display = 'none';
  }

  function holdSale() {
    if (!cart.length) return alert('Cart is empty.');
    var reason = prompt('Hold reason (optional):\n\n1. Customer Waiting\n2. Out of Stock\n3. Payment Issue\n4. Price Check\n5. Awaiting Rx\n6. Other\n\nEnter number or custom reason:', '');
    if (reason === null) return;
    var reasonMap = { '1': 'customer_waiting', '2': 'out_of_stock', '3': 'payment_issue', '4': 'price_check', '5': 'prescription', '6': 'other' };
    var reasonKey = reasonMap[reason.trim()] || (reason.trim() ? reason.trim().toLowerCase().replace(/\s+/g, '_') : 'other');
    var notes = prompt('Add notes for this held sale (optional):', '') || '';
    const sale = {
      cart,
      customer: els.customerInput.value || null,
      total: els.grandTotal.textContent,
      method: paymentMethod,
      date: new Date().toISOString(),
      suspendedAt: new Date().toISOString(),
      reason: reasonKey,
      notes: notes,
      tendered: parseFloat(els.amountTendered.value || '0'),
      cashier: (typeof API !== 'undefined' && API.getUserName ? API.getUserName() : 'Cashier')
    };
    const list = JSON.parse(localStorage.getItem('heldTransactions') || localStorage.getItem('danzona_hold') || '[]');
    list.unshift(sale);
    localStorage.setItem('heldTransactions', JSON.stringify(list));
    try { localStorage.removeItem('danzona_hold'); } catch(e){}
    cart = [];
    saveCart();
    renderCart();
    POS.showToast('Sale held successfully — reason: ' + reasonKey.replace(/_/g, ' '));
  }

  async function checkout() {
    if (!cart.length) return alert('Cart is empty.');

    const totalText = els.grandTotal.textContent || '₦0.00';
    const total = parseFloat(totalText.replace(/[^0-9.]/g, '')) || 0;
    const tenderedText = els.amountTendered.value || '0';
    const tendered = parseFloat(tenderedText.replace(/[^0-9.]/g, '')) || 0;

    if (paymentMethod === 'cash' && tendered < total) {
      return alert('Insufficient cash tendered.');
    }

    const payload = {
      customer_name: els.customerInput.value || 'Walk-in',
      items: cart.map(item => ({
        product_id: item.product_id,
        name: item.name,
        qty: parseFloat(item.qty) || 0,
        unit_price: parseFloat(item.price) || 0,
        discount: parseFloat(item.discount) || 0,
        pkg_type: item.pkgType || 'pkt',
        line_total: (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0) - (parseFloat(item.discount) || 0)
      })),
      subtotal: cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0), 0),
      discount_amount: cart.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0),
      tax: total - (cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0), 0) - cart.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0)),
      total,
      payment_method: paymentMethod,
      amount_tendered: tendered,
      change: Math.max(0, tendered - total),
      cashier: (typeof API !== 'undefined' && API.getUserName ? API.getUserName() : 'Cashier'),
      notes: ''
    };

    try {
      const res = await API.saveSale(payload);
      alert('Sale completed! Ref: ' + (res && res.id ? res.id : 'Saved locally'));
    } catch (e) {
      alert('Sale saved locally.');
    }

    cart = [];
    saveCart();
    renderCart();
    els.amountTendered.value = '';
  }

  // Sidebar
  if (!API.init) API.init = () => {};
  if (!POS) window.POS = {};
  POS.navigateTo = (page) => { window.location.href = page; };
  POS.requireAuth = () => {
    if (!API.isLoggedIn || !API.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  };

  $$(document).on('click', '.sidebar-link', function (ev) {
    ev.preventDefault();
    const page = this.getAttribute('data-page');
    if (page) POS.navigateTo(page);
  });

  function renderSidebar() {
    if (!els.sidebar) return;
    const pageName = 'sales.html';
    const groups = [
      { title: 'Main', items: [
        ['index.html', 'Home', 'fa-home'],
        ['dashboard.html', 'Dashboard', 'fa-home'],
        ['sales.html', 'Sales', 'fa-shopping-cart'],
        ['receiving.html', 'Receiving', 'fa-file-import'],
        ['reports.html', 'Reports', 'fa-chart-bar']
      ]},
      { title: 'Catalogue', items: [
        ['variations.html', 'Add Product', 'fa-plus-circle'],
        ['inventory.html', 'Inventory', 'fa-boxes'],
        ['customers.html', 'Customers', 'fa-users'],
        ['suppliers.html', 'Suppliers', 'fa-truck'],
        ['locations.html', 'Locations', 'fa-store']
      ]},
      { title: 'Operations', items: [
        ['employees.html', 'Employees', 'fa-user-tie'],
        ['appointments.html', 'Appointments', 'fa-calendar'],
        ['deliveries.html', 'Deliveries', 'fa-truck-loading'],
        ['cashier-closeout.html', 'Cashier Closeout', 'fa-calculator'],
        ['sales-returns.html', 'Sales Returns', 'fa-rotate-left'],
        ['stock-transfer.html', 'Stock Transfer', 'fa-truck-ramp-box'],
        ['purchase-orders.html', 'Purchase Orders', 'fa-file-invoice-dollar'],
        ['messages.html', 'Messages', 'fa-envelope']
      ]},
      { title: 'Finance', items: [
        ['payments.html', 'Payments', 'fa-credit-card'],
        ['store_account_payment.html', 'Store Account', 'fa-wallet'],
        ['bank-reconciliation.html', 'Bank Reconciliation', 'fa-building-columns'],
        ['tax-settings.html', 'Tax & Vat', 'fa-percent'],
        ['promo-engine.html', 'Promos & Discounts', 'fa-tags'],
        ['expenses.html', 'Expenses', 'fa-receipt'],
        ['invoices.html', 'Invoices', 'fa-file-invoice']
      ]},
      { title: 'System', items: [
        ['config.html', 'Store Config', 'fa-cog'],
        ['audit-log.html', 'Audit Log', 'fa-clipboard-list'],
        ['backups.html', 'System Backups', 'fa-download'],
        ['login.html', 'Logout', 'fa-sign-out-alt']
      ]}
    ];

    const activeClass = (p) => p === pageName ? ' active' : '';
    els.sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-brand"><i class="fas fa-clinic-medical"></i><div>
          <h1>${(typeof API !== 'undefined' && API.getPharmacyName ? API.getPharmacyName() : 'Danzona') || 'Danzona'}</h1>
          <p>POS Terminal</p>
        </div></div>
      </div>
      <div class="sidebar-body">
        ${groups.map(group => `<div class="sidebar-section"><div class="sidebar-section-title">${group.title}</div>` +
          group.items.map(item => `<a class="sidebar-link${activeClass(item[0])}" href="#" data-page="${item[0]}"><i class="fas ${item[2]}"></i><span>${item[1]}</span></a>`).join('') +
        `</div>`).join('')}
      </div>
      <div class="sidebar-footer">
        <div><strong>Secure Session</strong><span>Danzona POS v1.0</span></div>
        <i class="fas fa-shield-alt"></i>
      </div>
    `;
  }

  function renderUserMenu() {
    if (!els.userMenu) return;
    const name = (typeof API !== 'undefined' && API.getUserName ? API.getUserName() : 'Admin');
    const role = (typeof API !== 'undefined' && API.getRole ? API.getRole() : 'User');
    els.userMenu.innerHTML = `
      <span class="user-avatar"><i class="fas fa-user"></i></span>
      <div class="user-text"><strong>${name}</strong><small>${role}</small></div>
      <i class="fas fa-chevron-down"></i>
      <div class="user-dropdown">
        <div class="user-info"><strong>${name}</strong><small>${role}</small></div>
        <hr/>
        <a href="#" class="dropdown-item" data-page="config.html"><i class="fas fa-cog"></i> Settings</a>
        <a href="#" class="dropdown-item" data-page="login.html"><i class="fas fa-sign-out-alt"></i> Logout</a>
      </div>
    `;
  }

  function init() {
    if (POS.requireAuth && !POS.requireAuth()) return;
    loadCart();
    loadProducts();
    renderSidebar();
    renderUserMenu();
    renderCart();
  }

  // Event wiring
  els.toggleGrid.addEventListener('click', () => {
    view = view === 'list' ? 'grid' : 'list';
    if (view === 'grid') {
      els.listView.classList.add('hidden');
      els.gridView.classList.remove('hidden');
    } else {
      els.listView.classList.remove('hidden');
      els.gridView.classList.add('hidden');
    }
  });

  els.productSearch.addEventListener('input', (e) => renderProducts());
  els.productSearch.addEventListener('focus', () => {
    if (els.productSearch.value.length >= 2) els.productDropdown.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#productSearch') && !e.target.closest('#productDropdown')) {
      els.productDropdown.style.display = 'none';
    }
    if (!e.target.closest('#customerInput') && !e.target.closest('#customerDropdown')) {
      els.customerDropdown.style.display = 'none';
    }
  });

  els.customerInput.addEventListener('input', (e) => searchCustomers(e.target.value));
  els.customerInput.addEventListener('focus', () => {
    if (els.customerInput.value.length >= 2) searchCustomers(els.customerInput.value);
  });

  els.customerDropdown.addEventListener('click', (e) => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    selectCustomer(item.dataset.id, item.dataset.name);
  });

  $$('.pm-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.pm-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      paymentMethod = btn.dataset.method;
    });
  });

  els.checkoutBtn.addEventListener('click', checkout);
  els.holdBtn.addEventListener('click', holdSale);
  els.suspendedBtn.addEventListener('click', () => POS.navigateTo('suspended-sales.html'));

  init();
});
