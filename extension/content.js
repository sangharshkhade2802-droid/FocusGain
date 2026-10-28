// FocusGain Extension - Targeted Feed Filter Content Script
// Selectively strips algorithmic doomscrolling (Shorts, Reels, Stories, Explore)
// while keeping core utility (Search, Messages, Direct links, Main feeds) accessible.

(function () {
  'use strict';

  let isEnabled = true;
  let blockedCount = 0;

  // Platform-specific CSS rules to instantly suppress elements before render
  const STYLES_MAP = {
    'youtube.com': `
      ytd-reel-shelf-renderer,
      ytd-rich-shelf-renderer[is-shorts],
      #shorts-container,
      ytd-browse[page-subtype="shorts"],
      ytd-guide-entry-renderer:has(a[href^="/shorts"]),
      ytd-mini-guide-entry-renderer:has(a[href^="/shorts"]),
      ytd-rich-item-renderer:has(a[href^="/shorts"]),
      ytd-video-renderer:has(a[href^="/shorts"]),
      a[title="Shorts"],
      a[href^="/shorts"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `,
    'instagram.com': `
      a[href*="/reels/"],
      a[href*="/explore/"],
      div[role="dialog"]:has(video),
      div:has(> a[href*="/reels/"]),
      svg[aria-label="Reels"],
      svg[aria-label="Explore"] {
        display: none !important;
        visibility: hidden !important;
      }
    `,
    'facebook.com': `
      div[aria-label="Reels"],
      div[aria-label="Stories"],
      div[data-pagelet="Stories"],
      div[data-pagelet="Reels"],
      a[href*="/reel/"] {
        display: none !important;
        visibility: hidden !important;
      }
    `,
    'snapchat.com': `
      a[href*="/spotlight"],
      div[data-testid="spotlight-tab"],
      div[aria-label*="Spotlight"],
      div:has(> a[href*="/spotlight"]) {
        display: none !important;
        visibility: hidden !important;
      }
    `
  };

  const hostname = window.location.hostname;
  let activePlatform = null;

  if (hostname.includes('youtube.com')) activePlatform = 'youtube.com';
  else if (hostname.includes('instagram.com')) activePlatform = 'instagram.com';
  else if (hostname.includes('facebook.com')) activePlatform = 'facebook.com';
  else if (hostname.includes('snapchat.com')) activePlatform = 'snapchat.com';

  if (!activePlatform) return;

  // Inject suppression stylesheet immediately
  const styleEl = document.createElement('style');
  styleEl.id = 'focusgain-feed-shield-styles';
  styleEl.textContent = STYLES_MAP[activePlatform];
  (document.head || document.documentElement).appendChild(styleEl);

  // Load user settings
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['shieldEnabled', 'totalBlocks'], (res) => {
      if (res.shieldEnabled === false) {
        disableShield();
      } else {
        enableShield();
      }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.shieldEnabled) {
        if (changes.shieldEnabled.newValue === false) {
          disableShield();
        } else {
          enableShield();
        }
      }
    });
  }

  function disableShield() {
    isEnabled = false;
    styleEl.disabled = true;
    updateBadge(false);
  }

  function enableShield() {
    isEnabled = true;
    styleEl.disabled = false;
    updateBadge(true);
    runDOMCleanse();
  }

  // Active DOM Cleanse & Redirection Engine
  function runDOMCleanse() {
    if (!isEnabled) return;

    if (activePlatform === 'youtube.com') {
      // If user landed directly on /shorts/xyz, redirect to standard watch URL
      if (window.location.pathname.startsWith('/shorts/')) {
        const videoId = window.location.pathname.split('/shorts/')[1]?.split('?')[0];
        if (videoId) {
          window.location.replace(`https://www.youtube.com/watch?v=${videoId}`);
          return;
        }
      }

      const elements = document.querySelectorAll(
        'ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts], #shorts-container, ytd-browse[page-subtype="shorts"]'
      );
      elements.forEach(el => {
        if (el.style.display !== 'none') {
          el.style.display = 'none';
          blockedCount++;
        }
      });
    }

    if (activePlatform === 'instagram.com') {
      // Prevent exploration vortex if user navigates to /reels/
      if (window.location.pathname.startsWith('/reels/')) {
        window.location.replace('https://www.instagram.com/direct/inbox/');
        return;
      }
      const reelsLinks = document.querySelectorAll('a[href*="/reels/"], a[href*="/explore/"]');
      reelsLinks.forEach(el => {
        const container = el.closest('li') || el.closest('div[role="listitem"]') || el;
        if (container.style.display !== 'none') {
          container.style.display = 'none';
          blockedCount++;
        }
      });
    }

    if (activePlatform === 'facebook.com') {
      const fbReels = document.querySelectorAll('div[aria-label="Reels"], a[href*="/reel/"]');
      fbReels.forEach(el => {
        const wrapper = el.closest('div[role="feed"] > div') || el;
        if (wrapper.style.display !== 'none') {
          wrapper.style.display = 'none';
          blockedCount++;
        }
      });
    }

    if (activePlatform === 'snapchat.com') {
      if (window.location.pathname.includes('/spotlight')) {
        window.location.replace('https://web.snapchat.com/');
        return;
      }
    }
  }

  // Set up robust MutationObserver for dynamic SPAs
  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    if (!isEnabled) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      runDOMCleanse();
    }, 150);
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
    runDOMCleanse();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
      runDOMCleanse();
      injectBadge();
    });
  }

  // Minimalist Focus Shield status badge in page corner
  let badgeEl = null;
  function injectBadge() {
    if (document.getElementById('focusgain-badge-root')) return;
    badgeEl = document.createElement('div');
    badgeEl.id = 'focusgain-badge-root';
    badgeEl.style.cssText = `
      position: fixed;
      bottom: 16px;
      right: 16px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      padding: 6px 12px;
      border-radius: 9999px;
      background: rgba(15, 23, 42, 0.9);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      gap: 6px;
      backdrop-filter: blur(8px);
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
    `;
    updateBadge(isEnabled);
    badgeEl.addEventListener('click', () => {
      const nextState = !isEnabled;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ shieldEnabled: nextState });
      } else {
        if (nextState) enableShield(); else disableShield();
      }
    });
    document.body.appendChild(badgeEl);
  }

  function updateBadge(active) {
    if (!badgeEl) return;
    if (active) {
      badgeEl.style.borderColor = 'rgba(56, 189, 248, 0.4)';
      badgeEl.style.color = '#38bdf8';
      badgeEl.innerHTML = `
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 6px #22c55e;"></span>
        <span>FocusGain: Feed Shield Active</span>
      `;
    } else {
      badgeEl.style.borderColor = 'rgba(239, 68, 68, 0.4)';
      badgeEl.style.color = '#f87171';
      badgeEl.innerHTML = `
        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#ef4444;"></span>
        <span>FocusGain: Feed Shield Paused</span>
      `;
    }
  }

  window.addEventListener('load', injectBadge);
})();
