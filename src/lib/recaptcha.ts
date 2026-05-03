const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

let scriptLoaded = false;

function loadScript(): Promise<void> {
  if (scriptLoaded || !SITE_KEY) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.onload = () => { scriptLoaded = true; resolve(); };
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    document.head.appendChild(script);
  });
}

export async function executeRecaptcha(action: string): Promise<string> {
  if (!SITE_KEY) return '';
  await loadScript();
  return new Promise((resolve, reject) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(SITE_KEY, { action })
        .then(resolve)
        .catch(reject);
    });
  });
}

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}
