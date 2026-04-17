import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ContentCard, { ContentCardSkeleton } from './ContentCard';

export default function ContentRow({
  title,
  subtitle,
  items = [],
  loading = false,
  showProgress = false,
  compact = false,
  accent = false,
}) {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 20);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 20);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [items]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.82;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (!loading && items.length === 0) return null;

  return (
    <section className="mb-10 md:mb-14">
      <div className="px-4 md:px-12 mb-4 flex items-end justify-between">
        <div className="min-w-0">
          <h2
            className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-2"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--c-text)',
            }}
          >
            {accent && (
              <span
                className="inline-block w-1 h-5 md:h-6 rounded"
                style={{ background: 'var(--c-accent)' }}
              />
            )}
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: 'var(--c-dim)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="relative group/row">
        {/* Left chevron */}
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className={`hidden md:flex absolute left-0 top-0 bottom-0 z-20 w-16 items-center justify-center cursor-pointer transition-opacity duration-300 ${
            showLeft ? 'opacity-0 group-hover/row:opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            background: 'linear-gradient(to right, var(--c-bg) 20%, transparent)',
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center glass-strong"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <ChevronLeft size={22} style={{ color: 'var(--c-text)' }} />
          </div>
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar px-4 md:px-12 pb-3 pt-1 scroll-smooth"
        >
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <ContentCardSkeleton key={i} compact={compact} />
              ))
            : items.map((item) => (
                <ContentCard
                  key={`${item.id}-${item.media_type || ''}`}
                  item={item}
                  showProgress={showProgress}
                  progress={item.progress}
                  compact={compact}
                />
              ))}
        </div>

        {/* Right chevron */}
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className={`hidden md:flex absolute right-0 top-0 bottom-0 z-20 w-16 items-center justify-center cursor-pointer transition-opacity duration-300 ${
            showRight ? 'opacity-0 group-hover/row:opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            background: 'linear-gradient(to left, var(--c-bg) 20%, transparent)',
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center glass-strong"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <ChevronRight size={22} style={{ color: 'var(--c-text)' }} />
          </div>
        </button>
      </div>
    </section>
  );
}
