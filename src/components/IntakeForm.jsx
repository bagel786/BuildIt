import { useState } from 'react';
import { translations, uiLang } from '../i18n/translations';

const GRADE_BANDS = [
  { value: 'k2', label: 'K–2' },
  { value: '35', label: '3–5' },
  { value: '68', label: '6–8' },
  { value: '912', label: '9–12' },
];

const STEM_KEYS = [
  'science', 'technology', 'engineering', 'math',
  'biology', 'chemistry', 'physics', 'computerScience',
  'robotics', 'astronomy', 'environmental', 'electronics',
];

const INITIAL_FORM = {
  name: '',
  grade: '',
  stemInterests: [],
  personalInterests: '',
  budget: 'free',
  timeAvailable: 'short',
  complexity: 'intermediate',
};

export function IntakeForm({ language, onLanguageChange, onSubmit, error, onScanMaterials }) {
  const tr = translations[uiLang(language)];
  const f = tr.form;

  // Build time/budget option arrays from translations so they always match the active language
  const TIME_OPTIONS = Object.entries(f.timeAvailable.options).map(([value, label]) => ({ value, label }));
  const BUDGET_OPTIONS = Object.entries(f.budget.options).map(([value, label]) => ({ value, label }));

  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const toggleStem = (key) => {
    setForm((prev) => ({
      ...prev,
      stemInterests: prev.stemInterests.includes(key)
        ? prev.stemInterests.filter((k) => k !== key)
        : [...prev.stemInterests, key],
    }));
  };

  const fieldErr = {
    name: touched.name && !form.name.trim(),
    grade: touched.grade && !form.grade,
    stemInterests: touched.stemInterests && form.stemInterests.length === 0,
    personalInterests: touched.personalInterests && !form.personalInterests.trim(),
  };

  const isValid =
    form.name.trim() &&
    form.grade &&
    form.stemInterests.length > 0 &&
    form.personalInterests.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, grade: true, stemInterests: true, personalInterests: true });
    if (!isValid) return;
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  const getErrorMessage = () => {
    if (!error) return null;
    const msg = error.message;
    if (msg === 'API_KEY_MISSING') return tr.errors.apiKey;
    if (msg === 'PARSE_ERROR') return tr.errors.parse;
    if (msg === 'RATE_LIMIT') return tr.errors.rateLimit;
    if (msg === 'SAFETY_BLOCK') return tr.errors.safetyBlock;
    if (msg === 'NETWORK_ERROR' || error.name === 'TypeError') return tr.errors.network;
    return tr.errors.generic;
  };

  return (
    <div className="pt-24 pb-32 px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto w-full">
      {/* Welcome Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-variant p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed to-surface-container-lowest opacity-30 z-0" />
        <div className="relative z-10">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-container text-on-primary-container mb-6 shadow-sm">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              waving_hand
            </span>
          </div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface mb-2">
            {f.title}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">{f.subtitle}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container border border-error rounded-xl text-on-error-container font-body-md text-body-md">
          {getErrorMessage()}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-xl">
        {/* Language */}
        <section className="space-y-4">
          <label className="block font-headline-md text-headline-md text-on-surface" htmlFor="lang">
            {f.languageHeading}
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>language</span>
            <input
              id="lang"
              type="text"
              value={language === 'English' || language === 'en' ? '' : language}
              onChange={(e) => onLanguageChange(e.target.value || 'English')}
              placeholder={f.languagePlaceholder}
              className="w-full bg-surface-container-lowest border-2 border-outline-variant rounded-xl pl-12 pr-4 py-4 font-body-lg text-body-lg text-on-surface focus:border-primary focus:ring-0 transition-colors shadow-sm outline-none placeholder:text-outline"
            />
          </div>
          {language && language !== 'English' && language !== 'en' && (
            <p className="font-body-md text-[13px] text-primary flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {language}
            </p>
          )}
        </section>

        {/* Name */}
        <section className="space-y-4">
          <label className="block font-headline-md text-headline-md text-on-surface" htmlFor="firstName">
            {f.nameHeading}
          </label>
          <input
            id="firstName"
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            onBlur={() => touch('name')}
            placeholder={f.name.placeholder}
            autoComplete="given-name"
            className={`w-full bg-surface-container-lowest border-2 rounded-xl px-4 py-4 font-body-lg text-body-lg text-on-surface focus:ring-0 transition-colors shadow-sm outline-none placeholder:text-outline ${
              fieldErr.name ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'
            }`}
          />
          {fieldErr.name && <p className="text-sm text-error mt-1">{f.validation.required}</p>}
        </section>

        {/* Grade Level */}
        <section className="space-y-4">
          <label className="block font-headline-md text-headline-md text-on-surface">
            {f.gradeHeading}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GRADE_BANDS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setForm((p) => ({ ...p, grade: value })); touch('grade'); }}
                className={`rounded-xl p-4 text-center font-headline-md text-headline-md transition-all shadow-sm border-2 ${
                  form.grade === value
                    ? 'bg-primary-fixed border-primary text-on-primary-fixed'
                    : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {fieldErr.grade && <p className="text-sm text-error">{f.validation.grade}</p>}
        </section>

        {/* STEM Interests */}
        <section className="space-y-4">
          <label className="block font-headline-md text-headline-md text-on-surface">
            {f.stemHeading}
          </label>
          {fieldErr.stemInterests && <p className="text-sm text-error">{f.validation.stem}</p>}
          <div className="flex flex-wrap gap-3">
            {STEM_KEYS.map((key) => {
              const selected = form.stemInterests.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { toggleStem(key); touch('stemInterests'); }}
                  className={`rounded-full px-6 py-2 font-body-md text-body-md border-2 transition-all font-bold ${
                    selected
                      ? 'bg-secondary-fixed text-on-secondary-fixed border-secondary'
                      : 'bg-surface-variant text-on-surface-variant border-transparent hover:opacity-80'
                  }`}
                >
                  {f.stemInterests.options[key]}
                </button>
              );
            })}
          </div>
        </section>

        {/* Hobbies */}
        <section className="space-y-4">
          <label className="block font-headline-md text-headline-md text-on-surface" htmlFor="hobbies">
            {f.hobbiesHeading}
          </label>
          <textarea
            id="hobbies"
            value={form.personalInterests}
            onChange={(e) => setForm((p) => ({ ...p, personalInterests: e.target.value }))}
            onBlur={() => touch('personalInterests')}
            placeholder={f.personalInterests.placeholder}
            rows={3}
            className={`w-full bg-surface-container-lowest border-2 rounded-xl px-4 py-4 font-body-lg text-body-lg text-on-surface focus:ring-0 transition-colors shadow-sm outline-none placeholder:text-outline resize-none ${
              fieldErr.personalInterests ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'
            }`}
          />
          {fieldErr.personalInterests && <p className="text-sm text-error">{f.validation.required}</p>}
        </section>

        {/* Logistics */}
        <section className="bg-surface-container-low rounded-2xl p-6 border border-surface-variant shadow-sm space-y-6">
          <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant pb-2">
            {f.logisticsTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-body-lg text-body-lg font-bold text-on-surface" htmlFor="time">
                {f.timeAvailable.label}
              </label>
              <select
                id="time"
                value={form.timeAvailable}
                onChange={(e) => setForm((p) => ({ ...p, timeAvailable: e.target.value }))}
                className="w-full bg-surface-container-lowest border-2 border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0 outline-none appearance-none cursor-pointer"
              >
                {TIME_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block font-body-lg text-body-lg font-bold text-on-surface" htmlFor="budget">
                {f.budget.label}
              </label>
              <select
                id="budget"
                value={form.budget}
                onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
                className="w-full bg-surface-container-lowest border-2 border-outline-variant rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0 outline-none appearance-none cursor-pointer"
              >
                {BUDGET_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Submit */}
        <section className="pt-8 space-y-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-tertiary text-on-tertiary font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg py-5 px-8 rounded-xl shadow-[0_6px_0_0_#00531c] active:shadow-[0_0px_0_0_#00531c] active:translate-y-1.5 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            {submitting ? f.submitting : f.submit}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{f.or}</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          <button
            type="button"
            onClick={onScanMaterials}
            className="w-full bg-surface-container-lowest border-2 border-outline-variant text-on-surface-variant font-headline-md text-headline-md py-4 rounded-xl hover:border-primary hover:text-primary hover:bg-primary-fixed/20 transition-all flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              photo_camera
            </span>
            {f.scanMaterials}
          </button>
        </section>
      </form>
    </div>
  );
}
