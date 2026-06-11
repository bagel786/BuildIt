import { useState, useEffect, useCallback } from 'react';
import { fetchPosts } from '../services/communityService';
import { PostCard } from './PostCard';
import { ShareToGallery } from './ShareToGallery';
import { translations, uiLang } from '../i18n/translations';

const FILTERS = (tr) => [
  { key: 'all',         label: tr.community.filterAll },
  { key: 'engineering', label: tr.community.filterEngineering },
  { key: 'science',     label: tr.community.filterScience },
  { key: 'technology',  label: tr.community.filterTechnology },
  { key: 'math',        label: tr.community.filterMath },
  { key: 'art',         label: tr.community.filterArt },
];

export function Community({ language, onBack, onNavigate }) {
  const tr = translations[uiLang(language)];
  const [posts, setPosts]         = useState([]);
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async (cat) => {
    setLoading(true);
    try {
      const data = await fetchPosts(cat);
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filter); }, [filter, refreshKey, load]);

  const displayed = posts.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.projectTitle?.toLowerCase().includes(q) ||
      p.studentName?.toLowerCase().includes(q) ||
      p.caption?.toLowerCase().includes(q)
    );
  });

  const handlePosted = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShareOpen(false);
  };

  const handleLikeUpdate = (updatedPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? { ...p, likes: updatedPost.likes } : p));
  };

  const topPost = displayed.reduce((best, p) => (!best || p.likes > best.likes) ? p : best, null);
  const filters = FILTERS(tr);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top App Bar */}
      <header className="bg-surface shadow-sm flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 w-full fixed top-0 z-50 border-b border-surface-variant">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-headline-md" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
          <span className="font-headline-md text-headline-md font-bold text-primary">BuildIt</span>
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-lg">
          <button onClick={onBack} className="font-body-md text-body-md text-on-surface-variant hover:bg-surface-container transition-colors px-4 py-2 rounded-full">
            {tr.community.navDiscover}
          </button>
          <button onClick={() => onNavigate?.('saved')} className="font-body-md text-body-md text-on-surface-variant hover:bg-surface-container transition-colors px-4 py-2 rounded-full">
            {tr.community.navMyProjects}
          </button>
          <button className="font-body-md text-body-md font-bold text-primary px-4 py-2 rounded-full bg-primary-container/20">
            {tr.community.navGallery}
          </button>
        </nav>
      </header>

      {/* Main */}
      <main className="w-full max-w-[1200px] mx-auto pt-[80px] pb-[100px] md:pb-[80px] px-margin-mobile md:px-margin-desktop min-h-screen">

        {/* Page header + AI badge */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-xl mt-md">
          <div>
            <h1 className="font-display text-display text-on-surface mb-xs">{tr.community.title}</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">{tr.community.subtitle}</p>
          </div>
          <div className="flex items-center gap-sm bg-tertiary-container text-on-tertiary-container px-4 py-3 rounded-xl shadow-sm border border-tertiary/20 max-w-xs">
            <span className="material-symbols-outlined flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            <p className="font-body-md text-[14px] font-bold">{tr.community.aiModeration}</p>
          </div>
        </section>

        {/* Search + Filters */}
        <section className="bg-surface-container-lowest border-2 border-outline-variant rounded-xl p-md mb-xl flex flex-col md:flex-row gap-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex-1 flex items-center gap-sm bg-surface-container rounded-lg px-4 py-3 border-2 border-transparent focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-outline">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={tr.community.searchPlaceholder}
              className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline p-0 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-outline hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-sm">
            <span className="font-label-caps text-label-caps text-on-surface-variant">{tr.community.filtersLabel}</span>
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`font-label-caps text-label-caps px-4 py-2 rounded-full border transition-all hover:scale-[1.02] ${
                  filter === f.key
                    ? 'bg-primary-container text-on-primary-container border-primary/20'
                    : 'bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* States */}
        {loading && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface-container animate-pulse rounded-xl h-72" />
            ))}
          </section>
        )}

        {!loading && displayed.length === 0 && (
          <div className="text-center py-xl flex flex-col items-center gap-md">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant">groups</span>
            </div>
            <div>
              <p className="font-headline-md text-headline-md text-on-surface mb-xs">{tr.community.noBuilds}</p>
              <p className="font-body-md text-body-md text-on-surface-variant">{tr.community.noBuildsSubtitle}</p>
            </div>
            <button
              onClick={() => setShareOpen(true)}
              className="bg-tertiary text-on-tertiary px-lg py-sm rounded-xl font-headline-md text-headline-md shadow-[0_4px_0_0_#00531c] active:shadow-none active:translate-y-1 transition-all flex items-center gap-sm"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              {tr.community.shareFirstCTA}
            </button>
          </div>
        )}

        {!loading && displayed.length > 0 && (
          <>
            {/* Spotlight: most loved */}
            {filter === 'all' && !search && topPost && topPost.likes >= 5 && (
              <div className="mb-lg">
                <div className="flex items-center gap-xs mb-sm">
                  <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                  <p className="font-label-caps text-label-caps text-secondary uppercase">{tr.community.mostLoved}</p>
                </div>
                <div className="max-w-sm">
                  <PostCard post={topPost} language={language} onLikeUpdate={handleLikeUpdate} />
                </div>
              </div>
            )}

            {filter === 'all' && !search && topPost?.likes >= 5 && (
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-sm">{tr.community.allBuilds}</p>
            )}

            {/* Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {displayed
                .filter(p => !(filter === 'all' && !search && topPost?.likes >= 5 && p.id === topPost?.id))
                .map(post => (
                  <PostCard key={post.id} post={post} language={language} onLikeUpdate={handleLikeUpdate} />
                ))}
            </section>

            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="w-full mt-lg py-sm border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant font-body-md text-[14px] hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              {tr.community.refresh}
            </button>
          </>
        )}
      </main>

      {/* Floating share FAB */}
      <div className="fixed bottom-20 right-margin-mobile md:right-margin-desktop z-20">
        <button
          onClick={() => setShareOpen(true)}
          className="w-14 h-14 rounded-full bg-tertiary text-on-tertiary shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          title={tr.community.shareCTA}
        >
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        </button>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden bg-surface-container shadow-[0px_-4px_20px_rgba(0,0,0,0.05)] fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 rounded-t-xl">
        <button onClick={onBack} className="flex flex-col items-center justify-center text-on-surface-variant opacity-70 hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined mb-1">explore</span>
          <span className="font-label-caps text-label-caps uppercase">{tr.community.navDiscover}</span>
        </button>
        <button onClick={() => onNavigate?.('saved')} className="flex flex-col items-center justify-center text-on-surface-variant opacity-70 hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined mb-1">inventory_2</span>
          <span className="font-label-caps text-label-caps uppercase">{tr.community.navMyProjects}</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1.5 scale-110">
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          <span className="font-label-caps text-label-caps uppercase">{tr.community.navGallery}</span>
        </button>
      </nav>

      {shareOpen && (
        <ShareToGallery
          project={null}
          defaultPhoto={null}
          language={language}
          onPosted={handlePosted}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
