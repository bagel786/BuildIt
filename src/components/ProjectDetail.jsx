import { useState } from 'react';
import { translations, uiLang } from '../i18n/translations';
import { BuildMode } from './BuildMode';
import { ConceptExplainer } from './ConceptExplainer';
import { ReflectionFlow } from './ReflectionFlow';
import { ShareToGallery } from './ShareToGallery';
import { ProjectChat } from './ProjectChat';

const CATEGORY_STYLE = {
  science:     { bg: 'bg-primary-fixed-dim',  icon: 'science',      color: 'text-primary' },
  technology:  { bg: 'bg-primary-fixed',      icon: 'devices',      color: 'text-primary' },
  engineering: { bg: 'bg-surface-variant',    icon: 'engineering',  color: 'text-secondary' },
  math:        { bg: 'bg-secondary-fixed',    icon: 'calculate',    color: 'text-secondary' },
  art:         { bg: 'bg-tertiary-fixed-dim', icon: 'palette',      color: 'text-tertiary' },
};

const CHIP_COLOR = {
  science:     'bg-primary/10 text-primary border-primary/20',
  technology:  'bg-primary/10 text-primary border-primary/20',
  engineering: 'bg-surface-container text-on-surface-variant border-outline-variant',
  math:        'bg-secondary/10 text-secondary border-secondary/20',
  art:         'bg-tertiary/10 text-tertiary border-tertiary/20',
};

export function ProjectDetail({
  project,
  language,
  isSaved,
  isCompleted,
  isInProgress,
  onSave,
  onComplete,
  onBack,
  onNavigateToCommunity,
  studentName,
  onMarkStarted,
}) {
  const tr = translations[uiLang(language)];
  const d  = tr.detail;
  const c  = tr.card;

  const [liked, setLiked]           = useState(isSaved);
  const [buildOpen, setBuildOpen]   = useState(false);
  const [chatOpen, setChatOpen]     = useState(false);
  const [conceptOpen, setConceptOpen] = useState(null);
  const [reflectionData, setReflectionData] = useState(null);
  const [shareData, setShareData]   = useState(null);

  const style     = CATEGORY_STYLE[project.category] || CATEGORY_STYLE.science;
  const chipColor = CHIP_COLOR[project.category] || CHIP_COLOR.science;

  const handleSave = () => { setLiked(l => !l); onSave(project); };

  const handleStartBuild = () => {
    onMarkStarted?.(project.title);
    setBuildOpen(true);
  };

  const handleBuildComplete = (proj, photos, answers) => {
    setBuildOpen(false);
    onComplete(proj);
    setReflectionData({ project: proj, photos, initialAnswers: answers || null });
  };

  const handleShareToGallery = (proj, photos, reflection) => {
    setReflectionData(null);
    setShareData({ project: proj, photos, reflection });
  };

  const handlePosted = () => {
    setShareData(null);
    onNavigateToCommunity?.();
  };

  const stemConcepts = project.stemConcepts || [];
  const buildLabel = isCompleted
    ? d.buildAgain
    : isInProgress
    ? d.continueBuilding
    : d.startBuilding;

  return (
    <div className="min-h-screen bg-surface pb-32">
      {/* Sticky header */}
      <header className="bg-surface-container-lowest border-b border-outline-variant px-margin-mobile md:px-margin-desktop h-16 w-full fixed top-0 z-40 flex items-center gap-sm shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-xs text-on-surface-variant hover:text-on-surface transition-colors font-body-md text-[15px] font-bold"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          {d.back}
        </button>
        <div className="flex-1" />
        {/* Status badge */}
        {isCompleted && (
          <span className="bg-tertiary/10 text-tertiary font-label-caps text-label-caps px-sm py-xs rounded-full border border-tertiary/20">
            {d.completedBadge}
          </span>
        )}
        {isInProgress && !isCompleted && (
          <span className="bg-primary/10 text-primary font-label-caps text-label-caps px-sm py-xs rounded-full border border-primary/20">
            {d.inProgressBadge}
          </span>
        )}
        {/* Save */}
        <button onClick={handleSave} className="text-on-surface-variant hover:text-error transition-colors ml-sm">
          <span
            className={`material-symbols-outlined ${liked || isSaved ? 'text-error' : ''}`}
            style={{ fontVariationSettings: (liked || isSaved) ? "'FILL' 1" : "'FILL' 0" }}
          >favorite</span>
        </button>
      </header>

      {/* Hero */}
      <div className={`pt-16 ${style.bg} flex flex-col items-center justify-center py-xl relative overflow-hidden`}>
        <span
          className="material-symbols-outlined text-on-surface/10 text-[140px] mb-md"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >{style.icon}</span>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-md text-center">
          <div className="flex gap-xs mb-sm">
            <span className="bg-surface-container-lowest/90 backdrop-blur-sm text-primary font-label-caps text-label-caps px-sm py-xs rounded-full shadow-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">timer</span>
              {project.estimatedTime}
            </span>
            <span className="bg-surface-container-lowest/90 backdrop-blur-sm text-tertiary font-label-caps text-label-caps px-sm py-xs rounded-full shadow-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">payments</span>
              {project.estimatedCost}
            </span>
          </div>
          <h1 className="font-display text-[32px] md:text-display text-on-surface font-bold leading-tight mb-sm drop-shadow-sm">
            {project.title}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface/80 max-w-2xl">
            {project.hook}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-lg space-y-lg">

        {/* STEM Concepts */}
        {stemConcepts.length > 0 && (
          <section>
            <div className="flex items-center gap-sm mb-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">{d.stemConcepts}</h2>
              <span className="font-body-md text-[13px] text-on-surface-variant">{d.tapConceptHint}</span>
            </div>
            <div className="flex flex-wrap gap-xs">
              {stemConcepts.map((concept, i) => (
                <button
                  key={i}
                  onClick={() => setConceptOpen(concept)}
                  className={`font-body-md text-[14px] px-sm py-xs rounded-full border hover:scale-105 transition-all flex items-center gap-xs ${chipColor}`}
                >
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  {concept}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Materials */}
        <section>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>inventory</span>
            {d.materialsNeeded}
          </h2>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            {project.materials.map((material, i) => (
              <div key={i} className={`flex items-center gap-sm px-md py-sm ${i !== project.materials.length - 1 ? 'border-b border-outline-variant' : ''}`}>
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-label-caps text-[11px] text-primary font-bold">{i + 1}</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface">{material}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Shopping List */}
        {project.shoppingList?.length > 0 && (
          <section>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-sm flex items-center gap-sm">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
              {d.shoppingList}
            </h2>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              {/* Estimated total */}
              {(() => {
                const total = project.shoppingList.reduce((sum, item) => {
                  const n = parseFloat(item.estimatedCost?.replace(/[^0-9.]/g, '') || '0');
                  return sum + (isNaN(n) ? 0 : n);
                }, 0);
                return total > 0 ? (
                  <div className="flex items-center justify-between px-md py-sm bg-tertiary/5 border-b border-outline-variant">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{d.estimatedTotal}</span>
                    <span className="font-headline-md text-[16px] text-tertiary font-bold">~${total.toFixed(0)}</span>
                  </div>
                ) : null;
              })()}
              {project.shoppingList.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-sm px-md py-sm ${i !== project.shoppingList.length - 1 ? 'border-b border-outline-variant' : ''}`}
                >
                  <span className="material-symbols-outlined text-tertiary text-[20px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>sell</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-body-md text-on-surface truncate">{item.name}</p>
                    <p className="font-body-md text-[13px] text-on-surface-variant">{item.estimatedCost}</p>
                  </div>
                  <a
                    href={`https://www.amazon.com/s?k=${encodeURIComponent(item.searchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-none flex items-center gap-xs px-sm py-xs rounded-lg bg-[#FF9900]/10 text-[#B8600A] border border-[#FF9900]/30 hover:bg-[#FF9900]/20 transition-colors font-body-md text-[13px] font-bold whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    {d.buyOnAmazon}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Steps */}
        <section>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>format_list_numbered</span>
            {d.stepsTitle}
          </h2>
          <div className="space-y-sm">
            {project.steps.map((step, i) => {
              // Parse "Step N – Title: body" format if present
              const dashMatch = step.match(/^Step\s+\d+\s*[–-]\s*([^:]+):\s*([\s\S]+)$/i);
              const colonMatch = !dashMatch && step.match(/^Step\s+\d+[:.]\s*([\s\S]+)$/i);
              const stepTitle = dashMatch ? dashMatch[1].trim() : null;
              const stepBody  = dashMatch ? dashMatch[2].trim() : colonMatch ? colonMatch[1].trim() : step;

              return (
                <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                  {/* Step header */}
                  <div className="flex items-center gap-sm px-md py-sm bg-surface-container border-b border-outline-variant">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="font-headline-md text-[14px] text-on-primary font-bold">{i + 1}</span>
                    </div>
                    <p className="font-headline-md text-[16px] text-on-surface font-bold">
                      {stepTitle || `Step ${i + 1}`}
                    </p>
                  </div>
                  {/* Step body */}
                  <div className="px-md py-sm">
                    <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">{stepBody}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Level Up */}
        <section className="bg-tertiary/10 border border-tertiary/20 rounded-xl p-md flex items-start gap-sm">
          <span className="material-symbols-outlined text-tertiary text-[28px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <div>
            <p className="font-label-caps text-label-caps text-tertiary uppercase mb-xs">{d.levelUp}</p>
            <p className="font-body-lg text-body-lg text-on-surface">{project.levelUp}</p>
          </div>
        </section>

        {/* Tutorial */}
        {project.youtubeSearchQuery && (
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            <div className="flex items-center gap-sm px-md py-sm border-b border-outline-variant bg-surface-container">
              <span className="material-symbols-outlined text-[#FF0000] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_display</span>
              <div className="flex-1">
                <p className="font-headline-md text-[16px] text-on-surface font-bold">{d.watchTutorial}</p>
                <p className="font-body-md text-[12px] text-on-surface-variant">{d.tutorialHint}</p>
              </div>
            </div>
            <div className="px-md py-sm flex flex-col sm:flex-row gap-sm items-start sm:items-center justify-between">
              <p className="font-body-md text-[13px] text-on-surface-variant italic flex-1">{d.aiDisclaimer}</p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  language === 'es'
                    ? project.youtubeSearchQuery + ' en español para niños'
                    : project.youtubeSearchQuery + ' for kids tutorial'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-none flex items-center gap-xs px-md py-sm rounded-xl bg-[#FF0000]/10 text-[#CC0000] border border-[#FF0000]/20 hover:bg-[#FF0000]/20 transition-colors font-body-md font-bold text-[14px] whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                {d.watchTutorial}
              </a>
            </div>
          </section>
        )}
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface-container-lowest border-t border-outline-variant px-margin-mobile md:px-margin-desktop py-sm flex gap-sm items-center">
        <button
          onClick={() => setChatOpen(true)}
          className="flex-none px-md py-sm rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary transition-colors flex items-center gap-xs font-body-md font-bold"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          <span className="hidden sm:inline">{d.chat}</span>
        </button>
        <button
          onClick={handleStartBuild}
          className="flex-1 bg-primary text-on-primary font-headline-md text-headline-md py-sm rounded-xl border-b-[3px] border-primary-fixed-dim hover:bg-primary-container active:border-b-0 active:translate-y-[3px] transition-all flex items-center justify-center gap-sm"
        >
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isCompleted ? 'replay' : isInProgress ? 'play_arrow' : 'rocket_launch'}
          </span>
          {buildLabel}
        </button>
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
      {buildOpen && (
        <BuildMode
          project={project}
          language={language}
          studentName={studentName}
          onComplete={handleBuildComplete}
          onClose={() => setBuildOpen(false)}
          onViewGallery={() => { setBuildOpen(false); onNavigateToCommunity?.(); }}
        />
      )}
      {reflectionData && (
        <ReflectionFlow
          project={reflectionData.project}
          buildPhotos={reflectionData.photos}
          language={language}
          initialAnswers={reflectionData.initialAnswers}
          onDone={() => setReflectionData(null)}
          onShareToGallery={handleShareToGallery}
        />
      )}
      {shareData && (
        <ShareToGallery
          project={shareData.project}
          defaultPhoto={
            shareData.photos && Object.values(shareData.photos).length > 0
              ? Object.values(shareData.photos)[Object.values(shareData.photos).length - 1]
              : null
          }
          language={language}
          onPosted={handlePosted}
          onClose={() => setShareData(null)}
        />
      )}
    </div>
  );
}
