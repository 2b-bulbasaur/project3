import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: any; 
  }
}

const GoogleTranslate = () => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const loadGoogleTranslate = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en' },
          'google_translate_element'
        );
      }
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onload = loadGoogleTranslate;
    document.body.appendChild(script);

    (window as any).googleTranslateElementInit = loadGoogleTranslate;

    initialized.current = true;

    return () => {
      const scriptTags = document.querySelectorAll('script[src="//translate.google.com/translate_a/element.js"]');
      scriptTags.forEach((scriptTag) => {
        if (scriptTag.parentNode) {
          scriptTag.parentNode.removeChild(scriptTag);
        }
      });
    };
  }, []); 

  const triggerTranslation = () => {
    if (window.google && window.google.translate) {
      window.google.translate.TranslateElement({
        pageLanguage: 'en', 
      }, 'google_translate_element');
    }
  };

  return (
    <div>
      <div id="google_translate_element"></div>
      <button onClick={triggerTranslation}>Force Translate</button>
    </div>
  );
};

export default GoogleTranslate;
