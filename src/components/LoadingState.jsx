import { useState, useEffect } from 'react';

const FACTS = [
  'Engineers use household items like cardboard and tape to prototype big ideas every day!',
  'The word "robot" comes from a Czech word meaning "forced labor" — coined in 1920.',
  'There are more possible games of chess than atoms in the observable universe!',
  'A single lightning bolt is 5 times hotter than the surface of the sun.',
  'The first computer bug was an actual bug — a moth stuck in a relay in 1947.',
];

export function LoadingState() {
  const [factIdx, setFactIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFactIdx((i) => (i + 1) % FACTS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="flex-grow flex flex-col items-center justify-center px-margin-mobile pt-16 pb-24 max-w-4xl mx-auto w-full">
      {/* Central Loading Graphic */}
      <div className="relative w-48 h-48 mb-lg flex items-center justify-center">
        <div
          className="absolute inset-0 bg-primary-fixed-dim rounded-full opacity-50 blur-xl"
          style={{ animation: 'pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite' }}
        />
        <div className="relative z-10 bg-surface-container-lowest border border-outline-variant shadow-[0px_8px_30px_rgba(0,0,0,0.08)] rounded-full w-32 h-32 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-primary text-6xl"
            style={{
              fontVariationSettings: "'FILL' 1",
              animation: 'pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
            }}
          >
            engineering
          </span>
        </div>
        <span
          className="material-symbols-outlined absolute top-4 right-4 text-secondary-fixed-dim text-xl animate-bounce"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          spark
        </span>
        <span
          className="material-symbols-outlined absolute bottom-4 left-4 text-tertiary-fixed-dim text-lg animate-bounce"
          style={{ fontVariationSettings: "'FILL' 1", animationDelay: '0.5s' }}
        >
          star
        </span>
      </div>

      <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-center text-primary mb-sm">
        Hang tight, Maker!
      </h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant text-center mb-xl max-w-md">
        We're gathering the best blueprints and building 3 special projects just for you…
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-sm bg-surface-container rounded-full h-6 mb-lg overflow-hidden border-2 border-surface-dim relative">
        <div
          className="bg-tertiary h-full rounded-full flex items-center justify-end pr-2"
          style={{ animation: 'fillBar 3s ease-in-out infinite alternate' }}
        >
          <span
            className="material-symbols-outlined text-on-tertiary text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
        </div>
      </div>

      {/* Fun Facts */}
      <div className="bg-primary-fixed rounded-xl p-md max-w-md w-full border border-primary-fixed-dim shadow-[0px_4px_20px_rgba(0,0,0,0.05)] text-center overflow-hidden min-h-[8rem] flex flex-col items-center justify-center">
        <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest mb-xs block">
          Did you know?
        </span>
        <p
          key={factIdx}
          className="font-body-md text-body-md text-on-primary-fixed-variant"
          style={{ animation: 'fadeUp 0.4s ease-out' }}
        >
          {FACTS[factIdx]}
        </p>
      </div>

      {/* Decorative blobs */}
      <div className="fixed top-20 -left-10 w-40 h-40 bg-secondary-fixed rounded-full mix-blend-multiply blur-2xl opacity-20 pointer-events-none" />
      <div className="fixed bottom-20 -right-10 w-64 h-64 bg-primary-fixed-dim rounded-full mix-blend-multiply blur-3xl opacity-30 pointer-events-none" />

      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(0.8); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0.8; }
        }
        @keyframes fillBar {
          0% { width: 10%; }
          100% { width: 90%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
