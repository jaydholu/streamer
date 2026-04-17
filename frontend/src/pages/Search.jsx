import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Film, Tv, X } from 'lucide-react';
import { tmdbAPI } from '../api/tmdb';
import { GridContentCard, ContentCardSkeleton } from '../components/common/ContentCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(query);
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState('all'); // all | movie | tv
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalQuery(query);
    if (query) performSearch(query);
    else setResults([]);
  }, [query]);

  const performSearch = async (q) => {
    setLoading(true);
    try {
      const res = await tmdbAPI.search(q);
      setResults(
        (res.data.results || []).filter(
          (i) => i.media_type === 'movie' || i.media_type === 'tv'
        )
      );
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim() });
    }
  };

  const filteredResults =
    filter === 'all'
      ? results
      : results.filter((r) => r.media_type === filter);

  const movieCount = results.filter((r) => r.media_type === 'movie').length;
  const tvCount = results.filter((r) => r.media_type === 'tv').length;

  return (
    <div className="page-enter min-h-screen">
      {/* Search header */}
      <div
        className="pt-8 pb-6 px-4 md:px-12 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(229, 9, 20, 0.06) 0%, transparent 100%)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <SearchIcon
              size={22}
              className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--c-dim)' }}
            />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search for movies, TV series, actors..."
              className="input-base"
              style={{
                paddingLeft: 54,
                paddingRight: localQuery ? 54 : 20,
                paddingTop: 16,
                paddingBottom: 16,
                fontSize: 16,
              }}
              autoFocus
            />
            {localQuery && (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery('');
                  setSearchParams({});
                }}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors cursor-pointer focus-ring"
                style={{ color: 'var(--c-dim)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--c-text)';
                  e.currentTarget.style.background = 'var(--c-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--c-dim)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={18} />
              </button>
            )}
          </form>

          {/* Filters */}
          {query && results.length > 0 && (
            <div className="flex gap-2 mt-5 animate-fade-in">
              <FilterChip
                label="All"
                count={results.length}
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

      {/* Results */}
      <div className="px-4 md:px-12 pt-6 pb-20">
        {query ? (
          <>
            {!loading && filteredResults.length > 0 && (
              <p
                className="text-sm mb-5"
                style={{ color: 'var(--c-sub)' }}
              >
                Showing{' '}
                <span style={{ color: 'var(--c-text)', fontWeight: 600 }}>
                  {filteredResults.length}
                </span>{' '}
                result{filteredResults.length === 1 ? '' : 's'} for{' '}
                <span style={{ color: 'var(--c-accent)', fontWeight: 600 }}>
                  "{query}"
                </span>
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {loading
                ? Array.from({ length: 12 }).map((_, i) => (
                    <ContentCardSkeleton key={i} />
                  ))
                : filteredResults.map((item) => (
                    <GridContentCard
                      key={`${item.id}-${item.media_type}`}
                      item={item}
                    />
                  ))}
            </div>

            {!loading && filteredResults.length === 0 && (
              <EmptyState query={query} />
            )}
          </>
        ) : (
          <InitialState />
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

function EmptyState({ query }) {
  return (
    <div className="text-center mt-20">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: 'var(--c-surface)' }}
      >
        <SearchIcon size={34} style={{ color: 'var(--c-dim)' }} />
      </div>
      <h3
        className="font-bold mb-2"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          color: 'var(--c-text)',
        }}
      >
        Nothing found
      </h3>
      <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--c-sub)' }}>
        We couldn't find any titles matching "{query}". Try a different search
        or check your spelling.
      </p>
    </div>
  );
}

function InitialState() {
  return (
    <div className="text-center mt-20">
      <div
        className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{
          background: 'var(--c-accent-muted)',
          color: 'var(--c-accent)',
        }}
      >
        <SearchIcon size={40} />
      </div>
      <h3
        className="font-bold mb-2"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          color: 'var(--c-text)',
        }}
      >
        Find something to watch
      </h3>
      <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--c-sub)' }}>
        Search across thousands of movies and TV series. Try a title, a genre,
        or an actor's name.
      </p>
    </div>
  );
}
