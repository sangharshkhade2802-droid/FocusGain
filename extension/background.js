// FocusGain Extension - DeclarativeNetRequest Background Service Worker
// Manages dynamic declarativeNetRequest rules for strict Study Whitelist mode.

const RULE_ID_BLOCK_ALL = 1001;
const RULE_ID_ALLOW_BASE = 2000;

const DEFAULT_WHITELIST = [
  'docs.google.com',
  'drive.google.com',
  'github.com',
  'stackoverflow.com',
  'wikipedia.org',
  'gemini.google.com',
  'claude.ai',
  'notion.so',
  'supabase.com',
  'developer.mozilla.org',
  'arxiv.org',
  'localhost',
  '127.0.0.1'
];

// Initialize storage defaults on install
chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(['whitelist', 'studyModeActive', 'shieldEnabled']);
  if (!current.whitelist) {
    await chrome.storage.local.set({ whitelist: DEFAULT_WHITELIST });
  }
  if (current.studyModeActive === undefined) {
    await chrome.storage.local.set({ studyModeActive: false });
  }
  if (current.shieldEnabled === undefined) {
    await chrome.storage.local.set({ shieldEnabled: true });
  }
  await updateNetworkRules(current.studyModeActive || false, current.whitelist || DEFAULT_WHITELIST);
});

// Update DeclarativeNetRequest dynamic rules
async function updateNetworkRules(isStudyActive, whitelist) {
  try {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(r => r.id);

    if (!isStudyActive) {
      // Study mode inactive: clear all dynamic blocking rules
      if (existingRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: existingRuleIds,
          addRules: []
        });
      }
      return;
    }

    // Study mode ACTIVE: build whitelist rules
    // 1. Allow rule for each whitelisted domain with higher priority (2)
    // 2. Block/Redirect rule for everything else with lower priority (1)
    const newRules = [];

    // Allow rules
    whitelist.forEach((domain, idx) => {
      newRules.push({
        id: RULE_ID_ALLOW_BASE + idx,
        priority: 2,
        action: { type: 'allow' },
        condition: {
          urlFilter: `||${domain}`,
          resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'stylesheet', 'image']
        }
      });
    });

    // Catch-all redirect to blocked landing page
    newRules.push({
      id: RULE_ID_BLOCK_ALL,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { extensionPath: '/blocked.html' }
      },
      condition: {
        urlFilter: '|http',
        resourceTypes: ['main_frame']
      }
    });

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: newRules
    });

    console.log(`[FocusGain] Study Whitelist rules enforced. ${whitelist.length} domains allowed.`);
  } catch (err) {
    console.error('[FocusGain] Failed to update declarative rules:', err);
  }
}

// Listen to storage changes to sync rule sets
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'local') {
    if (changes.studyModeActive || changes.whitelist) {
      const data = await chrome.storage.local.get(['studyModeActive', 'whitelist']);
      await updateNetworkRules(data.studyModeActive, data.whitelist || DEFAULT_WHITELIST);
    }
  }
});

// Message listener for popup & web app communications
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    chrome.storage.local.get(['studyModeActive', 'whitelist', 'shieldEnabled'], (data) => {
      sendResponse(data);
    });
    return true;
  }

  if (message.type === 'TOGGLE_STUDY_MODE') {
    chrome.storage.local.get(['studyModeActive', 'whitelist'], async (data) => {
      const nextState = !data.studyModeActive;
      await chrome.storage.local.set({ studyModeActive: nextState });
      await updateNetworkRules(nextState, data.whitelist || DEFAULT_WHITELIST);
      sendResponse({ success: true, studyModeActive: nextState });
    });
    return true;
  }

  if (message.type === 'UPDATE_WHITELIST') {
    chrome.storage.local.set({ whitelist: message.whitelist }, async () => {
      const data = await chrome.storage.local.get(['studyModeActive']);
      await updateNetworkRules(data.studyModeActive, message.whitelist);
      sendResponse({ success: true });
    });
    return true;
  }
});
