// FocusGain Extension Popup Controller

document.addEventListener('DOMContentLoaded', async () => {
  const studyToggle = document.getElementById('study-toggle');
  const shieldToggle = document.getElementById('shield-toggle');
  const statusPill = document.getElementById('status-pill');
  const statusText = document.getElementById('status-text');
  const domainInput = document.getElementById('domain-input');
  const addBtn = document.getElementById('add-btn');
  const addCurrentTabBtn = document.getElementById('add-current-tab');
  const domainList = document.getElementById('domain-list');
  const whitelistCount = document.getElementById('whitelist-count');
  const launchTimerBtn = document.getElementById('launch-timer');

  // Load initial state
  const data = await chrome.storage.local.get(['studyModeActive', 'shieldEnabled', 'whitelist']);
  const whitelist = data.whitelist || [];

  studyToggle.checked = !!data.studyModeActive;
  shieldToggle.checked = data.shieldEnabled !== false;
  updateStatusPill(studyToggle.checked);
  renderWhitelist(whitelist);

  // Toggle study mode
  studyToggle.addEventListener('change', async () => {
    const active = studyToggle.checked;
    await chrome.storage.local.set({ studyModeActive: active });
    updateStatusPill(active);
  });

  // Toggle feed shield
  shieldToggle.addEventListener('change', async () => {
    const active = shieldToggle.checked;
    await chrome.storage.local.set({ shieldEnabled: active });
  });

  // Add domain
  addBtn.addEventListener('click', () => {
    const val = domainInput.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (val) {
      addDomainToWhitelist(val);
      domainInput.value = '';
    }
  });

  domainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addBtn.click();
    }
  });

  // Add current tab
  addCurrentTabBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        try {
          const url = new URL(tabs[0].url);
          if (url.hostname) {
            addDomainToWhitelist(url.hostname);
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  });

  // Launch web timer
  launchTimerBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });

  function updateStatusPill(active) {
    if (active) {
      statusPill.className = 'status-pill active';
      statusText.textContent = 'Enforcing Strict Whitelist';
    } else {
      statusPill.className = 'status-pill inactive';
      statusText.textContent = 'Standard Mode (Shield Standby)';
    }
  }

  async function addDomainToWhitelist(domain) {
    const res = await chrome.storage.local.get(['whitelist']);
    const list = res.whitelist || [];
    if (!list.includes(domain)) {
      list.push(domain);
      await chrome.storage.local.set({ whitelist: list });
      renderWhitelist(list);
    }
  }

  async function removeDomain(domain) {
    const res = await chrome.storage.local.get(['whitelist']);
    let list = res.whitelist || [];
    list = list.filter(d => d !== domain);
    await chrome.storage.local.set({ whitelist: list });
    renderWhitelist(list);
  }

  function renderWhitelist(list) {
    whitelistCount.textContent = list.length;
    domainList.innerHTML = '';
    list.forEach(domain => {
      const li = document.createElement('li');
      li.className = 'domain-item';
      li.innerHTML = `
        <span>${escapeHtml(domain)}</span>
        <button class="remove-btn" title="Remove">✕</button>
      `;
      li.querySelector('.remove-btn').addEventListener('click', () => {
        removeDomain(domain);
      });
      domainList.appendChild(li);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
