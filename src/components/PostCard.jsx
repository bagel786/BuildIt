import { useState } from 'react';
import { toggleLike } from '../services/communityService';
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
  science:     { icon: 'science',    color: 'text-primary' },
  technology:  { icon: 'memory',     color: 'text-primary' },
  engineering: { icon: 'build',      color: 'text-tertiary' },
  math:        { icon: 'calculate',  color: 'text-secondary' },
  art:         { icon: 'palette',    color: 'text-tertiary' },
};

const PLACEHOLDER_BG = {
  science:     'bg-primary-fixed',
  technology:  'bg-primary-fixed',
  engineering: 'bg-surface-variant',
  math:        'bg-secondary-fixed',
  art:         'bg-tertiary-fixed-dim',
};

function timeAgo(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function PostCard({ post, language = 'en', onLikeUpdate }) {
  const tr = translations[uiLang(language)];
  const style = CATEGORY_STYLES[post.category] || CATEGORY_STYLES.science;
  const placeholderBg = PLACEHOLDER_BG[post.category] || PLACEHOLDER_BG.science;

  const [optimisticLikes, setOptimisticLikes] = useState(post.likes);
  const [liked, setLiked] = useState(post.likedBy?.includes(SESSION_ID));
  const [tapping, setTapping] = useState(false);

  const handleLike = async () => {
    if (tapping) return;
    setTapping(true);
    const next = !liked;
    setLiked(next);
    setOptimisticLikes(n => next ? n + 1 : n - 1);
    try {
      const updated = await toggleLike(post.id, SESSION_ID);
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

  return (
    <article className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col group">
      {/* Photo — 4:3 aspect */}
      <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden">
        {post.photo ? (
          <img
            src={post.photo}
            alt={post.projectTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${placeholderBg}`}>
            <span
              className={`material-symbols-outlined text-[64px] opacity-20 ${style.color}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {style.icon}
            </span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-sm right-sm bg-surface-container-lowest/90 backdrop-blur-sm px-3 py-1 rounded-full border border-surface-variant flex items-center gap-xs shadow-sm">
          <span className={`material-symbols-outlined text-[16px] ${style.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {style.icon}
          </span>
          <span className="font-label-caps text-label-caps text-on-surface capitalize">
            {tr.categories?.[post.category] || post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-md flex flex-col gap-xs">
        <h3 className="font-headline-md text-headline-md text-on-surface line-clamp-1">
          {post.projectTitle}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 flex-1">
          {post.caption}
        </p>

        {/* Footer: author + time + like */}
        <div className="flex items-center justify-between mt-xs">
          <div>
            <p className="font-body-md text-[13px] text-on-surface font-bold">{post.studentName}</p>
            <p className="font-body-md text-[11px] text-on-surface-variant">{timeAgo(post.createdAt)}</p>
          </div>

          <button
            onClick={handleLike}
            disabled={tapping}
            className={`flex items-center gap-xs transition-colors p-2 rounded-full hover:bg-error/5 ${
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
        </div>
      </div>
    </article>
  );
}
