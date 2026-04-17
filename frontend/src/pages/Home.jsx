import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Star, Calendar } from 'lucide-react';
import { tmdbAPI, getBackdropUrl } from '../api/tmdb';
import { historyAPI } from '../api/watchlist';
import { useProfile } from '../context/ProfileContext';
import ContentRow from '../components/common/ContentRow';

export default function HomePage() {
  const { activeProfile } = useProfile();
  const navigate = useNavigate();

  const [hero, setHero] = useState(null);
  const [continueWatching, setContinueWatching] = useState([]);
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedTV, setTopRatedTV] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchContent(); }, [activeProfile]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [trendingRes, popMovieRes, topTVRes, popTVRes] = await Promise.all([
        tmdbAPI.trending('all', 'week'),
        tmdbAPI.popular('movie'),
        tmdbAPI.topRated('tv'),
        tmdbAPI.popular('tv'),
      ]);

      const trendingItems = trendingRes.data.results || [];
      setTrending(trendingItems);
      setPopularMovies(popMovieRes.data.results || []);
      setTopRatedTV(topTVRes.data.results || []);
      setPopularTV(popTVRes.data.results || []);

      if (trendingItems.length > 0) {
        const heroItem = trendingItems.find((i) => i.backdrop_path) || trendingItems[0];
        setHero(heroItem);
      }

      if (activeProfile) {
        try {
          const cwRes = await historyAPI.continueWatching(activeProfile.id);
          setContinueWatching(cwRes.data || []);
        } catch {}
      }
    } catch (err) {
      console.error('Failed to fetch content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (!hero) return;
    const type = hero.media_type || (hero.first_air_date ? 'tv' : 'movie');
    navigate(`/watch/${type}/${hero.id}`);
  };

  const handleInfo = () => {
    if (!hero) return;
    const type = hero.media_type || (hero.first_air_date ? 'tv' : 'movie');
    navigate(`/${type}/${hero.id}`);
  };

  const heroTitle = hero?.title || hero?.name;
  const heroYear = (hero?.release_date || hero?.first_air_date || '').split('-')[0];
  const heroRating = hero?.vote_average ? hero.vote_average.toFixed(1) : null;
  const heroType = hero?.media_type || (hero?.first_air_date ? 'tv' : 'movie');

  return (
    <div className="page-enter -mt-16">
      {/* ═══ Hero Section ═══════════════════════════════════ */}
      {hero ? (
        <section className="relative h-[85vh] min-h-[560px] max-h-[800px]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${getBackdropUrl(hero.backdrop_path, 'original')})`,
            }}
          />
          {/* Gradient overlays */}
          <div
            className="absolute inset-0"
            style={{ background: 'var(--g-hero-bottom)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'var(--g-hero-left)' }}
          />

          {/* Content */}
          <div className="relative h-full flex items-end pb-20 sm:pb-24 md:pb-28">
            <div className="px-4 md:px-12 max-w-2xl animate-fade-in-up stagger-2">
              {/* Type badge */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    background: 'var(--c-accent)',
                    color: 'white',
                  }}
                >
                  {heroType === 'tv' ? 'Series' : 'Film'}
                </span>
                <span
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ color: 'rgba(255,255,255,0.85)' }}
                >
                  Trending Now
                </span>
              </div>

              {/* Title */}
              <h1
                className="font-bold leading-[1.05] mb-4 text-white"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 6vw, 4.5rem)',
                  textShadow: '0 4px 24px rgba(0,0,0,0.8)',
                }}
              >
                {heroTitle}
              </h1>

              {/* Meta row */}
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                {heroRating && (
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: 'var(--c-gold)' }}
                  >
                    <Star size={15} fill="currentColor" />
                    {heroRating}
                  </span>
                )}
                {heroYear && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/85">
                    <Calendar size={14} />
                    {heroYear}
                  </span>
                )}
              </div>

              {/* Overview */}
              <p
                className="text-[15px] leading-relaxed line-clamp-3 mb-7 max-w-xl text-white/90"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
              >
                {hero.overview}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePlay}
                  className="btn btn-primary btn-lg"
                >
                  <Play size={20} fill="white" strokeWidth={0} /> Play
                </button>
                <button
                  onClick={handleInfo}
                  className="btn btn-secondary btn-lg"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
                >
                  <Info size={18} /> More Info
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="h-[40vh] skeleton" />
      )}

      {/* ═══ Content Rows ═══════════════════════════════════ */}
      <div className="relative z-10 -mt-20 sm:-mt-24">
        {continueWatching.length > 0 && (
          <ContentRow
            title="Continue Watching"
            subtitle="Pick up where you left off"
            items={continueWatching}
            showProgress
            accent
          />
        )}
        <ContentRow
          title="Trending This Week"
          items={trending}
          loading={loading}
          accent
        />
        <ContentRow
          title="Popular Movies"
          items={popularMovies}
          loading={loading}
        />
        <ContentRow title="Top Rated TV" items={topRatedTV} loading={loading} />
        <ContentRow
          title="Popular TV Series"
          items={popularTV}
          loading={loading}
        />
      </div>
    </div>
  );
}
