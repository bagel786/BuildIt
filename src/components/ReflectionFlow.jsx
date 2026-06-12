import { useState, useEffect } from 'react';
import { generateReflection } from '../services/groqService';
import { translations, uiLang } from '../i18n/translations';

const CATEGORY_COLORS = {
  science:     'bg-primary-fixed border-primary',
  technology:  'bg-primary-fixed border-primary',
  engineering: 'bg-surface-variant border-outline',
  math:        'bg-secondary-fixed border-secondary',
  art:         'bg-tertiary-fixed-dim border-tertiary',
};

export function ReflectionFlow({ project, buildPhotos = {}, language, initialAnswers, onDone, onShareToGallery }) {
  const tr  = translations[uiLang(language)];
  const ref = tr.reflection;

  const QUESTIONS = [
    { key: 'q1', icon: 'sentiment_excited', label: ref.q1 },
    { key: 'q2', icon: 'build',             label: ref.q2 },
    { key: 'q3', icon: 'rocket_launch',     label: ref.q3 },
  ];

  // If initialAnswers provided, skip question phases and start generating immediately
  const [phase, setPhase]         = useState(initialAnswers ? 3 : 0); // 0,1,2=questions | 3=loading | 4=result
  const [answers, setAnswers]     = useState(initialAnswers || ['', '', '']);
  const [current, setCurrent]     = useState('');
  const [reflection, setReflection] = useState(null);
  const [error, setError]         = useState(false);

  const photos   = Object.values(buildPhotos);
  const heroPhoto = photos[photos.length - 1] || null;

  // Auto-generate if initialAnswers provided (phase already 3)
  useEffect(() => {
    if (!initialAnswers) return;
    generateReflection(initialAnswers, project, language)
      .then(result => { setReflection(result); setPhase(4); })
      .catch(() => { setError(true); setPhase(4); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = async () => {
    const updated = [...answers];
    updated[phase] = current.trim() || '—';
    setAnswers(updated);
    setCurrent('');

    if (phase < 2) {
      setPhase(phase + 1);
    } else {
      setPhase(3);
      try {
        const result = await generateReflection(updated, project, language);
        setReflection(result);
        setPhase(4);
      } catch {
        setError(true);
        setPhase(4);
      }
    }
  };

  const q         = QUESTIONS[phase] || QUESTIONS[0];
  const cardColor = CATEGORY_COLORS[project.category] || CATEGORY_COLORS.science;

  return (
    <div className="fixed inset-0 z-[95] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Questions 0–2 (only shown when initialAnswers not provided) */}
        {phase <= 2 && !initialAnswers && (
          <>
            <div className="bg-primary px-md py-sm flex-shrink-0">
              <p className="font-label-caps text-label-caps text-on-primary/70 uppercase mb-xs">{ref.title}</p>
              <p className="font-headline-md text-headline-md text-on-primary font-bold">{project.title}</p>
              <div className="flex gap-xs mt-sm">
                {QUESTIONS.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= phase ? 'bg-on-primary' : 'bg-on-primary/30'}`} />
                ))}
              </div>
            </div>

            <div className="p-md flex flex-col gap-md flex-1">
              <div className="flex items-center gap-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{q.icon}</span>
                </div>
                <p className="font-headline-md text-headline-md text-on-surface flex-1">{q.label}</p>
              </div>

              <textarea
                value={current}
                onChange={e => setCurrent(e.target.value)}
                placeholder={tr.completion?.q1Placeholder || 'Type your thoughts here…'}
                rows={4}
                autoFocus
                className="w-full bg-surface-container rounded-xl px-sm py-sm font-body-lg text-body-lg text-on-surface resize-none outline-none border-2 border-outline-variant focus:border-primary transition-colors placeholder:text-outline"
              />

              <button
                onClick={handleNext}
                className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-sm rounded-xl border-b-[3px] border-primary-fixed-dim hover:bg-primary-container active:border-b-0 active:translate-y-[3px] transition-all flex items-center justify-center gap-sm"
              >
                {phase === 2 ? (
                  <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> {ref.generate}</>
                ) : (
                  <>{ref.next} <span className="material-symbols-outlined">arrow_forward</span></>
                )}
              </button>
              <button onClick={handleNext} className="text-center text-on-surface-variant font-body-md text-[14px] hover:text-on-surface transition-colors">
                {ref.skip}
              </button>
            </div>
          </>
        )}

        {/* Loading */}
        {phase === 3 && (
          <div className="p-xl flex flex-col items-center gap-md">
            <span className="material-symbols-outlined text-primary text-[56px] animate-spin">autorenew</span>
            <p className="font-headline-md text-headline-md text-on-surface text-center">{ref.generating}</p>
            <p className="font-body-md text-body-md text-on-surface-variant text-center">{ref.generatingSubtitle}</p>
          </div>
        )}

        {/* Result */}
        {phase === 4 && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto flex-1">
              {heroPhoto ? (
                <div className="relative h-40 overflow-hidden">
                  <img src={heroPhoto.dataUrl} alt="build" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-sm left-md right-md">
                    <p className="font-headline-md text-headline-md text-white font-bold">{project.title}</p>
                  </div>
                </div>
              ) : (
                <div className={`h-32 flex items-center justify-center border-b ${cardColor}`}>
                  <span className="material-symbols-outlined text-[56px] text-on-surface/20" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                </div>
              )}

              <div className="p-md space-y-sm">
                {error ? (
                  <div className="text-center py-md">
                    <p className="font-body-lg text-body-lg text-error">{ref.errorMsg}</p>
                  </div>
                ) : reflection && (
                  <>
                    <div className="flex justify-center">
                      <div className="bg-secondary-fixed text-on-secondary-fixed px-md py-sm rounded-full flex items-center gap-sm shadow-sm">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                        <span className="font-headline-md text-[15px] font-bold">{reflection.badge}</span>
                      </div>
                    </div>

                    <div className="bg-primary-fixed rounded-xl p-sm">
                      <p className="font-body-lg text-body-lg text-on-surface">{reflection.summary}</p>
                    </div>

                    <div className="bg-tertiary/10 border border-tertiary/20 rounded-xl p-sm">
                      <p className="font-label-caps text-label-caps text-tertiary uppercase mb-xs">{ref.keyLearning}</p>
                      <p className="font-body-md text-body-md text-on-surface">{reflection.keyLearning}</p>
                    </div>

                    <p className="font-body-md text-body-md text-on-surface-variant text-center italic px-sm">"{reflection.encouragement}"</p>
                  </>
                )}
              </div>
            </div>

            <div className="px-md py-sm border-t border-outline-variant space-y-sm flex-shrink-0">
              <button
                onClick={() => onShareToGallery(project, buildPhotos, reflection)}
                className="w-full bg-tertiary text-on-tertiary font-headline-md text-headline-md py-sm rounded-xl shadow-[0_4px_0_0_#00531c] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-sm"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                {ref.shareCommunity}
              </button>
              <button
                onClick={onDone}
                className="w-full text-on-surface-variant font-body-md text-body-md py-sm text-center hover:text-on-surface transition-colors"
              >
                {ref.done}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
