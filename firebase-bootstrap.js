(() => {
  'use strict';

  const VERSION = '1.0.0';
  const FIREBASE_VERSION = '12.3.0';
  const CONFIG = {
    apiKey: "AIzaSyBwR0RiIoTC-3vEc0t6Z45l8m4phzIJ5CY",
    authDomain: "hk-school-timetable.firebaseapp.com",
    projectId: "hk-school-timetable",
    storageBucket: "hk-school-timetable.firebasestorage.app",
    messagingSenderId: "515099084401",
    appId: "1:515099084401:web:58f7fce0499c79c03e7dd0"
  };

  window.__firebaseAuthResolved = false;
  window.__firebaseAuthUser = null;
  window.__firebaseBootstrapError = null;

  function loadScript(src, readyTest) {
    if (readyTest()) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const existing = [...document.scripts].find(s => s.src === src);

      if (existing) {
        const started = Date.now();
        const timer = setInterval(() => {
          if (readyTest()) {
            clearInterval(timer);
            resolve();
          } else if (Date.now() - started > 15000) {
            clearInterval(timer);
            reject(new Error(`Firebase SDK 載入逾時：${src}`));
          }
        }, 80);
        return;
      }

      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => readyTest()
        ? resolve()
        : reject(new Error(`Firebase SDK 未就緒：${src}`));
      s.onerror = () => reject(new Error(`無法載入 Firebase SDK：${src}`));
      document.head.appendChild(s);
    });
  }

  async function boot() {
    try {
      await loadScript(
        `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,
        () => !!window.firebase
      );
      await loadScript(
        `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth-compat.js`,
        () => !!window.firebase?.auth
      );
      await loadScript(
        `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore-compat.js`,
        () => !!window.firebase?.firestore
      );

      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(CONFIG);
      }

      const auth = window.firebase.auth();

      try {
        await auth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
      } catch (err) {
        console.warn('[firebase-bootstrap] persistence', err);
      }

      window.__firebaseReady = true;
      window.dispatchEvent(new CustomEvent('firebase-ready', {
        detail: { version: VERSION }
      }));

      auth.onAuthStateChanged(user => {
        window.__firebaseAuthResolved = true;
        window.__firebaseAuthUser = user || null;
        window.dispatchEvent(new CustomEvent('firebase-auth-state', {
          detail: { user: user || null }
        }));
      });

      console.info(`[firebase-bootstrap] v${VERSION} ready`);
      return window.firebase;
    } catch (err) {
      window.__firebaseBootstrapError = err;
      window.__firebaseReady = false;
      console.error('[firebase-bootstrap]', err);
      window.dispatchEvent(new CustomEvent('firebase-bootstrap-error', {
        detail: { message: err?.message || String(err) }
      }));
      throw err;
    }
  }

  window.__firebaseReadyPromise = boot();
  window.__firebaseReadyPromise.catch(() => {});
})();