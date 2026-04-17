import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Film, Tv } from 'lucide-react';
import { watchlistAPI } from '../api/watchlist';
import { useProfile } from '../context/ProfileContext';
import { GridContentCard, ContentCardSkeleton } from '../components/common/ContentCard';

export default function WatchlistPage() {
  const { activeProfile } = useProfile();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all'); // all | movie | tv
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeProfile) fetchWatchlist();
  }, [activeProfile]);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const res = await watchlistAPI.get(activeProfile.id);
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems =
    filter === 'all' ? items : items.filter((i) => i.media_type === filter);

  const movieCount = items.filter((i) => i.media_type === 'movie').length;
  const tvCount = items.filter((i) => i.media_type === 'tv').length;

  return (
    <div className="page-enter min-h-screen">
      {/* Header */}
      <div
        className="pt-10 pb-8 px-4 md:px-12 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(229, 9, 20, 0.08) 0%, transparent 100%)',
        }}
      >
        <div className="relative max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--c-accent-muted)',
                color: 'var(--c-accent)',
              }}
            >
              <Bookmark size={20} fill="currentColor" />
            </div>
            <p
              className="text-xs font-bold tracking-[0.3em] uppercase"
              style={{ color: 'var(--c-accent)' }}
            >
              Saved for later
            </p>
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--c-text)',
            }}
          >
            My List
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--c-sub)' }}>
            {items.length > 0
              ? `${items.length} title${items.length === 1 ? '' : 's'} · ${movieCount} film${
                  movieCount === 1 ? '' : 's'
                } · ${tvCount} series`
              : 'Bookmark titles to keep track of what you want to watch.'}
          </p>

          {/* Filter chips */}
          {items.length > 0 && (
            <div className="flex gap-2 mt-5">
              <FilterChip
                label="All"
                count={items.length}
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              />
              <FilterChip
                icon={Film}
                label="Movies"
                count={movieCount}
                active={filter === 'movie'}
                onClick={() => setFilter('movie')}
              />
              <FilterChip
                icon={Tv}
                label="TV"
                count={tvCount}
                active={filter === 'tv'}
                onClick={() => setFilter('tv')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 md:px-12 py-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <ContentCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyWatchlist onExplore={() => navigate('/home')} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {filteredItems.map((item) => (
              <GridContentCard
                key={`${item.tmdb_id}-${item.media_type}`}
                item={{
                  id: item.tmdb_id,
                  media_type: item.media_type,
                  title: item.title,
                  name: item.title,
                  poster_path: item.poster_path,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ icon: Icon, label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-semibold cursor-pointer focus-ring transition-all"
      style={{
        background: active ? 'var(--c-accent)' : 'var(--c-surface)',
        color: active ? 'white' : 'var(--c-sub)',
        border: active ? '1px solid var(--c-accent)' : '1px solid var(--c-border)',
      }}
    >
      {Icon && <Icon size={13} />}
      {label}
      <span
        className="text-[11px] px-1.5 py-px rounded-full"
        style={{
          background: active ? 'rgba(255,255,255,0.2)' : 'var(--c-hover)',
          color: active ? 'white' : 'var(--c-dim)',
          fontWeight: 700,
        }}
      >
        {count}
      </span>
    </button>
  );
}

function EmptyWatchlist({ onExplore }) {
  return (
    <div className="text-center py-20">
      <div
        className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
        }}
      >
        <Bookmark size={40} style={{ color: 'var(--c-dim)' }} />
      </div>
      <h3
        className="font-bold mb-3"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          color: 'var(--c-text)',
        }}
      >
        Your list is empty
      </h3>
      <p
        className="text-sm max-w-sm mx-auto mb-7"
        style={{ color: 'var(--c-sub)' }}
      >
        When you find something you want to watch later, tap the bookmark. It'll show up here.
      </p>
      <button onClick={onExplore} className="btn btn-primary">
        Explore titles
      </button>
    </div>
  );
}
