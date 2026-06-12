import { useState, useRef, useMemo } from 'react';
import { StuckHelp } from './StuckHelp';
import { fileToDataUrl, resizeImageToBase64 } from '../utils/imageUtils';
import { translations, uiLang } from '../i18n/translations';

function Confetti() {
  const pieces = useMemo(() => (
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      delay: `${Math.random() * 2}s`,
      duration: `${Math.random() * 2 + 3}s`,
    }))
  ), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
        />
      ))}
    </div>
  );
}

export function BuildMode({ project, language, studentName, onComplete, onClose, onViewGallery }) {
  const tr = translations[uiLang(language)];
  const cp = tr.completion;

  const [step, setStep]         = useState(0);
  const [photos, setPhotos]     = useState({});
  const [showStuck, setShowStuck] = useState(false);
  const [phase, setPhase]       = useState('building'); // 'building' | 'summary'
  const [answers, setAnswers]   = useState({ q1: '', q2: '' });
  const fileRef = useRef(null);

  const steps      = project.steps || [];
  const totalSteps = steps.length;
  const isLast     = step === totalSteps - 1;
  const progress   = ((step + 1) / totalSteps) * 100;

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      const base64  = await resizeImageToBase64(dataUrl);
      setPhotos(prev => ({ ...prev, [step]: { dataUrl, base64 } }));
    } catch { /* unreadable image — leave the step photo empty */ }
    e.target.value = '';
  };

  const handleNext = () => {
    if (isLast) setPhase('summary');
    else setStep(s => s + 1);
  };

  const photoEntries = Object.entries(photos);

  // ── SUMMARY (Completion) phase ────────────────────────────────────────────
  if (phase === 'summary') {
    const categoryLabel = tr.categories?.[project.category] || project.category || 'STEM';
    return (
      <div className="fixed inset-0 z-[90] bg-surface flex flex-col overflow-y-auto">
        <Confetti />

        {/* Top bar */}
        <header className="bg-surface flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 w-full sticky top-0 z-50 shadow-sm border-b border-surface-variant">
          <div className="flex items-center gap-2 text-primary font-headline-md text-headline-md font-bold">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            BuildIt
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant font-label-caps text-label-caps hover:bg-surface-container transition-colors px-3 py-1.5 rounded-full"
          >
            {tr.langToggle === 'English' ? 'ES' : 'EN'} &nbsp;✕
          </button>
        </header>

        <main className="pt-6 px-margin-mobile md:px-margin-desktop max-w-[800px] mx-auto w-full z-10 relative space-y-xl pb-xl">

          {/* Celebration Header */}
          <section className="text-center space-y-md animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-tertiary-container/20 text-tertiary mb-sm relative">
              <span
                className="material-symbols-outlined text-[56px] absolute z-10"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: '56px' }}
              >emoji_events</span>
              <div className="absolute inset-0 bg-tertiary opacity-10 rounded-full animate-ping" />
            </div>
            <h1 className="font-display text-display text-primary">
              {studentName ? cp.titleWithName(studentName) : cp.title}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto">
              {cp.subtitle(project.title)}
            </p>
          </section>

          {/* Build Journal */}
          <section className="bg-surface-container-lowest rounded-xl p-md border border-surface-variant shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-md flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
              {cp.buildJournal}
            </h2>
            {photoEntries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
                {photoEntries.map(([stepIdx, photo]) => (
                  <div key={stepIdx} className="relative group overflow-hidden rounded-lg aspect-square bg-surface-container">
                    <img
                      src={photo.dataUrl}
                      alt={`Step ${Number(stepIdx) + 1}`}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-primary text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>zoom_in</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-xs py-xs">
                      <p className="font-label-caps text-label-caps text-white uppercase">Step {Number(stepIdx) + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-md text-on-surface-variant bg-surface-container rounded-lg">
                <span className="material-symbols-outlined text-[36px] mb-xs block">photo_camera</span>
                <p className="font-body-md text-body-md">{cp.noPhotos}</p>
              </div>
            )}
          </section>

          {/* STEM concepts */}
          {project.stemConcepts?.length > 0 && (
            <section className="bg-primary-fixed rounded-xl p-md">
              <p className="font-label-caps text-label-caps text-primary uppercase mb-sm">{cp.stemUsed}</p>
              <div className="flex flex-wrap gap-xs">
                {project.stemConcepts.map((c, i) => (
                  <span key={i} className="bg-surface-container-lowest text-primary font-body-md text-[14px] px-sm py-xs rounded-full border border-primary/20">{c}</span>
                ))}
              </div>
            </section>
          )}

          {/* Reflection Questions */}
          <section className="space-y-lg">
            <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              {cp.timeToReflect}
            </h2>
            <div className="space-y-md">
              <div className="bg-surface-container-lowest rounded-xl p-md border border-surface-variant shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
                <label className="block font-headline-md text-headline-md text-on-surface mb-sm">{cp.q1}</label>
                <textarea
                  value={answers.q1}
                  onChange={e => setAnswers(a => ({ ...a, q1: e.target.value }))}
                  placeholder={cp.q1Placeholder}
                  rows={3}
                  className="w-full rounded-lg border-2 border-outline-variant bg-surface-container-low focus:border-primary focus:bg-surface-container-lowest focus:ring-0 p-sm font-body-md text-body-md text-on-surface transition-colors placeholder:text-outline outline-none resize-none"
                />
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-md border border-surface-variant shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
                <label className="block font-headline-md text-headline-md text-on-surface mb-sm">
                  {cp.q2(categoryLabel)}
                </label>
                <textarea
                  value={answers.q2}
                  onChange={e => setAnswers(a => ({ ...a, q2: e.target.value }))}
                  placeholder={cp.q2Placeholder}
                  rows={3}
                  className="w-full rounded-lg border-2 border-outline-variant bg-surface-container-low focus:border-primary focus:bg-surface-container-lowest focus:ring-0 p-sm font-body-md text-body-md text-on-surface transition-colors placeholder:text-outline outline-none resize-none"
                />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <section className="flex flex-col sm:flex-row gap-sm justify-center items-center pt-lg">
            <button
              onClick={() => onComplete(project, photos, [answers.q1 || '—', answers.q2 || '—'])}
              className="w-full sm:w-auto bg-tertiary text-on-tertiary font-headline-md text-headline-md px-lg py-sm rounded-full shadow-[0px_4px_0px_#00531c] active:shadow-none active:translate-y-1 flex items-center justify-center gap-2 hover:bg-tertiary/90 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>ios_share</span>
              {cp.shareCTA}
            </button>
            <button
              onClick={() => { onClose(); onViewGallery?.(); }}
              className="w-full sm:w-auto bg-surface-container border-2 border-primary text-primary font-headline-md text-headline-md px-lg py-sm rounded-full shadow-[0px_4px_0px_#0058bc] active:shadow-none active:translate-y-1 flex items-center justify-center gap-2 hover:bg-primary-fixed transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
              {cp.galleryCTA}
            </button>
          </section>

          <button onClick={onClose} className="w-full text-center text-on-surface-variant font-body-md text-[14px] hover:text-on-surface transition-colors py-sm">
            {cp.closeCTA}
          </button>
        </main>
      </div>
    );
  }

  // ── BUILDING phase ────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[90] bg-surface flex flex-col">
      {/* Header */}
      <div className="bg-surface-container-lowest border-b border-outline-variant px-md py-sm flex items-center gap-sm flex-shrink-0">
        <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">{project.title}</p>
          <p className="font-body-md text-[13px] text-on-surface-variant">{tr.card?.steps || 'Step'} {step + 1} / {totalSteps}</p>
        </div>
        <span className="font-headline-md text-headline-md text-primary font-bold">{Math.round(progress)}%</span>
      </div>

      {/* Progress segments */}
      <div className="flex gap-1 px-md pt-sm flex-shrink-0">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-full transition-all duration-300 ${
              i < step ? 'bg-tertiary' : i === step ? 'bg-primary' : 'bg-surface-container'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-md py-md flex flex-col gap-md">
        <div>
          <div className="flex items-center gap-sm mb-sm">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="font-headline-md text-headline-md text-on-primary font-bold">{step + 1}</span>
            </div>
            <p className="font-label-caps text-label-caps text-primary uppercase">Current step</p>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">{steps[step]}</p>
        </div>

        {/* Materials reminder */}
        <div className="bg-surface-container rounded-xl p-sm">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">{tr.card?.materials || 'Materials'}</p>
          <div className="flex flex-wrap gap-xs">
            {project.materials.map((m, i) => (
              <span key={i} className="bg-surface-container-lowest font-body-md text-[14px] text-on-surface px-sm py-xs rounded-lg border border-outline-variant">{m}</span>
            ))}
          </div>
        </div>

        {/* Photo capture */}
        {photos[step] ? (
          <div className="rounded-xl overflow-hidden border-2 border-primary relative">
            <img src={photos[step].dataUrl} alt="step photo" className="w-full max-h-52 object-cover" />
            <button
              onClick={() => setPhotos(prev => { const n = { ...prev }; delete n[step]; return n; })}
              className="absolute top-2 right-2 bg-error text-on-error rounded-full w-8 h-8 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
            <div className="absolute bottom-2 left-2 bg-black/50 px-sm py-xs rounded-full">
              <p className="font-label-caps text-label-caps text-white uppercase">Photo saved ✓</p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-outline-variant rounded-xl py-8 flex flex-col items-center gap-xs text-on-surface-variant hover:border-primary hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-[36px]">photo_camera</span>
            <span className="font-body-md text-body-md font-bold">Snap a photo of this step</span>
            <span className="font-body-md text-[13px]">Optional — builds your journal</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
      </div>

      {/* Navigation actions */}
      <div className="px-md py-sm border-t border-outline-variant flex gap-sm flex-shrink-0">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="w-10 h-12 rounded-xl border border-outline-variant flex items-center justify-center text-on-surface-variant disabled:opacity-30 hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <button
          onClick={() => setShowStuck(true)}
          className="flex-none px-md h-12 rounded-xl border-2 border-error/30 bg-error/5 text-error font-body-md text-body-md font-bold hover:bg-error/10 transition-colors flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
          Stuck?
        </button>
        <button
          onClick={handleNext}
          className="flex-1 h-12 bg-primary text-on-primary font-headline-md text-[18px] rounded-xl border-b-[3px] border-primary-fixed-dim hover:bg-primary-container active:border-b-0 active:translate-y-[3px] transition-all flex items-center justify-center gap-xs"
        >
          {isLast ? (
            <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Finish!</>
          ) : (
            <>Next step <span className="material-symbols-outlined">arrow_forward</span></>
          )}
        </button>
      </div>

      {showStuck && (
        <StuckHelp
          step={steps[step]}
          stepIndex={step}
          project={project}
          language={language}
          onClose={() => setShowStuck(false)}
        />
      )}
    </div>
  );
}
