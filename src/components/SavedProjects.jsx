import { translations, uiLang } from '../i18n/translations';
import { ProjectCard } from './ProjectCard';

export function SavedProjects({
  language,
  projects,
  onSave,
  onComplete,
  onNavigate,
  isSaved,
  isCompleted,
  isInProgress,
  onViewProject,
  onNavigateToCommunity,
  studentName,
}) {
  const tr = translations[uiLang(language)];
  const s = tr.saved;

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{s.title}</h2>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
          <div className="text-7xl">📚</div>
          <p className="text-gray-500 text-lg max-w-sm">{s.empty}</p>
          <button
            onClick={() => onNavigate('form')}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            {s.goGenerate}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard
              key={`${project.title}-${i}`}
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
      )}
    </div>
  );
}
