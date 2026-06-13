import { useState } from 'react';
import { translations, uiLang } from '../i18n/translations';

export function ProjectDetailsSheet({ title, projectData, language = 'en', onClose }) {
  const tr = translations[uiLang(language)];
  const c = tr.community;
  const [section, setSection] = useState('materials');

  const parseStep = (step) => {
    // Steps are formatted "Step N – Title: body text"
    const dashIdx = step.indexOf('–');
    const colonIdx = step.indexOf(':');
    if (colonIdx > -1 && colonIdx > dashIdx) {
      const rawTitle = step.slice(dashIdx > -1 ? dashIdx + 1 : 0, colonIdx).trim();
      const body = step.slice(colonIdx + 1).trim();
      return { title: rawTitle || `Step`, body };
    }
    return { title: '', body: step };
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 flex items-end md:items-center justify-center">
      <div className="bg-surface-container-lowest w-full md:max-w-2xl rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-primary px-md py-sm flex items-start justify-between flex-shrink-0">
          <div className="flex-1 pr-sm">
            <p className="font-label-caps text-label-caps text-on-primary/60 uppercase tracking-widest mb-xs">
              {c.projectDetailsLabel || 'Project Details'}
            </p>
            <p className="font-headline-md text-headline-md text-on-primary font-bold leading-snug">{title}</p>
          </div>
          <button onClick={onClose} className="text-on-primary/70 hover:text-on-primary transition-colors mt-0.5 flex-shrink-0">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Hook */}
        {projectData.hook && (
          <div className="px-md py-sm bg-primary-container/30 border-b border-outline-variant flex-shrink-0">
            <p className="font-body-md text-body-md text-on-surface italic leading-relaxed">{projectData.hook}</p>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex items-center gap-sm px-md pt-md pb-sm flex-shrink-0">
          <button
            onClick={() => setSection('materials')}
            className={`flex items-center gap-xs px-sm py-xs rounded-full font-label-caps text-label-caps border-2 transition-all ${
              section === 'materials'
                ? 'bg-primary-container text-on-primary-container border-primary/20'
                : 'border-outline-variant text-on-surface-variant hover:border-primary/40'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: section === 'materials' ? "'FILL' 1" : "'FILL' 0" }}>
              shopping_cart
            </span>
            {c.materialsLabel || 'Materials'}
          </button>
          <button
            onClick={() => setSection('steps')}
            className={`flex items-center gap-xs px-sm py-xs rounded-full font-label-caps text-label-caps border-2 transition-all ${
              section === 'steps'
                ? 'bg-primary-container text-on-primary-container border-primary/20'
                : 'border-outline-variant text-on-surface-variant hover:border-primary/40'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: section === 'steps' ? "'FILL' 1" : "'FILL' 0" }}>
              checklist
            </span>
            {c.stepsLabel || 'Steps'}
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-md pb-xl">
          {section === 'materials' && (
            <ul className="space-y-xs">
              {(projectData.materials || []).map((m, i) => (
                <li key={i} className="flex gap-sm items-start bg-surface-container rounded-xl px-sm py-sm">
                  <span
                    className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span className="font-body-md text-body-md text-on-surface">{m}</span>
                </li>
              ))}
            </ul>
          )}

          {section === 'steps' && (
            <ol className="space-y-md">
              {(projectData.steps || []).map((step, i) => {
                const { title: stepTitle, body } = parseStep(step);
                return (
                  <li key={i} className="flex gap-sm">
                    <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 font-bold text-[13px] mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      {stepTitle && (
                        <p className="font-headline-md text-[14px] text-on-surface font-bold mb-xs">{stepTitle}</p>
                      )}
                      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
