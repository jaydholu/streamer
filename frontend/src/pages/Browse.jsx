import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Film, Tv } from 'lucide-react';
import { tmdbAPI } from '../api/tmdb';
import ContentRow from '../components/common/ContentRow';
import { GridContentCard, ContentCardSkeleton } from '../components/common/ContentCard';

export default function BrowsePage() {
  const location = useLocation();
  const type = location.pathname === '/tv' ? 'tv' : 'movie';
  const isTV = type === 'tv';

  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [genreResults, setGenreResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genreLoading, setGenreLoading] = useState(false);

  useEffect(() => { fetchData(); }, [type]);

  useEffect(() => {
    if (selectedGenre) fetchGenreContent(selectedGenre);
  }, [selectedGenre]);

  const fetchData = async () => {
    setLoading(true);
    setSelectedGenre(null);
    try {
      const [genreRes, popularRes, topRatedRes] = await Promise.all([
        tmdbAPI.genres(type),
        tmdbAPI.popular(type),
        tmdbAPI.topRated(type),
      ]);
      setGenres(genreRes.data.genres || []);
      setPopular((popularRes.data.results || []).map((i) => ({ ...i, media_type: type })));
      setTopRated((topRatedRes.data.results || []).map((i) => ({ ...i, media_type: type })));
    } catch (err) {
      console.error('Browse fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenreContent = async (genreId) => {
    setGenreLoading(true);
    setGenreResults([]);
    try {
      const res = await tmdbAPI.discover(type, genreId);
      setGenreResults((res.data.results || []).map((i) => ({ ...i, media_type: type })));
    } catch {} finally {
      setGenreLoading(false);
    }
  };

  const Icon = isTV ? Tv : Film;
  const currentGenreName = genres.find((g) => g.id === selectedGenre)?.name;

  return (
    <div className="page-enter">
      {/* Hero-style page header with red gradient */}
      <div
        className="relative pt-10 pb-8 px-4 md:px-12 overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(229, 9, 20, 0.08) 0%, transparent 100%)',
        }}
      >
        <div
          className="absolute -top-20 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(229, 9, 20, 0.08) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--c-accent-muted)',
                color: 'var(--c-accent)',
              }}
            >
              <Icon size={20} />
            </div>
            <p
              className="text-xs font-bold tracking-[0.3em] uppercase"
              style={{ color: 'var(--c-accent)' }}
            >
              Browse
            </p>
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--c-text)',
            }}
          >
            {isTV ? 'TV Series' : 'Movies'}
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--c-sub)' }}>
            {isTV
              ? 'Binge-worthy series, from gripping dramas to laugh-out-loud comedies.'
              : 'From blockbusters to indie gems, find your next favorite film.'}
          </p>
        </div>
      </div>

      {/* Genre Filter */}
      <div className="sticky top-16 z-20 glass py-4" style={{ borderBottom: '1px solid var(--c-border)' }}>
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 md:px-12">
          <GenreChip
            label="All"
            active={!selectedGenre}
            onClick={() => setSelectedGenre(null)}
          />
          {genres.map((g) => (
            <GenreChip
              key={g.id}
              label={g.name}
              active={selectedGenre === g.id}
              onClick={() => setSelectedGenre(g.id)}
            />
          ))}
        </div>
      </div>

      {selectedGenre ? (
        <div className="px-4 md:px-12 py-8">
          <h2
            className="text-xl font-bold mb-6 flex items-center gap-2"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--c-text)',
            }}
          >
            <span
              className="inline-block w-1 h-6 rounded"
              style={{ background: 'var(--c-accent)' }}
            />
            {currentGenreName}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {genreLoading
              ? Array.from({ length: 18 }).map((_, i) => (
                  <ContentCardSkeleton key={i} />
                ))
              : genreResults.map((item) => (
                  <GridContentCard key={item.id} item={item} />
                ))}
          </div>
          {!genreLoading && genreResults.length === 0 && (
            <p
              className="text-center py-20 text-sm"
              style={{ color: 'var(--c-dim)' }}
            >
              No titles found in this genre.
            </p>
          )}
        </div>
      ) : (
        <div className="pt-8">
          <ContentRow
            title={`Popular ${isTV ? 'Series' : 'Movies'}`}
            items={popular}
            loading={loading}
            accent
          />
          <ContentRow
            title={`Top Rated ${isTV ? 'Series' : 'Movies'}`}
            items={topRated}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}

function GenreChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer focus-ring"
      style={{
        background: active ? 'var(--c-accent)' : 'var(--c-surface)',
        color: active ? 'white' : 'var(--c-sub)',
        border: active ? '1px solid var(--c-accent)' : '1px solid var(--c-border)',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = 'var(--c-text)';
          e.currentTarget.style.borderColor = 'var(--c-border-h)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = 'var(--c-sub)';
          e.currentTarget.style.borderColor = 'var(--c-border)';
        }
      }}
    >
      {label}
    </button>
  );
}
