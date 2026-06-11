import { ProjectCard } from './ProjectCard';

export function ProjectResults({
  language,
  projects,
  studentName,
  detectedMaterials = [],
  onSave,
  onComplete,
  onBack,
  onRegenerate,
  isSaved,
  isCompleted,
  isInProgress,
  onViewProject,
  onNavigateToCommunity,
}) {
  return (
    <div className="pt-24 pb-32 md:pb-16 px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto">
      {detectedMaterials.length > 0 && (
        <div className="mb-md bg-primary-fixed border border-primary-fixed-dim rounded-xl p-md flex items-start gap-sm">
          <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
          <div>
            <p className="font-label-caps text-label-caps text-primary uppercase mb-xs">Materials detected from your photo</p>
            <div className="flex flex-wrap gap-xs">
              {detectedMaterials.map((m, i) => (
                <span key={i} className="bg-surface-container-lowest text-on-surface font-body-md text-[14px] px-sm py-xs rounded-full border border-outline-variant">{m}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="text-center mb-xl">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-display md:text-display text-on-background mb-base">
          Success! Here are your custom STEM adventures,{' '}
          <span className="text-primary">{studentName}</span>.
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          We've mixed your interests to create {projects.length} unique maker-space challenges. Pick one to start building!
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mb-xl">
        {projects.map((project, i) => (
          <ProjectCard
            key={i}
            project={project}
            language={language}
            isSaved={isSaved(project)}
            isCompleted={isCompleted(project)}
            isInProgress={isInProgress(project)}
            onSave={onSave}
            onViewProject={onViewProject}
            onNavigateToCommunity={onNavigateToCommunity}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onRegenerate}
          className="bg-surface-variant text-on-surface-variant font-headline-md text-body-lg py-sm px-lg rounded-xl border-b-[3px] border-outline-variant hover:bg-surface-dim active:border-b-0 active:translate-y-[3px] transition-all flex items-center justify-center gap-sm"
        >
          <span className="material-symbols-outlined">autorenew</span>
          Generate New Ideas
        </button>
        <button
          onClick={onBack}
          className="bg-surface-container-lowest text-on-surface-variant font-body-md text-body-md py-sm px-lg rounded-xl border border-outline-variant hover:bg-surface-container transition-colors flex items-center justify-center gap-sm"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Form
        </button>
      </div>
    </div>
  );
}
