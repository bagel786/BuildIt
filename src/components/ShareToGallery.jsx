import { useState, useRef } from 'react';
import { createPost } from '../services/communityService';
import { moderateContent } from '../services/groqService';
import { fileToDataUrl, resizeImageToBase64 } from '../utils/imageUtils';
import { translations, uiLang } from '../i18n/translations';

const CATEGORIES_EN = ['engineering', 'science', 'technology', 'math', 'art'];

export function ShareToGallery({ project, defaultPhoto, language = 'en', onPosted, onClose }) {
  const tr = translations[uiLang(language)];
  const sh = tr.share;
  const catLabels = tr.categories;

  const [studentName, setStudentName] = useState('');
  const [caption, setCaption]         = useState('');
  const [category, setCategory]       = useState(project?.category || 'engineering');
  const [photo, setPhoto]             = useState(defaultPhoto || null);
  const [phase, setPhase]             = useState('form'); // 'form' | 'moderating' | 'success' | 'blocked'
  const [blockReason, setBlockReason] = useState('');
  const [error, setError]             = useState('');
  const fileRef = useRef(null);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      const base64  = await resizeImageToBase64(dataUrl);
      setPhoto({ dataUrl, base64 });
    } catch {
      setError(sh.errorPost);
    }
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!studentName.trim())        { setError(sh.errorName);    return; }
    if (caption.trim().length < 10) { setError(sh.errorCaption); return; }
    setError('');
    setPhase('moderating');

    try {
      const mod = await moderateContent(caption, project?.title || 'Build');
      if (!mod.approved) { setBlockReason(mod.reason); setPhase('blocked'); return; }
    } catch { /* fail open */ }

    const projectData = project ? {
      hook: project.hook,
      stemConcepts: project.stemConcepts,
      materials: project.materials,
      steps: project.steps,
      estimatedCost: project.estimatedCost,
      estimatedTime: project.estimatedTime,
    } : null;

    try {
      const newPost = await createPost({
        studentName: studentName.trim(),
        projectTitle: project?.title || 'Build Project',
        category,
        caption: caption.trim(),
        photo: photo?.base64 || null,
        projectData,
      });
      onPosted(newPost);
      setPhase('success');
    } catch {
      setError(sh.errorPost);
      setPhase('form');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-end md:items-center justify-center">
      <div className="bg-surface-container-lowest w-full md:max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="bg-tertiary px-md py-sm flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-on-tertiary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            <p className="font-headline-md text-headline-md text-on-tertiary font-bold">{sh.title}</p>
          </div>
          <button onClick={onClose} className="text-on-tertiary/70 hover:text-on-tertiary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        {phase === 'form' && (
          <div className="overflow-y-auto flex-1 p-md space-y-sm">
            {project && (
              <div className="bg-surface-container rounded-xl px-sm py-xs flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
                <p className="font-body-md text-[14px] text-on-surface font-bold">{project.title}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-xs">{sh.nameLabel}</label>
              <input
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder={sh.namePlaceholder}
                maxLength={30}
                className="w-full bg-surface-container rounded-xl px-sm py-sm font-body-lg text-body-lg text-on-surface outline-none border-2 border-outline-variant focus:border-tertiary transition-colors placeholder:text-outline"
              />
            </div>

            {/* Category */}
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-xs">{sh.categoryLabel}</label>
              <div className="flex flex-wrap gap-xs">
                {CATEGORIES_EN.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-sm py-xs rounded-full font-body-md text-[14px] font-bold capitalize border-2 transition-all ${
                      category === c
                        ? 'bg-tertiary text-on-tertiary border-tertiary'
                        : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-tertiary'
                    }`}
                  >
                    {catLabels?.[c] || c}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-xs">{sh.captionLabel}</label>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder={sh.captionPlaceholder}
                rows={4}
                maxLength={280}
                className="w-full bg-surface-container rounded-xl px-sm py-sm font-body-lg text-body-lg text-on-surface resize-none outline-none border-2 border-outline-variant focus:border-tertiary transition-colors placeholder:text-outline"
              />
              <p className="text-right font-body-md text-[12px] text-on-surface-variant mt-xs">{caption.length}/280</p>
            </div>

            {/* Photo */}
            {photo ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-tertiary">
                <img src={photo.dataUrl} alt="your build" className="w-full max-h-52 object-cover" />
                <button
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 bg-error text-on-error rounded-full w-8 h-8 flex items-center justify-center shadow"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
                <div className="absolute bottom-2 left-2 bg-black/50 px-sm py-xs rounded-full">
                  <p className="font-label-caps text-label-caps text-white uppercase">Photo added ✓</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-outline-variant rounded-xl py-6 flex flex-col items-center gap-xs text-on-surface-variant hover:border-tertiary hover:text-tertiary transition-all"
              >
                <span className="material-symbols-outlined text-[32px]">add_a_photo</span>
                <span className="font-body-md text-[14px] font-bold">{sh.addPhotoLabel}</span>
                <span className="font-body-md text-[12px]">{sh.addPhotoSub}</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />

            {error && <p className="font-body-md text-[14px] text-error text-center">{error}</p>}

            <button
              onClick={handleSubmit}
              className="w-full bg-tertiary text-on-tertiary font-headline-md text-headline-md py-sm rounded-xl shadow-[0_4px_0_0_#00531c] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-sm"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              {sh.submitCTA}
            </button>
          </div>
        )}

        {/* Moderating */}
        {phase === 'moderating' && (
          <div className="p-xl flex flex-col items-center gap-md">
            <span className="material-symbols-outlined text-primary text-[56px] animate-spin">autorenew</span>
            <p className="font-headline-md text-headline-md text-on-surface text-center">{sh.reviewing}</p>
            <p className="font-body-md text-body-md text-on-surface-variant text-center">{sh.reviewingSub}</p>
          </div>
        )}

        {/* Blocked */}
        {phase === 'blocked' && (
          <div className="p-md flex flex-col items-center gap-md text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
            </div>
            <p className="font-headline-md text-headline-md text-on-surface">{sh.blockedTitle}</p>
            <p className="font-body-md text-body-md text-on-surface-variant">{blockReason || sh.blockedFallback}</p>
            <button
              onClick={() => setPhase('form')}
              className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-sm rounded-xl"
            >
              {sh.editPost}
            </button>
          </div>
        )}

        {/* Success */}
        {phase === 'success' && (
          <div className="p-md flex flex-col items-center gap-md text-center">
            <div className="w-20 h-20 rounded-full bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <p className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{sh.successTitle}</p>
            <p className="font-body-md text-body-md text-on-surface-variant">{sh.successSub}</p>
            <button
              onClick={onClose}
              className="w-full bg-tertiary text-on-tertiary font-headline-md text-headline-md py-sm rounded-xl shadow-[0_4px_0_0_#00531c] active:shadow-none active:translate-y-1 transition-all"
            >
              {sh.seeGallery}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
