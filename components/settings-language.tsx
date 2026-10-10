'use client';

import {useEffect, useState} from 'react';

export function SettingsLanguage() {
  const [language, setLanguage] = useState<'en' | 'th'>('en');

  useEffect(() => {
    const sync = () => {
      try { setLanguage(localStorage.getItem('moonstar-language') === 'th' ? 'th' : 'en'); }
      catch { setLanguage('en'); }
    };
    sync();
    window.addEventListener('moonstar-language-change', sync);
    return () => window.removeEventListener('moonstar-language-change', sync);
  }, []);

  function choose(next: 'en' | 'th') {
    setLanguage(next);
    try { localStorage.setItem('moonstar-language', next); } catch {}
    window.dispatchEvent(new CustomEvent('moonstar-language-change', {detail: next}));
  }

  return <div className="settings-language-control" role="group" aria-label="Choose language">
    <button type="button" aria-pressed={language === 'en'} onClick={() => choose('en')}>ENG</button>
    <button type="button" aria-pressed={language === 'th'} onClick={() => choose('th')}>TH</button>
  </div>;
}
