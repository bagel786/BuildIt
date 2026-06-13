import { useState } from 'react';
import { toggleIdeaLike, updateIdeaProjectData } from '../services/communityService';
import { generateIdeaProject } from '../services/groqService';
import { ProjectDetailsSheet } from './ProjectDetailsSheet';
import { translations, uiLang } from '../i18n/translations';

const SESSION_ID = (() => {
  try {
    if (!localStorage.getItem('buildit-session')) {
      localStorage.setItem('buildit-session', `session-${Math.random().toString(36).slice(2)}`);
    }
    return localStorage.getItem('buildit-session');
  } catch {
    return `session-${Math.random().toString(36).slice(2)}`;
  }
})();

const CATEGORY_STYLES = {
  science:     { icon: 'science',   iconColor: 'text-primary',   bannerBg: 'bg-primary-container',   badgeBg: 'bg-primary-container',   badgeText: 'text-on-primary-container' },
  technology:  { icon: 'memory',    iconColor: 'text-primary',   bannerBg: 'bg-primary-container',   badgeBg: 'bg-primary-container',   badgeText: 'text-on-primary-container' },
  engineering: { icon: 'build',     iconColor: 'text-tertiary',  bannerBg: 'bg-tertiary-container',  badgeBg: 'bg-tertiary-container',  badgeText: 'text-on-tertiary-container' },
  math:        { icon: 'calculate', iconColor: 'text-secondary', bannerBg: 'bg-secondary-container', badgeBg: 'bg-secondary-container', badgeText: 'text-on-secondary-container' },
  art:         { icon: 'palette',   iconColor: 'text-tertiary',  bannerBg: 'bg-tertiary-container',  badgeBg: 'bg-tertiary-container',  badgeText: 'text-on-tertiary-container' },
};

function timeAgo(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function IdeaCard({ idea, language = 'en', studentData, onLikeUpdate }) {
  const tr = translations[uiLang(language)];
  const style = CATEGORY_STYLES[idea.category] || CATEGORY_STYLES.science;

  const [optimisticLikes, setOptimisticLikes] = useState(idea.likes);
  const [liked, setLiked] = useState(idea.likedBy?.includes(SESSION_ID));
  const [tapping, setTapping] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(false);
  // local copy so the card updates immediately after generation without parent re-render
  const [localProject, setLocalProject] = useState(idea.projectData || null);

  const hasProject = !!localProject;

  const handleLike = async () => {
    if (tapping) return;
    setTapping(true);
    const next = !liked;
    setLiked(next);
    setOptimisticLikes(n => next ? n + 1 : n - 1);
    try {
      const updated = await toggleIdeaLike(idea.id, SESSION_ID);
      if (updated) {
        setOptimisticLikes(updated.likes);
        onLikeUpdate?.(updated);
      }
    } catch {
      setLiked(!next);
      setOptimisticLikes(n => next ? n - 1 : n + 1);
    } finally {
      setTapping(false);
    }
  };

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    setGenerateError(false);
    try {
      const generated = await generateIdeaProject(
        idea.ideaDescription || idea.ideaTitle,
        studentData || { grade: '68', budget: 'low' },
        language
      );
      setLocalProject(generated);
      updateIdeaProjectData(idea.id, generated);
      setDetailsOpen(true);
    } catch {
      setGenerateError(true);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <article className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col group">
        {/* Category banner */}
        <div className={`${style.bannerBg} px-md py-lg flex flex-col items-center justify-center gap-xs relative`}>
          <span
            className={`material-symbols-outlined text-[52px] opacity-60 ${style.iconColor}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {style.icon}
          </span>
          <div className="flex items-center gap-xs opacity-60">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
              {tr.community?.ideasTab || 'Project Idea'}
            </span>
          </div>
          {hasProject && (
            <div className="absolute top-sm right-sm bg-secondary/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-xs shadow-sm">
              <span className="material-symbols-outlined text-on-secondary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="font-label-caps text-label-caps text-on-secondary text-[10px] uppercase">AI Project</span>
            </div>
          )}
        </div>

        {/* Category badge */}
        <div className="px-md pt-md">
          <span className={`inline-flex items-center gap-xs px-sm py-xs rounded-full ${style.badgeBg} ${style.badgeText} font-label-caps text-[11px] capitalize`}>
            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>{style.icon}</span>
            {tr.categories?.[idea.category] || idea.category}
          </span>
        </div>

        {/* Content */}
        <div className="px-md pb-md pt-sm flex-1 flex flex-col">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-xs line-clamp-2">
            {idea.ideaTitle}
          </h3>

          <p className={`font-body-md text-body-md text-on-surface-variant mb-xs flex-1 ${expanded ? '' : 'line-clamp-3'}`}>
            {hasProject ? localProject.hook : idea.ideaDescription}
          </p>

          {expanded && hasProject && idea.ideaDescription && (
            <div className="mb-sm p-sm bg-surface-container rounded-lg border-l-2 border-secondary">
              <p className="font-label-caps text-label-caps text-secondary uppercase mb-xs">Original idea</p>
              <p className="font-body-md text-[13px] text-on-surface-variant italic">{idea.ideaDescription}</p>
            </div>
          )}

          {generateError && (
            <p className="font-body-md text-[12px] text-error mb-xs">Could not generate — make sure the server is running and try again.</p>
          )}

          <div className="mb-md" />

          {/* Like + action buttons */}
          <div className="flex items-center justify-between mt-auto gap-xs">
            <button
              onClick={handleLike}
              disabled={tapping}
              className={`flex items-center gap-xs transition-colors p-2 -ml-2 rounded-full hover:bg-error/5 ${
                liked ? 'text-error' : 'text-outline hover:text-error'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
              <span className="font-body-md text-body-md font-bold">{optimisticLikes}</span>
            </button>

            <div className="flex items-center gap-xs">
              {/* Generate button — shown when no project data yet */}
              {!hasProject && (
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-secondary text-on-secondary font-label-caps text-label-caps px-3 py-2 rounded-lg border-b-4 border-[#5e35b1] active:border-b-0 active:translate-y-[4px] hover:brightness-110 transition-all flex items-center gap-xs disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      Generate
                    </>
                  )}
                </button>
              )}

              {/* See Project button — shown after project exists */}
              {hasProject && (
                <button
                  onClick={() => setDetailsOpen(true)}
                  className="bg-secondary text-on-secondary font-label-caps text-label-caps px-3 py-2 rounded-lg border-b-4 border-[#5e35b1] active:border-b-0 active:translate-y-[4px] hover:brightness-110 transition-all flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">checklist</span>
                  {tr.community?.seeProjectBtn || 'See Project'}
                </button>
              )}

              <button
                onClick={() => setExpanded(e => !e)}
                className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps px-3 py-2 rounded-lg border-2 border-outline-variant hover:border-primary hover:text-primary transition-all flex items-center gap-xs"
              >
                {expanded ? tr.card?.showLess || 'Less' : tr.community?.ideaReadMore || 'Read More'}
                <span className="material-symbols-outlined text-[16px]">
                  {expanded ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>
          </div>

          {expanded && (
            <div className="mt-sm pt-sm border-t border-outline-variant flex items-center justify-between">
              <p className="font-body-md text-[13px] text-on-surface font-bold">{idea.studentName}</p>
              <p className="font-body-md text-[12px] text-on-surface-variant">{timeAgo(idea.createdAt)}</p>
            </div>
          )}
        </div>
      </article>

      {detailsOpen && localProject && (
        <ProjectDetailsSheet
          title={idea.ideaTitle}
          projectData={localProject}
          language={language}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </>
  );
}
