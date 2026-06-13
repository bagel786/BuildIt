import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { IntakeForm } from './components/IntakeForm';
import { LoadingState } from './components/LoadingState';
import { ProjectResults } from './components/ProjectResults';
import { SavedProjects } from './components/SavedProjects';
import { MaterialsScanner } from './components/MaterialsScanner';
import { Community } from './components/Community';
import { ProjectDetail } from './components/ProjectDetail';
import { generateProjects, translateProjects } from './services/groqService';
import { translations, uiLang } from './i18n/translations';

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [view, setView] = useState('form'); // 'form'|'loading'|'results'|'saved'|'community'|'project-detail'|'translating'
  const [language, setLanguage] = useState(() => {
    const stored = loadJson('buildit-lang', 'English');
    // migrate old 'en'/'es' codes
    if (stored === 'en') return 'English';
    if (stored === 'es') return 'Spanish';
    return stored;
  });
  const [studentLanguage, setStudentLanguage] = useState(null); // student's original typed preference
  const [projectsLanguage, setProjectsLanguage] = useState(null);
  const didMount = useRef(false);
  const [studentData, setStudentData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [detectedMaterials, setDetectedMaterials] = useState([]);
  const [error, setError] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [savedProjects, setSavedProjects] = useState(() => loadJson('buildit-saved', []));
  const [completedTitles, setCompletedTitles] = useState(() => loadJson('buildit-completed', []));
  const [inProgressTitles, setInProgressTitles] = useState(() => loadJson('buildit-inprogress', []));

  const [activeProject, setActiveProject] = useState(null);
  const [detailReturnView, setDetailReturnView] = useState('results');

  useEffect(() => { localStorage.setItem('buildit-saved', JSON.stringify(savedProjects)); }, [savedProjects]);
  useEffect(() => { localStorage.setItem('buildit-completed', JSON.stringify(completedTitles)); }, [completedTitles]);
  useEffect(() => { localStorage.setItem('buildit-inprogress', JSON.stringify(inProgressTitles)); }, [inProgressTitles]);
  useEffect(() => { localStorage.setItem('buildit-lang', JSON.stringify(language)); }, [language]);
  useEffect(() => {
    if (studentData) localStorage.setItem('buildit-student-profile', JSON.stringify(studentData));
  }, [studentData]);

  // Translate the existing projects in place when language is toggled
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    if (!projects.length) return;
    if (language === projectsLanguage) return;
    const wasDetail = view === 'project-detail';
    const returnView = wasDetail ? detailReturnView : view;
    const activeId = activeProject?.id;
    setView('translating');
    translateProjects(projects, language)
      .then((result) => {
        setProjects(result);
        setProjectsLanguage(language);
        const nextActive = activeId ? result.find((p) => p.id === activeId) : null;
        setActiveProject(nextActive || null);
        if (wasDetail && nextActive) {
          setView('project-detail');
        } else {
          setView(['results', 'translating'].includes(returnView) ? 'results' : returnView);
        }
      })
      .catch(() => setView(wasDetail ? 'project-detail' : returnView === 'translating' ? 'results' : returnView));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Projects generated before ids existed (old localStorage data) fall back to title
  const projectKey = (p) => p.id || p.title;
  const sameProject = (a, b) => (a.id && b.id ? a.id === b.id : a.title === b.title);

  const handleSubmit = async (formData) => {
    setStudentData(formData);
    setStudentLanguage(language); // lock in this student's preference
    setError(null);
    setView('loading');

    try {
      const result = await generateProjects(
        { ...formData, completedCount: completedTitles.length },
        language,
      );
      setProjects(result);
      setProjectsLanguage(language);
      setView('results');
    } catch (err) {
      setError(err);
      setView('form');
    }
  };

  const handleRegenerate = () => {
    if (studentData) handleSubmit(studentData);
  };

  const handleSaveProject = (project) => {
    setSavedProjects((prev) => {
      const already = prev.some((p) => sameProject(p, project));
      return already
        ? prev.filter((p) => !sameProject(p, project))
        : [...prev, { ...project, savedAt: Date.now() }];
    });
  };

  const handleMarkComplete = (project) => {
    setCompletedTitles((prev) => {
      const key = projectKey(project);
      if (prev.includes(key)) return prev;
      return [...prev, key];
    });
  };

  const handleMarkStarted = (project) => {
    setInProgressTitles((prev) => {
      const key = projectKey(project);
      if (prev.includes(key)) return prev;
      return [...prev, key];
    });
  };

  const handleViewProject = (project, returnView) => {
    setActiveProject(project);
    setDetailReturnView(returnView || (view === 'saved' ? 'saved' : 'results'));
    setView('project-detail');
  };

  const handleDetailBack = () => {
    setActiveProject(null);
    setView(detailReturnView);
  };

  const isSaved = (project) => savedProjects.some((p) => sameProject(p, project));
  const isCompleted = (project) => completedTitles.includes(projectKey(project)) || completedTitles.includes(project.title);
  const isInProgress = (project) => inProgressTitles.includes(projectKey(project)) || inProgressTitles.includes(project.title);

  const toggleLanguage = () => {
    const next = language === 'English' ? (studentLanguage || 'English') : 'English';
    if (next !== language) setLanguage(next);
  };

  const sharedCardProps = {
    onSave: handleSaveProject,
    onComplete: handleMarkComplete,
    isSaved,
    isCompleted,
    isInProgress,
    onViewProject: handleViewProject,
    onNavigateToCommunity: () => setView('community'),
    studentName: studentData?.name || '',
  };

  const tr = translations[uiLang(language)];
  const navItems = [
    { target: 'form',      icon: 'explore',     label: tr.nav.discover    },
    { target: 'saved',     icon: 'inventory_2', label: tr.nav.myProjects  },
    { target: 'community', icon: 'groups',      label: tr.nav.gallery     },
  ];

  const activeNav = ['results', 'loading', 'translating'].includes(view) ? 'form' : view;
  const hideGlobalChrome = view === 'community' || view === 'project-detail';

  return (
    <div className="min-h-screen bg-surface">
      {!hideGlobalChrome && (
        <Header
          language={language}
          studentLanguage={studentLanguage}
          onToggleLanguage={toggleLanguage}
          view={['loading', 'translating'].includes(view) ? 'form' : view}
          onNavigate={setView}
          savedCount={savedProjects.length}
        />
      )}

      {view === 'form' && (
        <IntakeForm
          language={language}
          onLanguageChange={setLanguage}
          onSubmit={handleSubmit}
          error={error}
          onScanMaterials={() => setScannerOpen(true)}
        />
      )}

      {scannerOpen && (
        <MaterialsScanner
          studentData={studentData}
          language={language}
          onClose={() => setScannerOpen(false)}
          onProjectsGenerated={({ projects: p, detectedMaterials: dm }) => {
            setProjects(p);
            setDetectedMaterials(dm || []);
            setScannerOpen(false);
            setView('results');
          }}
        />
      )}

      {(view === 'loading' || view === 'translating') && (
        <LoadingState language={uiLang(language)} />
      )}

      {view === 'results' && (
        <ProjectResults
          language={language}
          projects={projects}
          studentName={studentData?.name}
          detectedMaterials={detectedMaterials}
          onBack={() => { setView('form'); setDetectedMaterials([]); }}
          onRegenerate={handleRegenerate}
          {...sharedCardProps}
        />
      )}

      {view === 'saved' && (
        <SavedProjects
          language={language}
          projects={savedProjects}
          onNavigate={setView}
          {...sharedCardProps}
        />
      )}

      {view === 'community' && (
        <Community
          language={language}
          studentData={studentData}
          onBack={() => setView('form')}
          onNavigate={setView}
        />
      )}

      {view === 'project-detail' && activeProject && (
        <ProjectDetail
          project={activeProject}
          language={language}
          isSaved={isSaved(activeProject)}
          isCompleted={isCompleted(activeProject)}
          isInProgress={isInProgress(activeProject)}
          onSave={handleSaveProject}
          onComplete={handleMarkComplete}
          onBack={handleDetailBack}
          onMarkStarted={handleMarkStarted}
          onNavigateToCommunity={() => setView('community')}
          studentName={studentData?.name || ''}
        />
      )}

      {/* Mobile Bottom Nav — hidden on community and project-detail (they have their own) */}
      {!hideGlobalChrome && (
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-surface-container rounded-t-xl shadow-[0px_-4px_20px_rgba(0,0,0,0.05)]">
          {navItems.map(({ target, icon, label }) => {
            const active = activeNav === target;
            return (
              <button
                key={target}
                onClick={() => setView(target)}
                className={`flex flex-col items-center justify-center transition-all ${
                  active
                    ? 'bg-primary-container text-on-primary-container rounded-full px-4 py-1.5 scale-110'
                    : 'text-on-surface-variant opacity-70 hover:opacity-100'
                }`}
              >
                <span
                  className="material-symbols-outlined mb-1"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
                <span className="font-label-caps text-label-caps uppercase">
                  {label}
                  {target === 'saved' && savedProjects.length > 0 && ` (${savedProjects.length})`}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
