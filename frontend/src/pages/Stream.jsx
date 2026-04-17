import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { historyAPI } from '../api/watchlist';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';

// Netflix-red accent for Vidking player
const ACCENT_HEX = 'E50914';

export default function StreamPage() {
  const { mediaType, tmdbId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
  const { isAuthenticated, loading } = useAuth();

  const season = searchParams.get('s');
  const episode = searchParams.get('e');
  const lastSaveRef = useRef(0);
  const chromeTimeoutRef = useRef(null);
  const [showChrome, setShowChrome] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/signin', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  // Build Vidking embed URL
  const buildEmbedUrl = () => {
    if (mediaType === 'tv') {
      const s = season || '1';
      const e = episode || '1';
      return `https://www.vidking.net/embed/tv/${tmdbId}/${s}/${e}?color=${ACCENT_HEX}&autoPlay=true&nextEpisode=true&episodeSelector=true`;
    }
    return `https://www.vidking.net/embed/movie/${tmdbId}?color=${ACCENT_HEX}&autoPlay=true`;
  };

  // Save progress to backend (throttled to 15s)
  const saveProgress = useCallback(
    async (data) => {
      if (!activeProfile) return;
      const now = Date.now();
      if (
        now - lastSaveRef.current < 15000 &&
        data.event !== 'pause' &&
        data.event !== 'ended'
      )
        return;
      lastSaveRef.current = now;

      try {
        await historyAPI.upsert(activeProfile.id, {
          tmdb_id: parseInt(tmdbId),
          media_type: mediaType,
          title: data.title || '',
          poster_path: null,
          season: data.season ? parseInt(data.season) : null,
          episode: data.episode ? parseInt(data.episode) : null,
          progress: data.progress || 0,
          current_time: data.currentTime || 0,
          duration: data.duration || 1,
        });
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    },
    [activeProfile, tmdbId, mediaType]
  );

  // Listen for postMessage events from Vidking iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data || event.data.type !== 'PLAYER_EVENT') return;
      const { event: eventType, currentTime, duration, progress } = event.data;

      if (['timeupdate', 'pause', 'ended', 'seeked'].includes(eventType)) {
        saveProgress({
          event: eventType,
          currentTime: currentTime || 0,
          duration: duration || 1,
          progress: progress || 0,
          title: '',
          season,
          episode,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [saveProgress, season, episode]);

  // Auto-hide chrome after 3s inactivity
  const handleMouseMove = () => {
    setShowChrome(true);
    clearTimeout(chromeTimeoutRef.current);
    chromeTimeoutRef.current = setTimeout(() => setShowChrome(false), 3000);
  };

  useEffect(() => {
    chromeTimeoutRef.current = setTimeout(() => setShowChrome(false), 3000);
    return () => clearTimeout(chromeTimeoutRef.current);
  }, []);

  if (loading || !isAuthenticated) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#000' }}
      onMouseMove={handleMouseMove}
    >
      {/* Top chrome */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 flex items-center gap-4 p-4 transition-opacity duration-300 ${
          showChrome ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer focus-ring transition-all"
          style={{
            background: 'rgba(255,255,255,0.12)',
            color: 'white',
            backdropFilter: 'blur(12px)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex-1" />

        <span
          className="text-sm font-semibold px-3 py-1.5 rounded-lg"
          style={{
            background: 'rgba(229, 9, 20, 0.2)',
            color: '#FCA5A5',
            border: '1px solid rgba(229, 9, 20, 0.4)',
          }}
        >
          {mediaType === 'tv'
            ? `S${season || '1'} · E${episode || '1'}`
            : 'Now Playing'}
        </span>
      </div>

      {/* Player */}
      <iframe
        src={buildEmbedUrl()}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media"
        className="flex-1"
        style={{ border: 'none' }}
        title="Video Player"
      />
    </div>
  );
}
