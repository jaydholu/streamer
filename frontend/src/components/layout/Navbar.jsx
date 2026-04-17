import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search as SearchIcon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
  Users,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import Brand from '../common/Brand';
import ProfileAvatar from '../common/ProfileAvatar';
import ThemeToggle from '../common/ThemeToggle';

const NAV_LINKS = [
  { to: '/home', label: 'Home' },
  { to: '/movies', label: 'Movies' },
  { to: '/tv', label: 'TV Series' },
  { to: '/watchlist', label: 'My List' },
];

export default function Navbar() {
  const { isAdmin, signout } = useAuth();
  const { activeProfile, clearProfile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isHome = location.pathname === '/home';
  // Home page: transparent at top, glass when scrolled. Other pages: always glass.
  const showBlur = scrolled || !isHome;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          background: showBlur ? 'rgba(10, 10, 10, 0.85)' : 'transparent',
          backdropFilter: showBlur ? 'blur(2px) saturate(1.4)' : 'none',
          WebkitBackdropFilter: showBlur ? 'blur(24px) saturate(1.4)' : 'none',
          borderBottom: showBlur
            ? '1px solid var(--c-border)'
            : '1px solid transparent',
        }}
      >
        <div className="h-16 flex items-center px-4 md:px-12">
          <Brand to="/home" size="md" />

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 ml-10">
            {NAV_LINKS.map(({ to, label }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className="relative px-4 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-200 focus-ring"
                  style={{
                    color: active ? 'var(--c-text)' : 'var(--c-sub)',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = 'var(--c-text)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = 'var(--c-sub)';
                  }}
                >
                  {label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                      style={{ background: 'var(--c-accent)' }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="hidden sm:block mr-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                  placeholder="Search titles, people, genres..."
                  className="input-base"
                  style={{ width: '260px', padding: '8px 14px', fontSize: 13 }}
                />
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2 rounded-lg transition-colors cursor-pointer hidden sm:flex focus-ring"
                style={{ color: 'var(--c-sub)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--c-text)';
                  e.currentTarget.style.background = 'var(--c-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--c-sub)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <SearchIcon size={18} />
              </button>
            )}

            <ThemeToggle size={18} />

            {/* Profile Dropdown */}
            <div ref={dropdownRef} className="relative hidden md:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg transition-colors cursor-pointer focus-ring ml-1"
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <ProfileAvatar
                  name={activeProfile?.name || 'U'}
                  avatar={activeProfile?.avatar}
                  index={activeProfile?.name}
                  size="xs"
                  rounded="lg"
                />
                <ChevronDown
                  size={14}
                  style={{
                    color: 'var(--c-dim)',
                    transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                  }}
                />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 top-14 w-60 rounded-xl py-2 animate-scale-in glass-strong"
                  style={{
                    border: '1px solid var(--c-border)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  {activeProfile && (
                    <div
                      className="px-4 py-3 flex items-center gap-3"
                      style={{ borderBottom: '1px solid var(--c-border)' }}
                    >
                      <ProfileAvatar
                        name={activeProfile.name}
                        avatar={activeProfile.avatar}
                        index={activeProfile.name}
                        size="sm"
                        rounded="lg"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--c-text)' }}>
                          {activeProfile.name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--c-dim)' }}>
                          Active profile
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="py-1">
                    <DropdownItem
                      icon={Users}
                      onClick={() => {
                        clearProfile();
                        navigate('/profiles');
                        setDropdownOpen(false);
                      }}
                    >
                      Switch Profile
                    </DropdownItem>
                    <DropdownItem
                      icon={User}
                      onClick={() => { navigate('/profiles/manage'); setDropdownOpen(false); }}
                    >
                      Manage Profiles
                    </DropdownItem>
                    <DropdownItem
                      icon={Settings}
                      onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                    >
                      Account Settings
                    </DropdownItem>
                    {isAdmin && (
                      <DropdownItem
                        icon={Shield}
                        onClick={() => { navigate('/admin'); setDropdownOpen(false); }}
                      >
                        Admin Dashboard
                      </DropdownItem>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid var(--c-border)' }} className="pt-1">
                    <DropdownItem
                      icon={LogOut}
                      danger
                      onClick={() => { signout(); navigate('/signin'); }}
                    >
                      Sign Out
                    </DropdownItem>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden p-2 rounded-lg cursor-pointer focus-ring"
              style={{ color: 'var(--c-sub)' }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden glass-strong"
          style={{ animationDuration: '250ms' }}
        >
          <div className="flex flex-col pt-24 px-6 gap-1 animate-fade-in safe-bottom h-full overflow-y-auto no-scrollbar">
            {/* Mobile search */}
            <form
              onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }}
              className="mb-4"
            >
              <div className="relative">
                <SearchIcon
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--c-dim)' }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies & TV..."
                  className="input-base"
                  style={{ paddingLeft: 44, fontSize: 15 }}
                />
              </div>
            </form>

            {/* Active profile card */}
            {activeProfile && (
              <div
                className="flex items-center gap-3 p-3 rounded-xl mb-3"
                style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)' }}
              >
                <ProfileAvatar
                  name={activeProfile.name}
                  avatar={activeProfile.avatar}
                  index={activeProfile.name}
                  size="md"
                  rounded="lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs" style={{ color: 'var(--c-dim)' }}>
                    Watching as
                  </p>
                  <p className="text-base font-semibold truncate" style={{ color: 'var(--c-text)' }}>
                    {activeProfile.name}
                  </p>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div className="mb-3">
              {NAV_LINKS.map(({ to, label }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center px-4 py-3.5 rounded-xl text-[15px] font-medium"
                    style={{
                      color: active ? 'var(--c-text)' : 'var(--c-sub)',
                      background: active ? 'var(--c-accent-muted)' : 'transparent',
                      borderLeft: active ? '3px solid var(--c-accent)' : '3px solid transparent',
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--c-border)' }} className="pt-3 mb-3">
              <p
                className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'var(--c-dim)' }}
              >
                Account
              </p>
              <MobileMenuItem
                icon={Users}
                onClick={() => { clearProfile(); navigate('/profiles'); }}
              >
                Switch Profile
              </MobileMenuItem>
              <MobileMenuItem icon={User} onClick={() => navigate('/profiles/manage')}>
                Manage Profiles
              </MobileMenuItem>
              <MobileMenuItem icon={Settings} onClick={() => navigate('/settings')}>
                Settings
              </MobileMenuItem>
              {isAdmin && (
                <MobileMenuItem icon={Shield} onClick={() => navigate('/admin')}>
                  Admin Dashboard
                </MobileMenuItem>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--c-border)' }} className="pt-3">
              <MobileMenuItem
                icon={LogOut}
                danger
                onClick={() => { signout(); navigate('/signin'); }}
              >
                Sign Out
              </MobileMenuItem>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DropdownItem({ icon: Icon, onClick, children, danger = false }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors cursor-pointer text-left"
      style={{ color: danger ? 'var(--c-err)' : 'var(--c-sub)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--c-hover)';
        if (!danger) e.currentTarget.style.color = 'var(--c-text)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        if (!danger) e.currentTarget.style.color = 'var(--c-sub)';
      }}
    >
      <Icon size={16} />
      {children}
    </button>
  );
}

function MobileMenuItem({ icon: Icon, onClick, children, danger = false }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-left transition-colors cursor-pointer"
      style={{ color: danger ? 'var(--c-err)' : 'var(--c-sub)' }}
    >
      <Icon size={19} />
      {children}
    </button>
  );
}
