(() => {
  'use strict';

  const params = new URLSearchParams(location.search);
  const isSyncMode = params.get('automate') === 'sync';
  const isSilent = params.get('silent') === '1';
  const AUTO_SYNC_KEY = 'hk-school-automate-last-sync';
  const AUTO_SYNC_INTERVAL_MS = 10 * 60 * 1000; // avoid repeated hidden reloads

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function showStatus(message, kind = 'info') {
    if (isSilent) return;
    let box = document.getElementById('automate-sync-status');
    if (!box) {
      box = document.createElement('div');
      box.id = 'automate-sync-status';
      Object.assign(box.style, {
        position: 'fixed', inset: '12px 12px auto 12px', zIndex: '2147483647',
        padding: '12px 14px', borderRadius: '10px', fontFamily: 'system-ui, sans-serif',
        fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 20px rgba(0,0,0,.18)'
      });
      document.body.appendChild(box);
    }
    box.textContent = message;
    box.style.background = kind === 'error' ? '#fff1f0' : kind === 'ok' ? '#edf9f1' : '#eef6ff';
    box.style.color = kind === 'error' ? '#a5221b' : kind === 'ok' ? '#176b35' : '#174ea6';
  }

  async function waitFor(test, timeout = 20000, step = 200) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const value = test();
      if (value) return value;
      await sleep(step);
    }
    throw new Error('等候頁面資料逾時');
  }

  function findButtonByText(text) {
    return [...document.querySelectorAll('button')].find(btn => (btn.textContent || '').includes(text));
  }

  function hkDateString() {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const get = type => parts.find(p => p.type === type)?.value || '';
    return `${get('year')}-${get('month')}-${get('day')}`;
  }

  function scrapeTodayBoard() {
    const board = document.querySelector('.today-board');
    if (!board) throw new Error('找不到「當日課表」資料');

    const dateInput = document.querySelector('.today-date-nav input[type="date"]');
    const title = board.querySelector('.today-board-head h2')?.textContent?.trim() || '今日課表';
    const badgeText = [...board.querySelectorAll('.today-badges strong, .today-badges span')]
      .map(el => el.textContent.trim()).filter(Boolean);

    const items = [...board.querySelectorAll('.today-item')].map(item => ({
      label: item.querySelector('.today-item-time b')?.textContent?.trim() || '',
      time: item.querySelector('.today-item-time small')?.textContent?.trim() || '',
      value: item.querySelector(':scope > strong')?.textContent?.trim() || '',
      active: item.classList.contains('active-now'),
      kind: ['duty','break','lunch','dismissal'].find(k => item.classList.contains(k)) || 'lesson'
    })).filter(x => x.label || x.value);

    return {
      version: 2,
      source: 'HK School Timetable v84 Automate-ready',
      date: dateInput?.value || hkDateString(),
      title,
      badges: badgeText,
      items,
      updatedAt: new Date().toISOString()
    };
  }

  async function ensureTodayPage() {
    if (document.querySelector('.today-board')) return;
    const btn = await waitFor(() => findButtonByText('當日課表'));
    btn.click();
    await waitFor(() => document.querySelector('.today-board'));
  }

  async function ensureFirebaseUser(timeout = 15000) {
    await waitFor(() => window.firebase && window.firebase.auth && window.firebase.firestore, 25000);
    const auth = window.firebase.auth();
    if (auth.currentUser) return auth.currentUser;
    return await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { try { unsub(); } catch {} reject(new Error('未登入 Firebase')); }, timeout);
      const unsub = auth.onAuthStateChanged(user => {
        if (user) { clearTimeout(timer); unsub(); resolve(user); }
      });
    });
  }

  async function syncSummary() {
    try {
      showStatus('正在準備 Automate 今日摘要…');
      await ensureTodayPage();
      await sleep(500);
      const summary = scrapeTodayBoard();
      const user = await ensureFirebaseUser();
      const db = window.firebase.firestore();
      await db.doc(`users/${user.uid}/automate/current`).set({
        payload: JSON.stringify(summary),
        date: summary.date,
        updatedAt: summary.updatedAt,
        source: summary.source,
        version: summary.version
      }, { merge: true });
      try { localStorage.setItem(AUTO_SYNC_KEY, String(Date.now())); } catch {}
      showStatus(`Automate 今日摘要已更新：${summary.date}`, 'ok');
      console.info('[Automate bridge] synced', summary);
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'hk-school-automate-sync', ok: true, date: summary.date }, location.origin);
        }
      } catch {}
    } catch (err) {
      console.error('[Automate bridge]', err);
      showStatus(`Automate 同步失敗：${err?.message || err}`, 'error');
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'hk-school-automate-sync', ok: false }, location.origin);
        }
      } catch {}
    }
  }

  function shouldAutoSync() {
    try {
      const last = Number(localStorage.getItem(AUTO_SYNC_KEY) || 0);
      return !last || (Date.now() - last) > AUTO_SYNC_INTERVAL_MS;
    } catch {
      return true;
    }
  }

  async function launchHiddenSync() {
    // Wait briefly for Firebase. If user is not signed in, do nothing; normal Web App remains unchanged.
    try {
      const user = await ensureFirebaseUser(6000);
      if (!user || !shouldAutoSync()) return;
    } catch {
      return;
    }

    const frame = document.createElement('iframe');
    const url = new URL(location.href);
    url.searchParams.set('automate', 'sync');
    url.searchParams.set('silent', '1');
    // prevent carrying unrelated hash state into the hidden worker
    url.hash = '';
    frame.src = url.toString();
    frame.title = 'Automate background sync';
    frame.setAttribute('aria-hidden', 'true');
    Object.assign(frame.style, {
      position: 'fixed', width: '1px', height: '1px', right: '-10px', bottom: '-10px',
      opacity: '0', pointerEvents: 'none', border: '0'
    });

    const cleanup = () => { try { frame.remove(); } catch {} };
    const timer = setTimeout(cleanup, 30000);
    const onMessage = (event) => {
      if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
      if (event.data?.type === 'hk-school-automate-sync') {
        clearTimeout(timer);
        window.removeEventListener('message', onMessage);
        cleanup();
      }
    };
    window.addEventListener('message', onMessage);
    document.body.appendChild(frame);
  }

  function start() {
    if (isSyncMode) {
      syncSummary();
    } else {
      // Normal Web App usage: silently refresh the Automate summary in the background.
      // This does not navigate the visible app and does not affect users who are not signed in.
      setTimeout(launchHiddenSync, 1200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
