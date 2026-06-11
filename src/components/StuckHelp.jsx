import { useState, useEffect, useRef } from 'react';
import { getStepHelp } from '../services/claudeService';
import { fileToDataUrl, resizeImageToBase64 } from '../utils/imageUtils';

export function StuckHelp({ step, stepIndex, project, language, onClose }) {
  const [help, setHelp] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [refetching, setRefetching] = useState(false);
  const fileRef = useRef(null);

  const fetchHelp = async (imageBase64 = null) => {
    setError(false);
    imageBase64 ? setRefetching(true) : setLoading(true);
    try {
      const response = await getStepHelp(step, stepIndex, project, language, imageBase64);
      setHelp(response);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefetching(false);
    }
  };

  useEffect(() => { fetchHelp(); }, []);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const base64 = await resizeImageToBase64(dataUrl);
    setPhoto({ dataUrl, base64 });
    fetchHelp(base64);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center bg-black/50">
      <div className="bg-surface-container-lowest w-full md:max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-sm pb-xs md:hidden">
          <div className="w-10 h-1 rounded-full bg-outline-variant" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-error text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
            <p className="font-headline-md text-headline-md font-bold text-on-surface">I'm stuck on Step {stepIndex + 1}</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-md py-sm space-y-sm max-h-[60vh] overflow-y-auto">
          {/* Current step */}
          <div className="bg-surface-container rounded-xl p-sm">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Current step</p>
            <p className="font-body-md text-body-md text-on-surface">{step}</p>
          </div>

          {/* AI help */}
          <div className="bg-primary-fixed rounded-xl p-sm min-h-[80px] flex items-start gap-sm">
            <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            {(loading || refetching) ? (
              <div className="flex items-center gap-xs">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : error ? (
              <p className="font-body-md text-body-md text-error">Couldn't load help. Check your connection.</p>
            ) : (
              <p className="font-body-md text-body-md text-on-surface">{help}</p>
            )}
          </div>

          {/* Photo for visual help */}
          {photo && (
            <div className="rounded-xl overflow-hidden border border-outline-variant">
              <img src={photo.dataUrl} alt="your progress" className="w-full max-h-40 object-cover" />
            </div>
          )}

          <div className="flex gap-sm">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 border-2 border-dashed border-outline-variant rounded-xl py-sm flex items-center justify-center gap-xs text-on-surface-variant hover:border-primary hover:text-primary transition-colors font-body-md text-[14px] font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              {photo ? 'Replace photo' : 'Show me your progress'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
          </div>
        </div>

        <div className="px-md py-sm border-t border-outline-variant">
          <button
            onClick={onClose}
            className="w-full bg-tertiary text-on-tertiary font-headline-md text-[18px] py-sm rounded-xl shadow-[0_4px_0_0_#00531c] active:shadow-none active:translate-y-1 transition-all"
          >
            Got it, back to building!
          </button>
        </div>
      </div>
    </div>
  );
}
