
const API_BASE_URL = window.__ENV__?.API_URL || 'http://localhost:3003/api';

const AppState = {
  users: [],
  isEditing: false,
  currentTheme: localStorage.getItem('theme') || 'dark',
  pagination: { current: 1, pages: 1, total: 0, limit: 9 },
  filters: { search: '', department: '' },
};

const El = {
  userForm:        document.getElementById('userForm'),
  userId:          document.getElementById('userId'),
  name:            document.getElementById('name'),
  email:           document.getElementById('email'),
  age:             document.getElementById('age'),
  department:      document.getElementById('department'),
  submitBtn:       document.getElementById('submitBtn'),
  cancelBtn:       document.getElementById('cancelBtn'),
  resetBtn:        document.getElementById('resetBtn'),
  themeToggle:     document.getElementById('themeToggle'),
  exportBtn:       document.getElementById('exportBtn'),
  statsBtn:        document.getElementById('statsBtn'),
  searchInput:     document.getElementById('searchInput'),
  departmentFilter:document.getElementById('departmentFilter'),
  refreshBtn:      document.getElementById('refreshBtn'),
  usersContainer:  document.getElementById('usersContainer'),
  loadingOverlay:  document.getElementById('loadingOverlay'),
  emptyState:      document.getElementById('emptyState'),
  toastContainer:  document.getElementById('toastContainer'),
  totalUsers:      document.getElementById('totalUsers'),
  recentUsers:     document.getElementById('recentUsers'),
  avgAge:          document.getElementById('avgAge'),
  lastUpdate:      document.getElementById('lastUpdate'),
  userCount:       document.getElementById('userCount'),
  statsDashboard:  document.getElementById('statsDashboard'),
  paginationContainer: document.getElementById('paginationContainer'),
  resultsCount:    document.getElementById('resultsCount'),
  dropZone:        document.getElementById('dropZone'),
  fileInput:       document.getElementById('fileInput'),
};

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  setupEventListeners();
  await Promise.all([loadUsers(), loadStats()]);
  showToast('Welcome to Codveda User Management', 'info', 'System Ready');
});

function initTheme() {
  document.documentElement.setAttribute('data-theme', AppState.currentTheme);
  El.themeToggle.querySelector('i').className =
    AppState.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function toggleTheme() {
  AppState.currentTheme = AppState.currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', AppState.currentTheme);
  initTheme();
  showToast(`Switched to ${AppState.currentTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
}

function setupEventListeners() {
  El.userForm.addEventListener('submit', handleFormSubmit);
  El.cancelBtn.addEventListener('click', resetForm);
  El.resetBtn.addEventListener('click', resetForm);
  El.themeToggle.addEventListener('click', toggleTheme);
  El.exportBtn.addEventListener('click', exportData);
  El.statsBtn.addEventListener('click', () => toggleStatsDashboard());
  El.refreshBtn.addEventListener('click', handleRefresh);
  El.searchInput.addEventListener('input', debounce(handleSearch, 400));
  El.departmentFilter.addEventListener('change', handleDeptFilter);

  document.querySelectorAll('.mode-btn').forEach(btn =>
    btn.addEventListener('click', handleModeToggle)
  );

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); El.searchInput.focus(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); El.name.focus(); }
    if (e.key === 'Escape' && AppState.isEditing) resetForm();
  });

  if (El.dropZone) {
    El.dropZone.addEventListener('dragover', e => { e.preventDefault(); El.dropZone.classList.add('dragover'); });
    El.dropZone.addEventListener('dragleave', () => El.dropZone.classList.remove('dragover'));
    El.dropZone.addEventListener('drop', handleFileDrop);
    El.dropZone.addEventListener('click', () => El.fileInput && El.fileInput.click());
  }
  if (El.fileInput) {
    El.fileInput.addEventListener('change', e => {
      if (e.target.files[0]) handleFileImport(e.target.files[0]);
    });
  }
}

function handleModeToggle(e) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  const mode = e.target.dataset.mode;
  const formContainer = document.getElementById('createFormContainer');
  if (mode === 'bulk') {
    formContainer && (formContainer.style.display = 'none');
    El.dropZone && El.dropZone.classList.add('visible');
  } else {
    formContainer && (formContainer.style.display = '');
    El.dropZone && El.dropZone.classList.remove('visible');
  }
}

async function loadUsers(page = AppState.pagination.current) {
  showLoading(true);
  try {
    const { search, department } = AppState.filters;
    let url = `${API_BASE_URL}/users?page=${page}&limit=${AppState.pagination.limit}`;
    if (search)     url += `&search=${encodeURIComponent(search)}`;
    if (department) url += `&department=${encodeURIComponent(department)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    AppState.users = data.users || [];
    AppState.pagination = { ...AppState.pagination, ...data.pagination };
    renderUsers();
    renderPagination();
    updateResultsCount();
  } catch (err) {
    showToast('Failed to load users: ' + err.message, 'error', 'Load Error');
    AppState.users = [];
    renderUsers();
  } finally {
    showLoading(false);
  }
}

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/users/stats`);
    if (!res.ok) return;
    const data = await res.json();
    animateNumber(El.totalUsers, data.total || 0);
    animateNumber(El.recentUsers, data.addedToday || 0);
    animateNumber(El.avgAge, data.averageAge || 0);
    if (El.userCount) El.userCount.textContent = data.total || 0;
    if (El.lastUpdate) El.lastUpdate.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    console.warn('Stats unavailable:', err.message);
  }
}

function renderUsers() {
  if (!AppState.users.length) {
    El.usersContainer.innerHTML = '';
    El.emptyState.style.display = 'flex';
    return;
  }
  El.emptyState.style.display = 'none';
  El.usersContainer.innerHTML = AppState.users.map(createUserCard).join('');

  El.usersContainer.querySelectorAll('.user-card-modern').forEach((card, i) => {
    card.style.animation = `fadeInUp 0.35s ease ${i * 0.06}s both`;
  });
}

function createUserCard(user) {
  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const dept = user.department || '';
  const deptBadge = dept
    ? `<span class="dept-badge dept-${dept}">${dept.charAt(0).toUpperCase() + dept.slice(1)}</span>`
    : '';
  const ageBadge = user.age
    ? `<div class="meta-item"><i class="fas fa-calendar"></i><span>${user.age} yrs</span></div>`
    : '';

  return `
    <div class="user-card-modern" data-id="${user.id || user._id}">
      <div class="user-header">
        <div class="user-avatar">${initials}</div>
        <div class="user-details">
          <h3 title="${escHtml(user.name)}">${escHtml(user.name)}</h3>
          <p title="${escHtml(user.email)}">${escHtml(user.email)}</p>
        </div>
      </div>
      <div class="user-meta">
        ${ageBadge}
        ${deptBadge}
      </div>
      <div class="user-actions-modern">
        <button class="btn-edit-modern" onclick="editUser('${user.id || user._id}')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn-delete-modern" onclick="deleteUser('${user.id || user._id}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>`;
}

function renderPagination() {
  if (!El.paginationContainer) return;
  const { current, pages } = AppState.pagination;
  if (pages <= 1) { El.paginationContainer.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="goToPage(${current - 1})" ${current === 1 ? 'disabled' : ''}>
    <i class="fas fa-chevron-left"></i></button>`;

  for (let p = 1; p <= pages; p++) {
    if (pages > 7 && Math.abs(p - current) > 2 && p !== 1 && p !== pages) {
      if (p === 2 || p === pages - 1) html += `<span class="page-info">…</span>`;
      continue;
    }
    html += `<button class="page-btn ${p === current ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>`;
  }

  html += `<button class="page-btn" onclick="goToPage(${current + 1})" ${current === pages ? 'disabled' : ''}>
    <i class="fas fa-chevron-right"></i></button>`;

  El.paginationContainer.innerHTML = html;
}

function goToPage(p) {
  const { pages } = AppState.pagination;
  if (p < 1 || p > pages) return;
  AppState.pagination.current = p;
  loadUsers(p);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateResultsCount() {
  if (!El.resultsCount) return;
  const { total, current, limit, pages } = AppState.pagination;
  const from = Math.min((current - 1) * limit + 1, total);
  const to   = Math.min(current * limit, total);
  El.resultsCount.textContent = total
    ? `Showing ${from}–${to} of ${total} users`
    : 'No users found';
}

function handleSearch(e) {
  AppState.filters.search = e.target.value.trim();
  AppState.pagination.current = 1;
  loadUsers(1);
}

function handleDeptFilter(e) {
  AppState.filters.department = e.target.value;
  AppState.pagination.current = 1;
  loadUsers(1);
}

async function handleRefresh() {
  El.refreshBtn.querySelector('i').style.animation = 'spin 0.8s linear infinite';
  await Promise.all([loadUsers(1), loadStats()]);
  El.refreshBtn.querySelector('i').style.animation = '';
  showToast('Data refreshed!', 'success');
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const data = {
    name:       El.name.value.trim(),
    email:      El.email.value.trim(),
    age:        El.age.value ? parseInt(El.age.value) : null,
    department: El.department.value || null,
  };
  if (!data.name || !data.email) {
    showToast('Name and email are required', 'error', 'Validation Error');
    return;
  }

  El.submitBtn.disabled = true;
  try {
    if (AppState.isEditing) {
      await apiFetch(`/users/${El.userId.value}`, 'PUT', data);
      showToast('User updated!', 'success', 'Updated');
    } else {
      await apiFetch('/users', 'POST', data);
      showToast('User created!', 'success', 'Created');
    }
    resetForm();
    await Promise.all([loadUsers(1), loadStats()]);
  } catch (err) {
    showToast(err.message, 'error', 'Error');
  } finally {
    El.submitBtn.disabled = false;
  }
}

function editUser(id) {
  const user = AppState.users.find(u => (u.id || u._id) === id);
  if (!user) return;
  AppState.isEditing = true;
  El.userId.value     = user.id || user._id;
  El.name.value       = user.name;
  El.email.value      = user.email;
  El.age.value        = user.age || '';
  El.department.value = user.department || '';
  El.submitBtn.innerHTML  = '<i class="fas fa-save"></i> Update User';
  El.cancelBtn.style.display = 'inline-flex';
  El.userForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  El.name.focus();
}

async function deleteUser(id) {
  const confirmed = await showConfirmDialog('Delete User', 'Are you sure you want to delete this user? This action cannot be undone.');
  if (!confirmed) return;
  try {
    await apiFetch(`/users/${id}`, 'DELETE');
    showToast('User deleted!', 'success', 'Deleted');
    const willBeEmpty = AppState.users.length === 1 && AppState.pagination.current > 1;
    await Promise.all([loadUsers(willBeEmpty ? AppState.pagination.current - 1 : AppState.pagination.current), loadStats()]);
  } catch (err) {
    showToast(err.message, 'error', 'Delete Error');
  }
}

function resetForm() {
  AppState.isEditing = false;
  El.userForm.reset();
  El.userId.value = '';
  El.submitBtn.innerHTML     = '<i class="fas fa-plus"></i> Add User';
  El.cancelBtn.style.display = 'none';
}

function handleFileDrop(e) {
  e.preventDefault();
  El.dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFileImport(file);
}

async function handleFileImport(file) {
  if (!file.name.endsWith('.json')) {
    showToast('Only JSON files are supported for bulk import', 'warning', 'Wrong File Type');
    return;
  }
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const users = Array.isArray(parsed) ? parsed : parsed.users || [];
    if (!users.length) { showToast('No users found in file', 'warning'); return; }

    showToast(`Importing ${users.length} users…`, 'info', 'Bulk Import');
    const res = await apiFetch('/users/bulk', 'POST', { users });
    showToast(`✅ Created: ${res.created}  |  ⏭ Skipped: ${res.skipped}`, 'success', 'Import Complete');
    await Promise.all([loadUsers(1), loadStats()]);
  } catch (err) {
    showToast('Failed to parse file: ' + err.message, 'error', 'Import Error');
  }
}

function exportData() {
  const json = JSON.stringify(AppState.users, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: `codveda-users-${new Date().toISOString().split('T')[0]}.json`,
  });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Current page exported!', 'success', 'Export');
}

function toggleStatsDashboard() {
  const vis = El.statsDashboard.style.display !== 'none';
  El.statsDashboard.style.display = vis ? 'none' : 'grid';
  if (!vis) { loadStats(); El.statsDashboard.scrollIntoView({ behavior: 'smooth' }); }
}

async function apiFetch(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API_BASE_URL + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function showLoading(show) {
  El.loadingOverlay.style.display = show ? 'flex' : 'none';
}

function debounce(fn, wait) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

function escHtml(str = '') {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c])
  );
}

const activeAnimations = new Map();
function animateNumber(el, target) {
  if (!el) return;
  if (activeAnimations.has(el)) clearInterval(activeAnimations.get(el));
  const start = parseInt(el.textContent) || 0;
  if (start === target) return;
  let step = 0, steps = 30;
  const inc = (target - start) / steps;
  const t = setInterval(() => {
    step++;
    if (step >= steps) { el.textContent = target; clearInterval(t); activeAnimations.delete(el); }
    else el.textContent = Math.round(start + inc * step);
  }, 600 / steps);
  activeAnimations.set(el, t);
}

function showToast(message, type = 'info', title = '') {
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></div>
    <div class="toast-content">
      ${title ? `<div class="toast-title">${escHtml(title)}</div>` : ''}
      <div class="toast-message">${escHtml(message)}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
  El.toastContainer.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'slideOut 0.3s ease'; setTimeout(() => toast.remove(), 300); }, 5000);
}

function showConfirmDialog(title, message) {
  return new Promise(resolve => {
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = `
      <div class="confirm-backdrop">
        <div class="confirm-dialog">
          <div class="confirm-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="confirm-header"><h3>${escHtml(title)}</h3></div>
          <div class="confirm-body"><p>${escHtml(message)}</p></div>
          <div class="confirm-footer">
            <button class="btn-cancel" id="_cfCancel">Cancel</button>
            <button class="btn-delete-confirm" id="_cfConfirm"><i class="fas fa-trash"></i> Delete</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#_cfCancel').onclick  = () => { modal.remove(); resolve(false); };
    modal.querySelector('#_cfConfirm').onclick = () => { modal.remove(); resolve(true); };
    modal.querySelector('.confirm-backdrop').onclick = e => { if (e.target === e.currentTarget) { modal.remove(); resolve(false); } };
  });
}

window.editUser   = editUser;
window.deleteUser = deleteUser;
window.goToPage   = goToPage;
