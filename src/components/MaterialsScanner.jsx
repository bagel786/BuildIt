import { useState, useRef } from 'react';
import { generateFromMaterials } from '../services/claudeService';
import { fileToDataUrl, resizeImageToBase64 } from '../utils/imageUtils';

export function MaterialsScanner({ studentData, language, onProjectsGenerated, onClose }) {
  const [image, setImage] = useState(null); // { dataUrl, base64 }
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const dataUrl = await fileToDataUrl(file);
    const base64 = await resizeImageToBase64(dataUrl);
    setImage({ dataUrl, base64 });
    e.target.value = '';
  };

  const handleGenerate = async () => {
    if (!image && !textInput.trim()) {
      setError('Add a photo or type your materials first.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await generateFromMaterials(
        image?.base64 || null,
        textInput.trim(),
        studentData,
        language
      );
      onProjectsGenerated(result);
    } catch (err) {
      if (err.message === 'NO_MATERIALS') setError('Could not detect any materials. Try adding a description too.');
      else if (err.message === 'RATE_LIMIT') setError('Too many requests — wait a moment and try again.');
      else setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/40 items-center justify-center p-4">
      <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-sm px-md py-sm border-b border-outline-variant bg-surface-container-lowest flex-shrink-0">
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Scan Your Materials</h2>
            <p className="font-body-md text-[14px] text-on-surface-variant">Take a photo or type what you have</p>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-md py-md space-y-md">
          {/* Image capture area */}
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-sm">📷 Photo of your materials</p>
            {image ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-primary">
                <img src={image.dataUrl} alt="materials" className="w-full max-h-56 object-cover" />
                <button
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-error text-on-error rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:opacity-80 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
                <div className="absolute bottom-2 left-2 bg-surface-container-lowest/90 text-on-surface font-label-caps text-label-caps px-sm py-xs rounded-full">
                  Photo ready ✓
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-outline-variant rounded-xl py-10 flex flex-col items-center gap-sm text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary-fixed/20 transition-all"
              >
                <span
                  className="material-symbols-outlined text-[48px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  photo_camera
                </span>
                <span className="font-body-md text-body-md font-bold">Take or upload a photo</span>
                <span className="font-body-md text-[14px]">Spread your materials out and snap a picture</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImagePick}
              className="hidden"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-sm">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">or type it out</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          {/* Text input */}
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-sm">✏️ List your materials</p>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. cardboard, scissors, tape, rubber bands, empty bottles, string…"
              rows={3}
              className="w-full bg-surface-container-lowest border-2 border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0 outline-none placeholder:text-outline resize-none transition-colors"
            />
            <p className="font-body-md text-[13px] text-on-surface-variant mt-xs">
              You can also add extra items not visible in the photo above.
            </p>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container font-body-md text-[14px] rounded-xl px-sm py-xs">
              {error}
            </div>
          )}
        </div>

        {/* Action */}
        <div className="px-md py-sm border-t border-outline-variant flex-shrink-0">
          <button
            onClick={handleGenerate}
            disabled={loading || (!image && !textInput.trim())}
            className="w-full bg-tertiary text-on-tertiary font-headline-md text-headline-md py-4 rounded-xl shadow-[0_4px_0_0_#00531c] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[24px] animate-spin">autorenew</span>
                Analyzing materials…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                Find Projects for These Materials
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
