import { useState } from 'react';
import { createIdea } from '../services/communityService';
import { generateIdeaProject, moderateContent } from '../services/groqService';
import { translations, uiLang } from '../i18n/translations';

const CATEGORIES_EN = ['engineering', 'science', 'technology', 'math', 'art'];
const BUDGET_OPTIONS = ['free', 'low', 'medium'];

export function ShareIdea({ language = 'en', onPosted, onClose }) {
  const tr = translations[uiLang(language)];
  const id = tr.idea;
  const catLabels = tr.categories;

  const [studentName, setStudentName]         = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [budget, setBudget]                   = useState('low');
  const [phase, setPhase]                     = useState('form');
  // 'form' | 'generating' | 'preview' | 'posting' | 'blocked' | 'success'
  const [generated, setGenerated]             = useState(null);
  const [blockReason, setBlockReason]         = useState('');
  const [error, setError]                     = useState('');

  const handleGenerate = async () => {
    if (!studentName.trim())              { setError(id.errorName);  return; }
    if (ideaDescription.trim().length < 15) { setError(id.errorDesc);  return; }
    setError('');
    setPhase('generating');

    // Content moderation on the raw idea text
    try {
      const mod = await moderateContent(ideaDescription.trim(), 'Project idea');
      if (!mod.approved) {
        setBlockReason(mod.reason || '');
        setPhase('blocked');
        return;
      }
    } catch { /* fail open */ }

    // Generate a real buildable project from the idea
    try {
      const project = await generateIdeaProject(ideaDescription.trim(), budget, language);
      setGenerated(project);
      setPhase('preview');
    } catch {
      setError(id.errorGenerate || 'Could not generate a project. Try again.');
      setPhase('form');
    }
  };

  const handlePost = async () => {
    setPhase('posting');
    try {
      const newIdea = await createIdea({
        studentName: studentName.trim(),
        ideaDescription: ideaDescription.trim(),
        ideaTitle: generated.title,
        category: generated.category,
        projectData: generated,
      });
      onPosted(newIdea);
      setPhase('success');
    } catch {
      setError(id.errorPost);
      setPhase('preview');
    }
  };

  const handleRetry = async () => {
    setGenerated(null);
    setPhase('generating');
    try {
      const project = await generateIdeaProject(ideaDescription.trim(), budget, language);
      setGenerated(project);
      setPhase('preview');
    } catch {
      setError(id.errorGenerate || 'Could not generate a project. Try again.');
      setPhase('form');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-end md:items-center justify-center">
      <div className="bg-surface-container-lowest w-full md:max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="bg-secondary px-md py-sm flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-on-secondary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            <p className="font-headline-md text-headline-md text-on-secondary font-bold">{id.shareTitle}</p>
          </div>
          <button onClick={onClose} className="text-on-secondary/70 hover:text-on-secondary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* ── Phase: form ── */}
        {phase === 'form' && (
          <div className="overflow-y-auto flex-1 p-md space-y-sm">
            <p className="font-body-md text-body-md text-on-surface-variant">{id.formHint}</p>

            {/* Name */}
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-xs">{id.nameLabel}</label>
              <input
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder={id.namePlaceholder}
                maxLength={30}
                className="w-full bg-surface-container rounded-xl px-sm py-sm font-body-lg text-body-lg text-on-surface outline-none border-2 border-outline-variant focus:border-secondary transition-colors placeholder:text-outline"
              />
            </div>

            {/* Idea description */}
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-xs">{id.ideaDescriptionLabel}</label>
              <textarea
                value={ideaDescription}
                onChange={e => setIdeaDescription(e.target.value)}
                placeholder={id.ideaDescriptionPlaceholder}
                rows={4}
                maxLength={400}
                className="w-full bg-surface-container rounded-xl px-sm py-sm font-body-lg text-body-lg text-on-surface resize-none outline-none border-2 border-outline-variant focus:border-secondary transition-colors placeholder:text-outline"
              />
              <p className="text-right font-body-md text-[12px] text-on-surface-variant mt-xs">{ideaDescription.length}/400</p>
            </div>

            {/* Budget */}
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-xs">{id.budgetLabel}</label>
              <div className="flex flex-wrap gap-xs">
                {BUDGET_OPTIONS.map(b => (
                  <button
                    key={b}
                    onClick={() => setBudget(b)}
                    className={`px-sm py-xs rounded-full font-body-md text-[14px] font-bold border-2 transition-all ${
                      budget === b
                        ? 'bg-secondary text-on-secondary border-secondary'
                        : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-secondary'
                    }`}
                  >
                    {id.budgetOptions?.[b] || b}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="font-body-md text-[14px] text-error text-center">{error}</p>}

            <button
              onClick={handleGenerate}
              className="w-full bg-secondary text-on-secondary font-headline-md text-headline-md py-sm rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.25)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-sm"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              {id.generateCTA}
            </button>
          </div>
        )}

        {/* ── Phase: generating ── */}
        {phase === 'generating' && (
          <div className="p-xl flex flex-col items-center gap-md">
            <span className="material-symbols-outlined text-secondary text-[56px] animate-spin">autorenew</span>
            <p className="font-headline-md text-headline-md text-on-surface text-center">{id.generatingTitle}</p>
            <p className="font-body-md text-body-md text-on-surface-variant text-center">{id.generatingSub}</p>
          </div>
        )}

        {/* ── Phase: preview ── */}
        {phase === 'preview' && generated && (
          <div className="overflow-y-auto flex-1 flex flex-col">
            {/* Preview header */}
            <div className="px-md pt-md pb-sm flex-shrink-0">
              <div className="flex items-center gap-xs mb-xs">
                <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <p className="font-label-caps text-label-caps text-secondary uppercase">{id.previewLabel}</p>
              </div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">{generated.title}</h2>
            </div>

            {/* Hook */}
            <div className="mx-md mb-sm bg-secondary-container/40 border border-secondary/20 rounded-xl px-sm py-sm">
              <p className="font-body-md text-body-md text-on-surface italic">{generated.hook}</p>
            </div>

            {/* Category + concepts pills */}
            <div className="px-md mb-sm flex flex-wrap gap-xs">
              {(generated.stemConcepts || []).map((c, i) => (
                <span key={i} className="bg-surface-container text-on-surface-variant font-label-caps text-[11px] px-sm py-xs rounded-full border border-outline-variant capitalize">
                  {c}
                </span>
              ))}
            </div>

            {/* Materials preview */}
            <div className="px-md mb-sm">
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">{id.materialsPreviewLabel}</p>
              <ul className="space-y-xs">
                {(generated.materials || []).slice(0, 4).map((m, i) => (
                  <li key={i} className="flex gap-xs items-start font-body-md text-[13px] text-on-surface">
                    <span className="text-secondary mt-0.5 flex-shrink-0">•</span>
                    <span className="line-clamp-1">{m}</span>
                  </li>
                ))}
                {(generated.materials || []).length > 4 && (
                  <li className="font-body-md text-[13px] text-on-surface-variant italic">
                    +{generated.materials.length - 4} more materials
                  </li>
                )}
              </ul>
            </div>

            {/* Cost + time chips */}
            <div className="px-md mb-md flex gap-sm">
              {generated.estimatedCost && (
                <div className="flex items-center gap-xs bg-surface-container rounded-lg px-sm py-xs">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">payments</span>
                  <span className="font-label-caps text-label-caps text-on-surface">{generated.estimatedCost}</span>
                </div>
              )}
              {generated.estimatedTime && (
                <div className="flex items-center gap-xs bg-surface-container rounded-lg px-sm py-xs">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">schedule</span>
                  <span className="font-label-caps text-label-caps text-on-surface">{generated.estimatedTime}</span>
                </div>
              )}
            </div>

            {error && <p className="px-md font-body-md text-[14px] text-error text-center mb-sm">{error}</p>}

            {/* Action buttons */}
            <div className="px-md pb-md flex flex-col gap-sm flex-shrink-0">
              <button
                onClick={handlePost}
                className="w-full bg-secondary text-on-secondary font-headline-md text-headline-md py-sm rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.25)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-sm"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                {id.shareThisIdea}
              </button>
              <button
                onClick={handleRetry}
                className="w-full border-2 border-outline-variant text-on-surface-variant font-body-md text-[14px] py-sm rounded-xl hover:border-secondary hover:text-secondary transition-all flex items-center justify-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                {id.tryAgain}
              </button>
            </div>
          </div>
        )}

        {/* ── Phase: posting ── */}
        {phase === 'posting' && (
          <div className="p-xl flex flex-col items-center gap-md">
            <span className="material-symbols-outlined text-secondary text-[56px] animate-spin">autorenew</span>
            <p className="font-headline-md text-headline-md text-on-surface text-center">{id.postingTitle}</p>
          </div>
        )}

        {/* ── Phase: blocked ── */}
        {phase === 'blocked' && (
          <div className="p-md flex flex-col items-center gap-md text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
            </div>
            <p className="font-headline-md text-headline-md text-on-surface">{id.blockedTitle}</p>
            <p className="font-body-md text-body-md text-on-surface-variant">{blockReason || id.blockedFallback}</p>
            <button
              onClick={() => setPhase('form')}
              className="w-full bg-secondary text-on-secondary font-headline-md text-headline-md py-sm rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.25)] active:shadow-none active:translate-y-1 transition-all"
            >
              {id.editIdea}
            </button>
          </div>
        )}

        {/* ── Phase: success ── */}
        {phase === 'success' && (
          <div className="p-md flex flex-col items-center gap-md text-center">
            <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <p className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{id.successTitle}</p>
            <p className="font-body-md text-body-md text-on-surface-variant">{id.successSub}</p>
            <button
              onClick={onClose}
              className="w-full bg-secondary text-on-secondary font-headline-md text-headline-md py-sm rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.25)] active:shadow-none active:translate-y-1 transition-all"
            >
              {id.seeIdeas}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
