import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Bookmark, Check } from 'lucide-react';
import { getPosterUrl } from '../../api/tmdb';
import { watchlistAPI } from '../../api/watchlist';
import { useProfile } from '../../context/ProfileContext';
import { useToast } from '../common/Toast';

/* ── Shared watchlist hook ─────────────────────────────────────── */

function useWatchlistToggle(item) {
  const { activeProfile } = useProfile();
  const { addToast } = useToast();
  const [inList, setInList] = useState(false);
  const [busy, setBusy] = useState(false);
  const checkedRef = useRef(false);

  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const tmdbId = item.id;

  useEffect(() => {
    // Reset when item changes
    checkedRef.current = false;
    setInList(false);
  }, [tmdbId]);

  const checkOnHover = async () => {
    if (checkedRef.current || !activeProfile) return;
    checkedRef.current = true;
    try {
      const res = await watchlistAPI.check(activeProfile.id, tmdbId);
      setInList(res.data.in_watchlist);
    } catch {}
  };

  const toggle = async (e) => {
    e.stopPropagation();
    if (!activeProfile || busy) return;
    setBusy(true);
    try {
      if (inList) {
        await watchlistAPI.remove(activeProfile.id, tmdbId);
        setInList(false);
        addToast('Removed from My List', 'info');
      } else {
        await watchlistAPI.add(activeProfile.id, {
          tmdb_id: tmdbId,
          media_type: mediaType,
          title: item.title || item.name || '',
          poster_path: item.poster_path || null,
        });
        setInList(true);
        addToast('Added to My List', 'success');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail === 'Already in watchlist'
          ? 'Already in your list'
          : 'Something went wrong';
      if (err?.response?.data?.detail === 'Already in watchlist') {
        setInList(true);
      }
      addToast(msg, 'error');
    } finally {
      setBusy(false);
    }
  };

  return { inList, busy, toggle, checkOnHover };
}

/* ── Bookmark button component ─────────────────────────────────── */

function WatchlistButton({ inList, busy, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      title={inList ? 'Remove from My List' : 'Add to My List'}
      aria-label={inList ? 'Remove from My List' : 'Add to My List'}
      className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer focus-ring"
      style={{
        background: inList ? 'var(--c-accent)' : 'rgba(0, 0, 0, 0.65)',
        backdropFilter: inList ? 'none' : 'blur(8px)',
        WebkitBackdropFilter: inList ? 'none' : 'blur(8px)',
        border: inList
          ? '1.5px solid var(--c-accent)'
          : '1.5px solid rgba(255, 255, 255, 0.25)',
        color: 'white',
        transform: busy ? 'scale(0.9)' : 'scale(1)',
      }}
      onMouseEnter={(e) => {
        if (!inList) {
          e.currentTarget.style.background = 'var(--c-accent)';
          e.currentTarget.style.borderColor = 'var(--c-accent)';
        }
      }}
      onMouseLeave={(e) => {
        if (!inList) {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.65)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
        }
      }}
    >
      {inList ? (
        <Check size={14} strokeWidth={3} />
      ) : (
        <Bookmark size={14} strokeWidth={2.2} />
      )}
    </button>
  );
}

/* ── ContentCard (horizontal scroll rows) ──────────────────────── */

export default function ContentCard({
  item,
  showProgress = false,
  progress = 0,
  compact = false,
}) {
  const navigate = useNavigate();
  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').split('-')[0];
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const poster = getPosterUrl(item.poster_path);

  const { inList, busy, toggle, checkOnHover } = useWatchlistToggle(item);

  const handleClick = () => navigate(`/${mediaType}/${item.id}`);

  const widthClass = compact
    ? 'w-[120px] sm:w-[140px]'
    : 'w-[150px] sm:w-[175px]';

  return (
    <div
      className={`relative group shrink-0 ${widthClass}`}
      onMouseEnter={checkOnHover}
    >
      <div
        onClick={handleClick}
        className="poster-card card-hover"
        style={{
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {poster ? (
          <img src={poster} alt={title} loading="lazy" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xs text-center px-2"
            style={{ background: 'var(--c-surface)', color: 'var(--c-dim)' }}
          >
            {title}
          </div>
        )}

        {/* Bookmark button */}
        <WatchlistButton inList={inList} busy={busy} onClick={toggle} />

        {/* Gradient overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none"
          style={{ background: 'var(--g-card-fade)' }}
        >
          <p className="text-[13px] font-semibold text-white leading-snug line-clamp-2 mb-1">
            {title}
          </p>
          <div className="flex items-center gap-2 text-[11px]">
            {year && <span className="text-white/80">{year}</span>}
            {rating && (
              <span
                className="flex items-center gap-0.5"
                style={{ color: 'var(--c-gold)' }}
              >
                <Star size={10} fill="currentColor" />
                {rating}
              </span>
            )}
            <span
              className="px-1.5 py-px rounded text-[9px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              {mediaType === 'tv' ? 'Series' : 'Film'}
            </span>
          </div>
        </div>

        {/* Progress bar for continue watching */}
        {showProgress && progress > 0 && (
          <div
            className="absolute bottom-0 left-0 right-0 progress-bar"
            style={{ borderRadius: 0 }}
          >
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton ──────────────────────────────────────────────────── */

export function ContentCardSkeleton({ compact = false }) {
  const widthClass = compact
    ? 'w-[120px] sm:w-[140px]'
    : 'w-[150px] sm:w-[175px]';
  return (
    <div className={`shrink-0 ${widthClass}`}>
      <div className="aspect-[2/3] skeleton" />
    </div>
  );
}

/* ── GridContentCard (Search / Watchlist / Browse) ─────────────── */

export function GridContentCard({ item, showProgress = false, progress = 0 }) {
  const navigate = useNavigate();
  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').split('-')[0];
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const poster = getPosterUrl(item.poster_path);

  const { inList, busy, toggle, checkOnHover } = useWatchlistToggle(item);

  return (
    <div className="relative group" onMouseEnter={checkOnHover}>
      <div
        onClick={() => navigate(`/${mediaType}/${item.id}`)}
        className="poster-card card-hover"
        style={{
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {poster ? (
          <img src={poster} alt={title} loading="lazy" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xs text-center px-2"
            style={{ background: 'var(--c-surface)', color: 'var(--c-dim)' }}
          >
            {title}
          </div>
        )}

        {/* Bookmark button */}
        <WatchlistButton inList={inList} busy={busy} onClick={toggle} />

        {/* Gradient overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none"
          style={{ background: 'var(--g-card-fade)' }}
        >
          <p className="text-[13px] font-semibold text-white leading-snug line-clamp-2 mb-1">
            {title}
          </p>
          <div className="flex items-center gap-2 text-[11px]">
            {year && <span className="text-white/80">{year}</span>}
            {rating && (
              <span
                className="flex items-center gap-0.5"
                style={{ color: 'var(--c-gold)' }}
              >
                <Star size={10} fill="currentColor" />
                {rating}
              </span>
            )}
          </div>
        </div>

        {showProgress && progress > 0 && (
          <div
            className="absolute bottom-0 left-0 right-0 progress-bar"
            style={{ borderRadius: 0 }}
          >
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
