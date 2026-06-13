import { translations, uiLang } from '../i18n/translations';

export function Header({ language, studentLanguage, onToggleLanguage, view, onNavigate, savedCount }) {
  const tr = translations[uiLang(language)];

  const showToggle = studentLanguage && studentLanguage !== 'English' && studentLanguage !== 'en';
  const inEnglish = language === 'English' || language === 'en';

  const navLink = (target, label) => {
    const active = view === target || (target === 'form' && view === 'results');
    return (
      <button
        onClick={() => onNavigate(target)}
        className={`font-headline-md text-body-lg font-bold transition-colors px-3 py-1 rounded-lg ${
          active
            ? 'text-primary border-b-2 border-primary'
            : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        {label}
        {target === 'saved' && savedCount > 0 && (
          <span className="ml-1.5 bg-secondary-container text-on-secondary-container text-label-caps font-bold px-1.5 py-0.5 rounded-full text-[10px]">
            {savedCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <header className="bg-surface shadow-sm fixed top-0 w-full z-50 h-16 flex justify-between items-center px-margin-mobile md:px-margin-desktop">
      <button
        onClick={() => onNavigate('form')}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <span
          className="material-symbols-outlined text-primary text-[28px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          lightbulb
        </span>
        <span className="font-headline-md text-headline-md font-bold text-primary">BuildIt</span>
      </button>

      <nav className="hidden md:flex gap-6 items-center">
        {navLink('form', tr.nav.discover)}
        {navLink('saved', tr.nav.myProjects)}
        {navLink('community', tr.nav.gallery)}
      </nav>

      {showToggle && (
        <div className="flex items-center bg-surface-container rounded-full p-1 gap-1 border border-outline-variant">
          <button
            onClick={() => !inEnglish && onToggleLanguage()}
            className={`font-label-caps text-label-caps px-sm py-xs rounded-full transition-all font-bold ${
              inEnglish
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => inEnglish && onToggleLanguage()}
            className={`font-label-caps text-label-caps px-sm py-xs rounded-full transition-all font-bold capitalize ${
              !inEnglish
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {studentLanguage.length > 6 ? studentLanguage.slice(0, 6) + '…' : studentLanguage}
          </button>
        </div>
      )}
    </header>
  );
}
