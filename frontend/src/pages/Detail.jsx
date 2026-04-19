import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Plus,
  Check,
  Star,
  Clock,
  Calendar,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import {
  tmdbAPI,
  getBackdropUrl,
  getPosterUrl,
  getProfileImageUrl,
} from '../api/tmdb';
import { watchlistAPI } from '../api/watchlist';
import { useProfile } from '../context/ProfileContext';
import { useToast } from '../components/common/Toast';
import ContentRow from '../components/common/ContentRow';
import { FullPageSpinner } from '../components/common/Spinner';
import { parseApiError } from '../utils/parseApiError';

export default function DetailPage() {
  const { mediaType, tmdbId } = useParams();
  const { activeProfile } = useProfile();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [detail, setDetail] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const isTV = mediaType === 'tv';

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDetail();
    checkWatchlist();
  }, [tmdbId, mediaType]);

  useEffect(() => {
    if (isTV && detail) fetchSeason(selectedSeason);
  }, [selectedSeason, detail]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = isTV
        ? await tmdbAPI.tvDetail(tmdbId)
        : await tmdbAPI.movieDetail(tmdbId);
      setDetail(res.data);
      if (isTV && res.data.seasons?.length > 0) {
        const firstReal = res.data.seasons.find((s) => s.season_number > 0);
        if (firstReal) setSelectedSeason(firstReal.season_number);
      }
    } catch {
      addToast('Failed to load details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeason = async (num) => {
    try {
      const res = await tmdbAPI.seasonDetail(tmdbId, num);
      setEpisodes(res.data.episodes || []);
    } catch {}
  };

  const checkWatchlist = async () => {
    if (!activeProfile) return;
    try {
      const res = await watchlistAPI.check(activeProfile.id, tmdbId);
      setInWatchlist(res.data.in_watchlist);
    } catch {}
  };

  const toggleWatchlist = async () => {
    if (!activeProfile) return;
    try {
      if (inWatchlist) {
        await watchlistAPI.remove(activeProfile.id, parseInt(tmdbId));
        setInWatchlist(false);
        addToast('Removed from watchlist', 'info');
      } else {
        await watchlistAPI.add(activeProfile.id, {
          tmdb_id: parseInt(tmdbId),
          media_type: mediaType,
          title: detail?.title || detail?.name || '',
          poster_path: detail?.poster_path || null,
        });
        setInWatchlist(true);
        addToast('Added to watchlist', 'success');
      }
    } catch (err) {
      addToast(parseApiError(err), 'error');
    }
  };

  const handlePlay = (season = null, episode = null) => {
    if (isTV && season && episode) {
      navigate(`/watch/tv/${tmdbId}?s=${season}&e=${episode}`);
    } else {
      navigate(`/watch/${mediaType}/${tmdbId}`);
    }
  };

  if (loading) return <FullPageSpinner />;
  if (!detail) return null;

  const title = detail.title || detail.name;
  const year = (detail.release_date || detail.first_air_date || '').split('-')[0];
  const runtime = detail.runtime ? `${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}m` : null;
  const seasons = detail.number_of_seasons ? `${detail.number_of_seasons} Season${detail.number_of_seasons > 1 ? 's' : ''}` : null;
  const rating = detail.vote_average ? detail.vote_average.toFixed(1) : null;
  const cast = detail.credits?.cast?.slice(0, 12) || [];
  const similar = detail.similar?.results?.slice(0, 14) || [];

  return (
    <div className="page-enter -mt-16">
      {/* ═══ Backdrop Hero ═══════════════════════════════════ */}
      <div className="relative h-[70vh] min-h-[700px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${getBackdropUrl(detail.backdrop_path, 'original')})`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'var(--g-hero-bottom)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'var(--g-hero-left)' }}
        />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-24 left-4 md:left-12 z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer focus-ring glass"
          style={{ color: 'white' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* ═══ Content ═════════════════════════════════════════ */}
      <div className="relative sm:-mt-64 z-10 px-4 md:px-12 max-w-[1400px] mx-auto pb-16">
        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
          {/* Poster */}
          <div className="shrink-0 hidden md:block -mt-56">
            <img
              src={getPosterUrl(detail.poster_path, 'w500')}
              alt={title}
              className="w-56 lg:w-64 rounded-2xl animate-fade-in"
              style={{
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--c-border-h)',
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 animate-fade-in-up stagger-1 -mt-56">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest"
                style={{
                  background: 'var(--c-accent)',
                  color: 'white',
                }}
              >
                {isTV ? 'Series' : 'Film'}
              </span>
            </div>

            <h1
              className="font-bold mb-4 leading-[1.05] text-white"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                textShadow: '0 4px 24px rgba(0,0,0,0.8)',
              }}
            >
              {title}
            </h1>

            {detail.tagline && (
              <p
                className="text-sm italic mb-5 max-w-xl"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                "{detail.tagline}"
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mb-5 text-sm text-white/85">
              {rating && (
                <span
                  className="inline-flex items-center gap-1.5 font-semibold"
                  style={{ color: 'var(--c-gold)' }}
                >
                  <Star size={15} fill="currentColor" /> {rating}
                </span>
              )}
              {year && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} /> {year}
                </span>
              )}
              {runtime && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} /> {runtime}
                </span>
              )}
              {seasons && (
                <span className="inline-flex items-center gap-1.5">
                  {seasons}
                </span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(detail.genres || []).map((g) => (
                <span
                  key={g.id}
                  className="px-3 py-1 text-xs rounded-full font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid var(--c-border)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p
              className="text-[15px] leading-relaxed mb-8 max-w-2xl"
              style={{ color: 'rgba(255,255,255,0.88)' }}
            >
              {detail.overview}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handlePlay()}
                className="btn btn-primary btn-lg"
              >
                <Play size={20} fill="white" strokeWidth={0} /> Play
              </button>
              <button
                onClick={toggleWatchlist}
                className="btn btn-secondary btn-lg"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                }}
              >
                {inWatchlist ? <Check size={20} /> : <Plus size={20} />}
                {inWatchlist ? 'In My List' : 'Add to List'}
              </button>
            </div>
          </div>
        </div>

        {/* ═══ Cast ═══════════════════════════════════════════ */}
        {cast.length > 0 && (
          <section className="mt-16">
            <h2
              className="text-xl font-bold mb-5 flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--c-text)',
              }}
            >
              <span
                className="inline-block w-1 h-6 rounded"
                style={{ background: 'var(--c-accent)' }}
              />
              Cast
            </h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
              {cast.map((person) => (
                <div
                  key={person.id}
                  className="shrink-0 w-24 text-center"
                >
                  <div
                    className="w-20 h-20 rounded-full mx-auto overflow-hidden mb-2.5 transition-all"
                    style={{
                      background: 'var(--c-surface)',
                      border: '2px solid var(--c-border)',
                    }}
                  >
                    {person.profile_path ? (
                      <img
                        src={getProfileImageUrl(person.profile_path)}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-xs font-bold"
                        style={{ color: 'var(--c-dim)' }}
                      >
                        {person.name[0]}
                      </div>
                    )}
                  </div>
                  <p
                    className="text-xs font-semibold truncate"
                    style={{ color: 'var(--c-text)' }}
                  >
                    {person.name}
                  </p>
                  <p
                    className="text-[11px] truncate mt-0.5"
                    style={{ color: 'var(--c-dim)' }}
                  >
                    {person.character}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══ Episodes ════════════════════════════════════════ */}
        {isTV && detail.seasons && (
          <section className="mt-14">
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <h2
                className="text-xl font-bold flex items-center gap-2"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--c-text)',
                }}
              >
                <span
                  className="inline-block w-1 h-6 rounded"
                  style={{ background: 'var(--c-accent)' }}
                />
                Episodes
              </h2>
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                  className="input-base pr-10 appearance-none cursor-pointer"
                  style={{ paddingTop: 8, paddingBottom: 8, width: 'auto', minWidth: 180 }}
                >
                  {detail.seasons
                    .filter((s) => s.season_number > 0)
                    .map((s) => (
                      <option key={s.id} value={s.season_number}>
                        Season {s.season_number}
                      </option>
                    ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--c-dim)' }}
                />
              </div>
            </div>
            <div className="grid gap-3">
              {episodes.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => handlePlay(selectedSeason, ep.episode_number)}
                  className="group flex gap-4 p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: 'var(--c-card)',
                    border: '1px solid var(--c-border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--c-hover)';
                    e.currentTarget.style.borderColor = 'var(--c-border-h)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--c-card)';
                    e.currentTarget.style.borderColor = 'var(--c-border)';
                  }}
                >
                  <div
                    className="relative w-40 sm:w-48 aspect-video rounded-lg overflow-hidden shrink-0"
                    style={{ background: 'var(--c-hover)' }}
                  >
                    {ep.still_path && (
                      <img
                        src={getBackdropUrl(ep.still_path, 'w300')}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--c-accent)' }}
                      >
                        <Play size={20} fill="white" strokeWidth={0} />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span
                        className="text-xs font-bold"
                        style={{ color: 'var(--c-accent)' }}
                      >
                        E{ep.episode_number}
                      </span>
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: 'var(--c-text)' }}
                      >
                        {ep.name}
                      </p>
                      {ep.runtime && (
                        <span
                          className="text-[11px] ml-auto shrink-0"
                          style={{ color: 'var(--c-dim)' }}
                        >
                          {ep.runtime}m
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs leading-relaxed line-clamp-2"
                      style={{ color: 'var(--c-sub)' }}
                    >
                      {ep.overview}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <div className="mt-8">
          <ContentRow
            title="More Like This"
            items={similar.map((i) => ({ ...i, media_type: mediaType }))}
            accent
          />
        </div>
      )}
    </div>
  );
}
