import { useState } from 'react';
import { translations, uiLang } from '../i18n/translations';
import { ProjectChat } from './ProjectChat';
import { ConceptExplainer } from './ConceptExplainer';

const CATEGORY_STYLE = {
  science:     { bg: 'bg-primary-fixed-dim',    icon: 'science' },
  technology:  { bg: 'bg-primary-fixed',        icon: 'devices' },
  engineering: { bg: 'bg-surface-variant',      icon: 'engineering' },
  math:        { bg: 'bg-secondary-fixed',      icon: 'calculate' },
  art:         { bg: 'bg-tertiary-fixed-dim',   icon: 'palette' },
};

const MATERIAL_CHIP_COLOR = {
  science:     'bg-primary/10 text-primary',
  technology:  'bg-primary/10 text-primary',
  engineering: 'bg-surface-container text-on-surface-variant',
  math:        'bg-secondary/10 text-secondary',
  art:         'bg-tertiary/10 text-tertiary',
};

export function ProjectCard({
  project,
  language,
  isSaved,
  isCompleted,
  isInProgress,
  onSave,
  onViewProject,
  onNavigateToCommunity,
}) {
  const tr = translations[uiLang(language)];
  const c = tr.card;

  const [liked, setLiked] = useState(isSaved);
  const [chatOpen, setChatOpen] = useState(false);
  const [conceptOpen, setConceptOpen] = useState(null);

  const style = CATEGORY_STYLE[project.category] || CATEGORY_STYLE.science;
  const chipColor = MATERIAL_CHIP_COLOR[project.category] || MATERIAL_CHIP_COLOR.science;

  const handleSave = () => {
    setLiked(l => !l);
    onSave(project);
  };

  const stemConcepts = project.stemConcepts || [];

  const buttonLabel = isCompleted
    ? c.buildAgain || 'Build Again'
    : isInProgress
    ? c.continueBuilding
    : c.startNow;

  const buttonIcon = isCompleted ? 'replay' : isInProgress ? 'play_arrow' : 'rocket_launch';

  return (
    <article className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-md flex flex-col">
      {/* Header Area */}
      <div className={`h-48 relative ${style.bg} flex items-center justify-center overflow-hidden`}>
        <span
          className="material-symbols-outlined text-on-surface/20 text-[96px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {style.icon}
        </span>
        {isCompleted && (
          <div className="absolute inset-0 bg-tertiary/10 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-tertiary text-[64px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              task_alt
            </span>
          </div>
        )}
        {/* In-progress badge */}
        {isInProgress && !isCompleted && (
          <div className="absolute top-sm left-sm">
            <span className="bg-primary/90 text-on-primary font-label-caps text-label-caps px-sm py-xs rounded-full shadow-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
              {c.inProgress}
            </span>
          </div>
        )}
        {/* Time + cost badges */}
        <div className="absolute top-sm right-sm flex gap-xs">
          <span className="bg-surface-container-lowest text-primary font-label-caps text-label-caps px-sm py-xs rounded-full shadow-sm flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px]">timer</span>
            {project.estimatedTime}
          </span>
          <span className="bg-surface-container-lowest text-tertiary font-label-caps text-label-caps px-sm py-xs rounded-full shadow-sm flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px]">payments</span>
            {project.estimatedCost}
          </span>
        </div>
      </div>

      <div className="p-md flex flex-col flex-grow">
        {/* Title + Heart */}
        <div className="flex justify-between items-start mb-base">
          <h2 className="font-headline-md text-headline-md text-on-background flex-1 pr-2">
            {project.title}
          </h2>
          <button
            aria-label="Save Project"
            onClick={handleSave}
            className="text-on-surface-variant hover:text-error transition-colors flex-shrink-0"
          >
            <span
              className={`material-symbols-outlined transition-colors ${liked || isSaved ? 'text-error' : ''}`}
              style={{ fontVariationSettings: (liked || isSaved) ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>

        {/* Hook */}
        <p className="font-body-md text-body-md text-on-surface-variant mb-md flex-grow">
          {project.hook}
        </p>

        {/* STEM Concept chips */}
        {stemConcepts.length > 0 && (
          <div className="mb-md">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-xs uppercase flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">science</span>
              STEM Concepts
            </h3>
            <div className="flex flex-wrap gap-xs">
              {stemConcepts.map((concept, i) => (
                <button
                  key={i}
                  onClick={() => setConceptOpen(concept)}
                  className="font-body-md text-[13px] px-sm py-xs rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[13px]">info</span>
                  {concept}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Materials preview */}
        <div className="mb-md">
          <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-xs uppercase">
            Materials
          </h3>
          <ul className="flex flex-wrap gap-xs">
            {project.materials.slice(0, 4).map((m, i) => (
              <li key={i} className={`font-body-md text-[14px] px-sm py-xs rounded-lg ${chipColor}`}>
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onViewProject(project)}
            className="flex-1 bg-primary text-on-primary font-headline-md text-[18px] py-sm rounded-lg border-b-[3px] border-primary-fixed-dim hover:bg-primary-container active:border-b-0 active:translate-y-[3px] transition-all flex items-center justify-center gap-xs"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {buttonIcon}
            </span>
            {buttonLabel}
          </button>
          <button
            onClick={() => setChatOpen(true)}
            aria-label="Get help"
            className="px-sm py-sm rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
            title="Ask AI mentor for help"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </button>
        </div>
      </div>

      {/* Overlays */}
      {chatOpen && (
        <ProjectChat project={project} language={language} onClose={() => setChatOpen(false)} />
      )}
      {conceptOpen && (
        <ConceptExplainer
          concept={conceptOpen}
          grade={project.gradeLevel}
          language={language}
          onClose={() => setConceptOpen(null)}
        />
      )}
    </article>
  );
}
