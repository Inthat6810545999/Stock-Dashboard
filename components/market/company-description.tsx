'use client';

import {useEffect, useState} from 'react';

const cache = new Map<string, string>();

export function CompanyDescription({description}: {description: string}) {
  const [language, setLanguage] = useState<'en' | 'th'>('en');
  const [translation, setTranslation] = useState<{description: string; value: string} | null>(null);
  const [failedDescription, setFailedDescription] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setLanguage(localStorage.getItem('moonstar-language') === 'th' ? 'th' : 'en');
    update();
    window.addEventListener('moonstar-language-change', update);
    return () => window.removeEventListener('moonstar-language-change', update);
  }, []);

  useEffect(() => {
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
        if (!controller.signal.aborted) setTranslation({description, value: result.translation});
      } else if (!controller.signal.aborted) setFailedDescription(description);
    }).catch(() => { if (!controller.signal.aborted) setFailedDescription(description); });
    return () => controller.abort();
  }, [description, language]);

  const currentTranslation = cache.get(description) ?? (translation?.description === description ? translation.value : '');
  return <p className="company-description" translate="no">{language === 'th' ? currentTranslation || (failedDescription === description ? description : 'กำลังแปลข้อมูลบริษัท…') : description}</p>;
}
