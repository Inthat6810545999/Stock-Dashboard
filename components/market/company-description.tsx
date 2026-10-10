'use client';

import {useEffect, useState} from 'react';

const cache = new Map<string, string>();

export function CompanyDescription({description}: {description: string}) {
  const [language, setLanguage] = useState<'en' | 'th'>('en');
  const [translation, setTranslation] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const update = () => setLanguage(localStorage.getItem('moonstar-language') === 'th' ? 'th' : 'en');
    update();
    window.addEventListener('moonstar-language-change', update);
    return () => window.removeEventListener('moonstar-language-change', update);
  }, []);

  useEffect(() => {
    setTranslation(cache.get(description) ?? '');
    setFailed(false);
    if (language !== 'th' || !description || cache.has(description)) return;
    const controller = new AbortController();
    fetch('/api/translate-description', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({description}),
      signal: controller.signal,
    }).then(response => response.ok ? response.json() as Promise<{translation?: string}> : null).then(result => {
      if (typeof result?.translation === 'string') {
        cache.set(description, result.translation);
        setTranslation(result.translation);
      } else if (!controller.signal.aborted) setFailed(true);
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [description, language]);

  return <p className="company-description" translate="no">{language === 'th' ? translation || (failed ? description : 'กำลังแปลข้อมูลบริษัท…') : description}</p>;
}
