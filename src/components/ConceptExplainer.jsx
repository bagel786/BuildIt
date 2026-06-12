import { useState, useEffect } from 'react';
import { explainConcept } from '../services/groqService';

const GRADE_LABELS = {
  k2: 'K through 2nd Grade', '35': '3rd through 5th Grade',
  '68': '6th through 8th Grade', '912': '9th through 12th Grade',
  k: 'Kindergarten', '1': '1st Grade', '2': '2nd Grade',
};

export function ConceptExplainer({ concept, grade, language, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const gradeLabel = GRADE_LABELS[grade] || grade || 'student';

  useEffect(() => {
    explainConcept(concept, gradeLabel, language)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [concept, gradeLabel, language]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-md py-sm flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-on-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>science</span>
            <div>
              <p className="font-headline-md text-[15px] text-on-primary font-bold">{concept}</p>
              <p className="font-label-caps text-label-caps text-on-primary/70 uppercase">STEM Concept</p>
            </div>
          </div>
          <button onClick={onClose} className="text-on-primary/70 hover:text-on-primary transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-md space-y-md">
          {loading && (
            <div className="flex flex-col items-center gap-sm py-lg">
              <span className="material-symbols-outlined text-primary text-[40px] animate-spin">autorenew</span>
              <p className="font-body-md text-body-md text-on-surface-variant">Fetching your explanation…</p>
            </div>
          )}

          {error && (
            <div className="text-center py-lg">
              <p className="font-body-md text-body-md text-error">Couldn't load explanation. Try again.</p>
              <button onClick={onClose} className="mt-sm font-body-md text-primary underline">Close</button>
            </div>
          )}

          {data && (
            <>
              {/* Explanation */}
              <div className="bg-primary-fixed rounded-xl p-sm">
                <p className="font-label-caps text-label-caps text-primary uppercase mb-xs">What is it?</p>
                <p className="font-body-lg text-body-lg text-on-surface">{data.explanation}</p>
              </div>

              {/* Real world example */}
              <div className="bg-secondary-fixed/40 rounded-xl p-sm">
                <div className="flex items-center gap-xs mb-xs">
                  <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                  <p className="font-label-caps text-label-caps text-secondary uppercase">Real life</p>
                </div>
                <p className="font-body-md text-body-md text-on-surface">{data.realWorldExample}</p>
              </div>

              {/* Quick activity */}
              <div className="bg-tertiary/10 border border-tertiary/20 rounded-xl p-sm">
                <div className="flex items-center gap-xs mb-xs">
                  <span className="material-symbols-outlined text-tertiary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  <p className="font-label-caps text-label-caps text-tertiary uppercase">Try it right now!</p>
                </div>
                <p className="font-body-md text-body-md text-on-surface">{data.quickActivity}</p>
              </div>
            </>
          )}
        </div>

        <div className="px-md pb-md">
          <button
            onClick={onClose}
            className="w-full bg-primary text-on-primary font-headline-md text-[18px] py-sm rounded-xl hover:bg-primary-container transition-colors"
          >
            Got it! Back to building
          </button>
        </div>
      </div>
    </div>
  );
}
