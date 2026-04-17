# Streamer · Frontend (Redesigned)

Complete UI/UX redesign of the Streamer web app — Netflix-inspired cinematic aesthetic with full light/dark mode support.

## What's new

### Design System
- **Netflix-red brand palette** — `#E50914` primary, `#B81D24` deep, on true cinema blacks (`#0A0A0A`)
- **Light/Dark themes** — Dark is default. Toggle in navbar + Settings. Persisted to localStorage.
- **Typography** — Plus Jakarta Sans (display) + Inter (body) + Bebas Neue (accent)
- **Cinematic gradients** — hero overlays, card fades, brand gradients, ambient red glows
- **Refined motion** — page-enter, stagger-fade, scale-in, pulse-ring for loading

### Architecture
- Tokens live in `src/index.css` under `[data-theme='dark']` / `[data-theme='light']`
- Theme is managed by `src/context/ThemeContext.jsx` (updates `<html data-theme>` + meta theme-color)
- All pages, layouts, and components consume tokens via `var(--c-*)` — theme switches are instant across the app
- No backend changes needed — API contracts preserved

### New / Reworked Components
- `common/Brand.jsx` — red gradient logo with dot accent
- `common/ThemeToggle.jsx` — animated sun/moon transition
- `common/ProfileAvatar.jsx` — deterministic gradient avatars
- `common/AuthCard.jsx` — shared shell for sign-in / sign-up / reset flows
- `common/ContentCard.jsx` — Netflix-style hover with gradient fade + meta
- `common/ContentRow.jsx` — smart edge-scroll buttons with fade masks
- `layout/Navbar.jsx` — scroll-aware glass, active underline, theme toggle, mobile sheet
- `layout/Footer.jsx` — brand + links + tagline
- `layout/AppLayout.jsx` — ambient red radial glows on auth + grid overlay

### Redesigned Pages (all 16)
| Area | Pages |
|------|-------|
| **Public** | Landing |
| **Auth** | SignIn · SignUp · ForgotPassword · ResetPassword |
| **Profile** | ProfileSelector (Who's watching?) · ManageProfiles |
| **Content** | Home (cinematic hero + rows) · Browse (Movies/TV) · Detail · Stream · Search · Watchlist |
| **Account** | Settings · AdminDashboard · About |

## Running

```bash
# From the frontend directory
npm install
npm run dev   # starts on http://localhost:5173
```

The dev server proxies `/api/*` to `http://localhost:8000` — make sure the FastAPI backend is running first.

### Environment variables (optional)
Create `.env.local` in `/frontend`:
```
VITE_API_URL=http://localhost:8000/api/v1
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
```

## Build
```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

## Folder structure
```
frontend/
├── public/
│   └── favicon.svg           # New red "S" favicon
├── src/
│   ├── api/                  # axios clients (unchanged)
│   ├── components/
│   │   ├── common/           # Brand, Button, Card, Modal, Avatar, etc.
│   │   └── layout/           # Navbar, Footer, AppLayout
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ProfileContext.jsx
│   │   └── ThemeContext.jsx  # NEW
│   ├── pages/                # All 16 pages redesigned
│   ├── App.jsx
│   ├── index.css             # Full design system
│   ├── main.jsx
│   └── router.jsx
├── index.html                # Updated meta + preconnects
├── package.json
└── vite.config.js
```

## Backend compatibility
No backend changes. All existing FastAPI endpoints under `/api/v1/*` are consumed exactly as before:
- `auth/*`, `profiles/*`, `tmdb/*`, `watchlist/*`, `history/*`, `admin/*`

The `access_token` / `refresh_token` localStorage flow and 401-refresh interceptor are unchanged.

---

Built with ❤️ for private movie nights.
