import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

/* =====================================================
   KONFIGURASI SUPABASE
   Ganti dua nilai ini setelah project Supabase dibuat.
   Jika dikosongkan, aplikasi berjalan dalam mode demo.
===================================================== */
const SUPABASE_URL = 'PASTE_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'PASTE_SUPABASE_ANON_KEY';

const hasSupabase =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('PASTE');

const supabase = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/* =====================================================
   STATE
===================================================== */
const state = {
  mode: hasSupabase ? 'supabase' : 'demo',
  session: null,
  page: 'dashboard',
  filter: 'ALL',
  search: '',
  txType: 'EXPENSE',
  data: null
};

/* =====================================================
   HELPERS
===================================================== */
function $(id) {
  return document.getElementById(id);
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function localISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function todayISO() {
  return localISO(new Date());
}

function demoDate(day) {
  const now = new Date();
  const safeDay = Math.min(day, now.getDate());
  return localISO(new Date(now.getFullYear(), now.getMonth(), safeDay));
}

function rupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function signRp(value) {
  const n = Number(value) || 0;
  return (n >= 0 ? '+' : '-') + rupiah(Math.abs(n));
}

function dateShort(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;

  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short'
  });
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function toast(message, isError = false) {
  const el = $('toast');
  el.textContent = message;
  el.className = 'show' + (isError ? ' error' : '');

  setTimeout(() => {
    el.className = '';
  }, 3200);
}

function emptyHTML(message) {
  return `<div class="empty">${esc(message || 'Belum ada data.')}</div>`;
}

/* =====================================================
   DEMO DATA
===================================================== */
const demoData = {
  user: {
    name: 'Demo User',
    email: 'demo@finance.app'
  },

  accounts: [
    {
      id: 'acc_cash',
      account_name: 'Cash',
      account_type: 'Cash',
      initial_balance: 500000,
      current_balance: 425000,
      status: 'ACTIVE'
    },
    {
      id: 'acc_bca',
      account_name: 'BCA',
      account_type: 'Bank',
      initial_balance: 4000000,
      current_balance: 4750000,
      status: 'ACTIVE'
    },
    {
      id: 'acc_dana',
      account_name: 'DANA',
      account_type: 'E-Wallet',
      initial_balance: 200000,
      current_balance: 150000,
      status: 'ACTIVE'
    }
  ],

  categories: [
    { id: 'cat_makan', category_name: 'Makanan', transaction_type: 'EXPENSE', icon: '🍔', status: 'ACTIVE' },
    { id: 'cat_transport', category_name: 'Transportasi', transaction_type: 'EXPENSE', icon: '🚗', status: 'ACTIVE' },
    { id: 'cat_tagihan', category_name: 'Tagihan', transaction_type: 'EXPENSE', icon: '🧾', status: 'ACTIVE' },
    { id: 'cat_gaji', category_name: 'Gaji', transaction_type: 'INCOME', icon: '💼', status: 'ACTIVE' },
    { id: 'cat_freelance', category_name: 'Freelance', transaction_type: 'INCOME', icon: '🧑‍💻', status: 'ACTIVE' }
  ],

  transactions: [
    {
      id: 'tx_1',
      transaction_date: demoDate(1),
      transaction_type: 'INCOME',
      account_id: 'acc_bca',
      category_id: 'cat_gaji',
      amount: 7500000,
      description: 'Gaji bulanan',
      accounts: { account_name: 'BCA' },
      categories: { category_name: 'Gaji', icon: '💼' }
    },
    {
      id: 'tx_2',
      transaction_date: demoDate(2),
      transaction_type: 'EXPENSE',
      account_id: 'acc_cash',
      category_id: 'cat_makan',
      amount: 35000,
      description: 'Makan siang',
      accounts: { account_name: 'Cash' },
      categories: { category_name: 'Makanan', icon: '🍔' }
    },
    {
      id: 'tx_3',
      transaction_date: demoDate(3),
      transaction_type: 'EXPENSE',
      account_id: 'acc_dana',
      category_id: 'cat_transport',
      amount: 52000,
      description: 'Top up ojek online',
      accounts: { account_name: 'DANA' },
      categories: { category_name: 'Transportasi', icon: '🚗' }
    },
    {
      id: 'tx_4',
      transaction_date: demoDate(4),
      transaction_type: 'EXPENSE',
      account_id: 'acc_bca',
      category_id: 'cat_tagihan',
      amount: 350000,
      description: 'Internet rumah',
      accounts: { account_name: 'BCA' },
      categories: { category_name: 'Tagihan', icon: '🧾' }
    }
  ],

  budgets: [
    {
      id: 'bud_1',
      category_id: 'cat_makan',
      budget_amount: 1500000,
      categories: { category_name: 'Makanan' }
    },
    {
      id: 'bud_2',
      category_id: 'cat_transport',
      budget_amount: 700000,
      categories: { category_name: 'Transportasi' }
    },
    {
      id: 'bud_3',
      category_id: 'cat_tagihan',
      budget_amount: 900000,
      categories: { category_name: 'Tagihan' }
    }
  ]
};

/* =====================================================
   INIT
===================================================== */
init();

function init() {
  bindStatic();

  if (supabase) {
    initAuth();
  } else {
    enterDemo();
  }
}

function bindStatic() {
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.page = btn.dataset.page;
      render();
    });
  });

  $('fab').addEventListener('click', openTxSheet);
  $('backBtn').addEventListener('click', () => {
    state.page = 'menu';
    render();
  });

  $('sheetOverlay').addEventListener('mousedown', (e) => {
    if (e.target === $('sheetOverlay')) closeSheet();
  });

  $('sheetClose').addEventListener('click', closeSheet);
  $('demoBtn').addEventListener('click', enterDemo);
  $('loginForm').addEventListener('submit', loginEmail);
}

/* =====================================================
   AUTH
===================================================== */
async function initAuth() {
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    state.session = data.session;
    showApp();
    loadData();
  } else {
    showAuth();
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    state.session = session;

    if (session) {
      showApp();
      loadData();
    } else {
      showAuth();
    }
  });
}

async function loginEmail(e) {
  e.preventDefault();

  if (!supabase) {
    enterDemo();
    return;
  }

  const email = $('email').value.trim();

  if (!email) {
    toast('Email wajib diisi.', true);
    return;
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) throw error;

    toast('Cek email kamu untuk link login.');
  } catch (err) {
    toast(err.message || 'Gagal mengirim link login.', true);
  }
}

function enterDemo() {
  state.mode = 'demo';
  state.session = null;
  state.data = clone(demoData);

  showApp();
  render();
}

async function logout() {
  if (supabase) {
    await supabase.auth.signOut();
  }

  state.session = null;
  state.data = null;
  showAuth();
}

function showAuth() {
  $('authScreen').classList.remove('hidden');
  $('appScreen').classList.add('hidden');
}

function showApp() {
  $('authScreen').classList.add('hidden');
  $('appScreen').classList.remove('hidden');

  const identity =
    state.session?.user?.email ||
    state.data?.user?.email ||
    'demo@finance.app';

  $('userSub').textContent = identity;
  $('userAvatar').textContent = identity.charAt(0).toUpperCase();
}

/* =====================================================
   LOAD DATA
===================================================== */
async function loadData() {
  if (!supabase || !state.session) {
    state.data = clone(demoData);
    render();
    return;
  }

  try {
    const accountsQ = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: true });

    const categoriesQ = await supabase
      .from('categories')
      .select('*')
      .order('category_name', { ascending: true });

    const transactionsQ = await supabase
      .from('transactions')
      .select(`
        *,
        accounts (
          account_name
        ),
        categories (
          category_name,
          icon
        )
      `)
      .order('transaction_date', { ascending: false })
      .limit(100);

    const budgetsQ = await supabase
      .from('budgets')
      .select(`
        *,
        categories (
          category_name
        )
      `)
      .limit(100);

    const error =
      accountsQ.error ||
      categoriesQ.error ||
      transactionsQ.error ||
      budgetsQ.error;

    if (error) throw error;

    state.data = {
      user: {
        email: state.session?.user?.email || ''
      },
      accounts: accountsQ.data || [],
      categories: categoriesQ.data || [],
      transactions: transactionsQ.data || [],
      budgets: budgetsQ.data || []
    };

    showApp();
    render();
  } catch (err) {
    console.error(err);

    state.mode = 'demo';
    state.data = clone(demoData);

    showApp();
    render();

    toast('Supabase belum siap. Menampilkan mode demo.', true);
  }
}

/* =====================================================
   DATA HELPERS
===================================================== */
function getTotalBalance() {
  return state.data.accounts.reduce((sum, a) => {
    return sum + Number(a.current_balance ?? a.initial_balance ?? 0);
  }, 0);
}

function getMonthTransactions() {
  const now = new Date();

  return state.data.transactions.filter((t) => {
    const d = new Date(t.transaction_date);

    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth()
    );
  });
}

function getMonthlyTotals() {
  return getMonthTransactions().reduce(
    (acc, t) => {
      if (t.transaction_type === 'INCOME') {
        acc.income += Number(t.amount) || 0;
      } else {
        acc.expense += Number(t.amount) || 0;
      }

      return acc;
    },
    { income: 0, expense: 0 }
  );
}

function categoryName(id) {
  const c = state.data.categories.find((x) => x.id === id);
  return c?.category_name || 'Umum';
}

function categoryIcon(id) {
  const c = state.data.categories.find((x) => x.id === id);
  return c?.icon || '💠';
}

function accountName(id) {
  const a = state.data.accounts.find((x) => x.id === id);
  return a?.account_name || 'Akun';
}

function filteredTransactions() {
  let rows = [...state.data.transactions];

  rows.sort((a, b) => {
    return new Date(b.transaction_date) - new Date(a.transaction_date);
  });

  if (state.filter !== 'ALL') {
    rows = rows.filter((t) => t.transaction_type === state.filter);
  }

  if (state.search) {
    const q = state.search.toLowerCase();

    rows = rows.filter((t) => {
      const desc = String(t.description || '').toLowerCase();
      const cat = String(t.categories?.category_name || categoryName(t.category_id)).toLowerCase();
      const acc = String(t.accounts?.account_name || accountName(t.account_id)).toLowerCase();

      return (
        desc.includes(q) ||
        cat.includes(q) ||
        acc.includes(q)
      );
    });
  }

  return rows;
}

function spentByCategory(categoryId) {
  return getMonthTransactions()
    .filter((t) => t.transaction_type === 'EXPENSE' && t.category_id === categoryId)
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

function expenseByCategory() {
  const rows = getMonthTransactions().filter((t) => t.transaction_type === 'EXPENSE');
  const map = {};

  rows.forEach((t) => {
    const key = t.category_id;

    if (!map[key]) {
      map[key] = {
        id: key,
        name: t.categories?.category_name || categoryName(key),
        icon: t.categories?.icon || categoryIcon(key),
        amount: 0
      };
    }

    map[key].amount += Number(t.amount) || 0;
  });

  const total = Object.values(map).reduce((sum, item) => sum + item.amount, 0);

  return Object.values(map)
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      ...item,
      percent: total > 0 ? Math.round(item.amount / total * 100) : 0
    }));
}

/* =====================================================
   RENDER
===================================================== */
function render() {
  const main = $('mainContent');

  if (!state.data) {
    main.innerHTML = emptyHTML('Loading...');
    return;
  }

  const titles = {
    dashboard: 'Dashboard',
    transactions: 'Transaksi',
    budget: 'Budget',
    reports: 'Laporan',
    menu: 'Menu',
    accounts: 'Akun',
    categories: 'Kategori',
    recurring: 'Recurring',
    settings: 'Pengaturan'
  };

  $('pageTitle').textContent = titles[state.page] || 'Personal Finance';

  const mainPages = ['dashboard', 'transactions', 'budget', 'reports', 'menu'];
  $('backBtn').classList.toggle('hidden', mainPages.includes(state.page));

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.page === state.page);
  });

  if (state.page === 'dashboard') main.innerHTML = dashboardHTML();
  if (state.page === 'transactions') main.innerHTML = transactionsHTML();
  if (state.page === 'budget') main.innerHTML = budgetHTML();
  if (state.page === 'reports') main.innerHTML = reportsHTML();
  if (state.page === 'menu') main.innerHTML = menuHTML();
  if (state.page === 'accounts') main.innerHTML = accountsHTML();
  if (state.page === 'categories') main.innerHTML = categoriesHTML();
  if (state.page === 'recurring') main.innerHTML = recurringHTML();
  if (state.page === 'settings') main.innerHTML = settingsHTML();

  bindDynamic();
}

/* =====================================================
   PAGE HTML
===================================================== */
function dashboardHTML() {
  const totals = getMonthlyTotals();
  const balance = getTotalBalance();
  const net = totals.income - totals.expense;
  const savingRate = totals.income > 0
    ? Math.round(net / totals.income * 100)
    : 0;

  const recent = state.data.transactions.slice(0, 5);
  const budgets = state.data.budgets.slice(0, 3);

  return `
    <div class="page">
      <section class="hero-card">
        <div class="hero-label">Total Saldo</div>
        <div class="hero-balance">${rupiah(balance)}</div>

        <div class="hero-chips">
          <div class="chip success">↑ ${rupiah(totals.income)}</div>
          <div class="chip danger">↓ ${rupiah(totals.expense)}</div>
          <div class="chip">Saving ${savingRate}%</div>
        </div>
      </section>

      <section class="grid two">
        <div class="card">
          <div class="metric-label">Cash Flow Bulan Ini</div>
          <div class="metric-value ${net >= 0 ? 'good' : 'bad'}">${signRp(net)}</div>
        </div>

        <div class="card">
          <div class="metric-label">Transaksi Bulan Ini</div>
          <div class="metric-value">${getMonthTransactions().length}</div>
        </div>
      </section>

      <section>
        <h3 class="section-title">Budget</h3>
        <div class="list-card">
          ${budgets.length ? budgets.map(budgetItemHTML).join('') : emptyHTML('Belum ada budget.')}
        </div>
      </section>

      <section>
        <h3 class="section-title">Transaksi Terbaru</h3>
        <div class="list-card">
          ${recent.length ? recent.map(txItemHTML).join('') : emptyHTML('Belum ada transaksi.')}
        </div>
      </section>
    </div>
  `;
}

function transactionsHTML() {
  return `
    <div class="page">
      <div class="segment" id="txFilterSegment">
        <button class="segment-item ${state.filter === 'ALL' ? 'active' : ''}" data-filter="ALL" type="button">Semua</button>
        <button class="segment-item ${state.filter === 'INCOME' ? 'active' : ''}" data-filter="INCOME" type="button">Masuk</button>
        <button class="segment-item ${state.filter === 'EXPENSE' ? 'active' : ''}" data-filter="EXPENSE" type="button">Keluar</button>
      </div>

      <input id="txSearch" class="search" placeholder="Cari transaksi..." value="${esc(state.search)}" />

      <div id="txList" class="list-card">
        ${txListHTML(filteredTransactions())}
      </div>
    </div>
  `;
}

function budgetHTML() {
  const budgets = state.data.budgets || [];

  return `
    <div class="page">
      <div class="list-card">
        ${budgets.length ? budgets.map(budgetItemHTML).join('') : emptyHTML('Belum ada budget.')}
      </div>
    </div>
  `;
}

function reportsHTML() {
  const totals = getMonthlyTotals();
  const net = totals.income - totals.expense;
  const savingRate = totals.income > 0 ? Math.round(net / totals.income * 100) : 0;
  const categories = expenseByCategory().slice(0, 7);

  return `
    <div class="page">
      <section class="hero-card">
        <div class="hero-label">Laporan Bulan Ini</div>
        <div class="hero-balance">${signRp(net)}</div>

        <div class="hero-chips">
          <div class="chip success">Income ${rupiah(totals.income)}</div>
          <div class="chip danger">Expense ${rupiah(totals.expense)}</div>
          <div class="chip">Saving ${savingRate}%</div>
        </div>
      </section>

      <section class="card">
        <h3 class="section-title">Expense by Category</h3>
        ${
          categories.length
            ? categories.map((c) => `
              <div class="report-row">
                <div class="report-top">
                  <span>${esc(c.icon)} ${esc(c.name)}</span>
                  <span>${rupiah(c.amount)}</span>
                </div>
                <div class="progress">
                  <div class="progress-bar bad" style="width:${Math.min(100, c.percent)}%"></div>
                </div>
                <div class="muted small">${c.percent}% dari total expense</div>
              </div>
            `).join('')
            : emptyHTML('Belum ada pengeluaran bulan ini.')
        }
      </section>
    </div>
  `;
}

function menuHTML() {
  const email = state.session?.user?.email || state.data?.user?.email || 'demo@finance.app';
  const modeLabel = state.mode === 'supabase' ? 'Supabase' : 'Demo';

  return `
    <div class="page">
      <div class="profile-card">
        <div class="profile-avatar">${esc(email.charAt(0).toUpperCase())}</div>
        <div>
          <div class="profile-name">${esc(email.split('@')[0])}</div>
          <div class="profile-email">${esc(email)} • Mode ${modeLabel}</div>
        </div>
      </div>

      <div class="list-card menu-list" id="menuList">
        <div class="list-item" data-menu-page="accounts">
          <div class="list-icon">👛</div>
          <div class="list-info">
            <div class="list-title">Akun</div>
            <div class="list-sub">Cash, Bank, E-Wallet</div>
          </div>
          <div class="menu-arrow">›</div>
        </div>

        <div class="list-item" data-menu-page="categories">
          <div class="list-icon">🏷️</div>
          <div class="list-info">
            <div class="list-title">Kategori</div>
            <div class="list-sub">Income & Expense</div>
          </div>
          <div class="menu-arrow">›</div>
        </div>

        <div class="list-item" data-menu-page="recurring">
          <div class="list-icon">🔁</div>
          <div class="list-info">
            <div class="list-title">Recurring</div>
            <div class="list-sub">Transaksi berulang</div>
          </div>
          <div class="menu-arrow">›</div>
        </div>

        <div class="list-item" data-menu-page="settings">
          <div class="list-icon">⚙️</div>
          <div class="list-info">
            <div class="list-title">Pengaturan</div>
            <div class="list-sub">Status koneksi & logout</div>
          </div>
          <div class="menu-arrow">›</div>
        </div>
      </div>

      ${
        supabase && state.session
          ? `<button id="logoutBtn" class="btn danger full" type="button">Logout</button>`
          : ''
      }
    </div>
  `;
}

function accountsHTML() {
  const accounts = state.data.accounts || [];
  const total = getTotalBalance();

  return `
    <div class="page">
      <div class="toolbar">
        <button id="addAccountBtn" class="btn primary" type="button">+ Akun</button>
      </div>

      <section class="hero-card">
        <div class="hero-label">Total Saldo</div>
        <div class="hero-balance">${rupiah(total)}</div>
      </section>

      <div class="list-card">
        ${
          accounts.length
            ? accounts.map(accountItemHTML).join('')
            : emptyHTML('Belum ada akun.')
        }
      </div>
    </div>
  `;
}

function categoriesHTML() {
  const categories = state.data.categories || [];

  return `
    <div class="page">
      <div class="toolbar">
        <button id="addCategoryBtn" class="btn primary" type="button">+ Kategori</button>
      </div>

      <div class="list-card">
        ${
          categories.length
            ? categories.map(categoryItemHTML).join('')
            : emptyHTML('Belum ada kategori.')
        }
      </div>
    </div>
  `;
}

function recurringHTML() {
  return `
    <div class="page">
      ${emptyHTML('Fitur recurring akan disambungkan setelah schema Supabase dilanjutkan.')}
    </div>
  `;
}

function settingsHTML() {
  const email = state.session?.user?.email || state.data?.user?.email || 'demo@finance.app';
  const modeLabel = state.mode === 'supabase' ? 'Terhubung ke Supabase' : 'Mode Demo';

  return `
    <div class="page">
      <div class="card">
        <div class="metric-label">Status</div>
        <div class="metric-value">${modeLabel}</div>
        <p class="muted small">Email: ${esc(email)}</p>
      </div>

      ${
        supabase && state.session
          ? `<button id="logoutBtn2" class="btn danger full" type="button">Logout</button>`
          : ''
      }
    </div>
  `;
}

/* =====================================================
   ITEM HTML
===================================================== */
function txItemHTML(t) {
  const isIncome = t.transaction_type === 'INCOME';
  const catName = t.categories?.category_name || categoryName(t.category_id);
  const accName = t.accounts?.account_name || accountName(t.account_id);
  const icon = t.categories?.icon || categoryIcon(t.category_id);

  return `
    <div class="list-item">
      <div class="list-icon">${esc(icon)}</div>

      <div class="list-info">
        <div class="list-title">${esc(t.description || catName)}</div>
        <div class="list-sub">${esc(catName)} • ${esc(accName)} • ${dateShort(t.transaction_date)}</div>
      </div>

      <div class="list-amount ${isIncome ? 'income' : 'expense'}">
        ${isIncome ? '+' : '-'}${rupiah(t.amount)}
      </div>
    </div>
  `;
}

function txListHTML(rows) {
  if (!rows.length) {
    return emptyHTML('Tidak ada transaksi.');
  }

  return rows.map(txItemHTML).join('');
}

function budgetItemHTML(b) {
  const catName = b.categories?.category_name || categoryName(b.category_id);
  const spent = spentByCategory(b.category_id);
  const budget = Number(b.budget_amount) || 0;
  const percent = budget > 0 ? Math.round(spent / budget * 100) : 0;

  let status = 'SAFE';
  if (percent > 100) status = 'OVER BUDGET';
  else if (percent >= 91) status = 'CRITICAL';
  else if (percent >= 71) status = 'WARNING';

  const statusClass = status.toLowerCase().replace(' ', '-');
  const barClass = percent > 100 ? 'bad' : percent >= 91 ? 'bad' : percent >= 71 ? 'warn' : 'good';

  return `
    <div class="list-item" style="display:block;">
      <div class="progress-top">
        <span>${esc(catName)}</span>
        <span>${rupiah(spent)} / ${rupiah(budget)}</span>
      </div>

      <div class="progress">
        <div class="progress-bar ${barClass}" style="width:${Math.min(100, percent)}%"></div>
      </div>

      <div class="progress-top small">
        <span class="badge ${statusClass}">${status}</span>
        <span class="muted">${percent}%</span>
      </div>
    </div>
  `;
}

function accountItemHTML(a) {
  const iconMap = {
    Cash: '💵',
    Bank: '🏦',
    'E-Wallet': '📱',
    Other: '💳'
  };

  return `
    <div class="list-item">
      <div class="list-icon">${iconMap[a.account_type] || '💳'}</div>

      <div class="list-info">
        <div class="list-title">${esc(a.account_name)}</div>
        <div class="list-sub">${esc(a.account_type)}</div>
      </div>

      <div class="list-amount">${rupiah(a.current_balance ?? a.initial_balance ?? 0)}</div>
    </div>
  `;
}

function categoryItemHTML(c) {
  return `
    <div class="list-item">
      <div class="list-icon">${esc(c.icon || '🏷️')}</div>

      <div class="list-info">
        <div class="list-title">${esc(c.category_name)}</div>
        <div class="list-sub">${c.transaction_type === 'INCOME' ? 'Income' : 'Expense'}</div>
      </div>

      <span class="badge ${c.transaction_type.toLowerCase()}">
        ${c.transaction_type === 'INCOME' ? 'Income' : 'Expense'}
      </span>
    </div>
  `;
}

/* =====================================================
   DYNAMIC BINDING
===================================================== */
function bindDynamic() {
  if (state.page === 'transactions') {
    const search = $('txSearch');

    if (search) {
      search.addEventListener('input', (e) => {
        state.search = e.target.value;
        $('txList').innerHTML = txListHTML(filteredTransactions());
      });
    }

    document.querySelectorAll('#txFilterSegment .segment-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.filter = btn.dataset.filter;

        document.querySelectorAll('#txFilterSegment .segment-item').forEach((b) => {
          b.classList.toggle('active', b.dataset.filter === state.filter);
        });

        $('txList').innerHTML = txListHTML(filteredTransactions());
      });
    });
  }

  if (state.page === 'menu') {
    document.querySelectorAll('#menuList [data-menu-page]').forEach((item) => {
      item.addEventListener('click', () => {
        state.page = item.dataset.menuPage;
        render();
      });
    });

    $('logoutBtn')?.addEventListener('click', logout);
  }

  if (state.page === 'accounts') {
    $('addAccountBtn')?.addEventListener('click', openAccountSheet);
  }

  if (state.page === 'categories') {
    $('addCategoryBtn')?.addEventListener('click', openCategorySheet);
  }

  if (state.page === 'settings') {
    $('logoutBtn2')?.addEventListener('click', logout);
  }
}

/* =====================================================
   BOTTOM SHEET
===================================================== */
function openSheet(title, html) {
  $('sheetTitle').textContent = title;
  $('sheetBody').innerHTML = html;
  $('sheetOverlay').classList.remove('hidden');
}

function closeSheet() {
  $('sheetOverlay').classList.add('hidden');
}

/* =====================================================
   ADD TRANSACTION
===================================================== */
function openTxSheet() {
  if (!state.data) return;

  state.txType = 'EXPENSE';

  const accountOptions = state.data.accounts
    .map((a) => `<option value="${esc(a.id)}">${esc(a.account_name)}</option>`)
    .join('');

  openSheet('Tambah Transaksi', `
    <form id="txForm" class="form">
      <div class="segment small" id="txTypeSegment">
        <button type="button" class="segment-item active" data-txtype="EXPENSE">Keluar</button>
        <button type="button" class="segment-item" data-txtype="INCOME">Masuk</button>
      </div>

      <div class="form-group">
        <label>Nominal</label>
        <input id="txAmount" inputmode="numeric" placeholder="Rp 0" required />
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label>Tanggal</label>
          <input type="date" id="txDate" value="${todayISO()}" required />
        </div>

        <div class="form-group">
          <label>Akun</label>
          <select id="txAccount" required>${accountOptions}</select>
        </div>
      </div>

      <div class="form-group">
        <label>Kategori</label>
        <select id="txCategory" required></select>
      </div>

      <div class="form-group">
        <label>Deskripsi</label>
        <input id="txDescription" placeholder="Contoh: Makan siang" />
      </div>

      <button class="btn primary full" type="submit">Simpan Transaksi</button>
    </form>
  `);

  bindTxSheet();
}

function bindTxSheet() {
  fillTxCategories();

  document.querySelectorAll('#txTypeSegment .segment-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.txType = btn.dataset.txtype;

      document.querySelectorAll('#txTypeSegment .segment-item').forEach((b) => {
        b.classList.toggle('active', b.dataset.txtype === state.txType);
      });

      fillTxCategories();
    });
  });

  const amount = $('txAmount');

  amount.addEventListener('input', function () {
    const digits = this.value.replace(/\D/g, '');
    this.dataset.raw = digits;
    this.value = digits ? new Intl.NumberFormat('id-ID').format(digits) : '';
  });

  $('txForm').addEventListener('submit', submitTx);
}

function fillTxCategories() {
  const cats = state.data.categories.filter((c) => {
    const active = !c.status || c.status === 'ACTIVE';
    return c.transaction_type === state.txType && active;
  });

  $('txCategory').innerHTML = cats.length
    ? cats.map((c) => `
      <option value="${esc(c.id)}">${esc(c.icon || '')} ${esc(c.category_name)}</option>
    `).join('')
    : '<option value="">Belum ada kategori</option>';
}

async function submitTx(e) {
  e.preventDefault();

  const amount = Number($('txAmount').dataset.raw || 0);
  const payload = {
    transaction_date: $('txDate').value,
    transaction_type: state.txType,
    account_id: $('txAccount').value,
    category_id: $('txCategory').value,
    amount,
    description: $('txDescription').value.trim()
  };

  if (!payload.transaction_date) return toast('Tanggal wajib diisi.', true);
  if (!payload.account_id) return toast('Akun wajib dipilih.', true);
  if (!payload.category_id) return toast('Kategori wajib dipilih.', true);
  if (!(amount > 0)) return toast('Nominal harus lebih dari 0.', true);

  const submitBtn = e.submitter;
  if (submitBtn) submitBtn.disabled = true;

  if (state.mode === 'supabase' && state.session) {
    const { error } = await supabase
      .from('transactions')
      .insert(payload);

    if (error) {
      toast(error.message, true);
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    toast('Transaksi disimpan.');
    closeSheet();
    await loadData();
    return;
  }

  const localTx = {
    id: 'local_' + Date.now(),
    ...payload,
    accounts: {
      account_name: accountName(payload.account_id)
    },
    categories: {
      category_name: categoryName(payload.category_id),
      icon: categoryIcon(payload.category_id)
    }
  };

  state.data.transactions.unshift(localTx);

  closeSheet();
  render();
  toast('Transaksi demo disimpan.');
}

/* =====================================================
   ADD ACCOUNT
===================================================== */
function openAccountSheet() {
  openSheet('Tambah Akun', `
    <form id="accountForm" class="form">
      <div class="form-group">
        <label>Nama Akun</label>
        <input id="accName" placeholder="BCA, DANA, Cash" required />
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label>Tipe</label>
          <select id="accType">
            <option>Cash</option>
            <option>Bank</option>
            <option>E-Wallet</option>
            <option>Other</option>
          </select>
        </div>

        <div class="form-group">
          <label>Saldo Awal</label>
          <input id="accInitial" inputmode="numeric" placeholder="Rp 0" />
        </div>
      </div>

      <button class="btn primary full" type="submit">Simpan Akun</button>
    </form>
  `);

  const initial = $('accInitial');

  initial.addEventListener('input', function () {
    const digits = this.value.replace(/\D/g, '');
    this.dataset.raw = digits;
    this.value = digits ? new Intl.NumberFormat('id-ID').format(digits) : '';
  });

  $('accountForm').addEventListener('submit', submitAccount);
}

async function submitAccount(e) {
  e.preventDefault();

  const payload = {
    account_name: $('accName').value.trim(),
    account_type: $('accType').value,
    initial_balance: Number($('accInitial').dataset.raw || 0),
    current_balance: Number($('accInitial').dataset.raw || 0)
  };

  if (!payload.account_name) return toast('Nama akun wajib diisi.', true);

  const submitBtn = e.submitter;
  if (submitBtn) submitBtn.disabled = true;

  if (state.mode === 'supabase' && state.session) {
    const { error } = await supabase
      .from('accounts')
      .insert(payload);

    if (error) {
      toast(error.message, true);
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    toast('Akun disimpan.');
    closeSheet();
    await loadData();
    return;
  }

  state.data.accounts.push({
    id: 'local_' + Date.now(),
    ...payload,
    status: 'ACTIVE'
  });

  closeSheet();
  render();
  toast('Akun demo disimpan.');
}

/* =====================================================
   ADD CATEGORY
===================================================== */
function openCategorySheet() {
  openSheet('Tambah Kategori', `
    <form id="categoryForm" class="form">
      <div class="form-group">
        <label>Nama Kategori</label>
        <input id="catName" placeholder="Makanan, Gaji, Transportasi" required />
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label>Jenis</label>
          <select id="catType">
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>

        <div class="form-group">
          <label>Icon Emoji</label>
          <input id="catIcon" placeholder="🍔" />
        </div>
      </div>

      <button class="btn primary full" type="submit">Simpan Kategori</button>
    </form>
  `);

  $('categoryForm').addEventListener('submit', submitCategory);
}

async function submitCategory(e) {
  e.preventDefault();

  const payload = {
    category_name: $('catName').value.trim(),
    transaction_type: $('catType').value,
    icon: $('catIcon').value.trim() || '🏷️'
  };

  if (!payload.category_name) return toast('Nama kategori wajib diisi.', true);

  const submitBtn = e.submitter;
  if (submitBtn) submitBtn.disabled = true;

  if (state.mode === 'supabase' && state.session) {
    const { error } = await supabase
      .from('categories')
      .insert(payload);

    if (error) {
      toast(error.message, true);
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    toast('Kategori disimpan.');
    closeSheet();
    await loadData();
    return;
  }

  state.data.categories.push({
    id: 'local_' + Date.now(),
    ...payload,
    status: 'ACTIVE'
  });

  closeSheet();
  render();
  toast('Kategori demo disimpan.');
}