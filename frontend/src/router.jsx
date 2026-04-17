import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout, { AuthLayout } from './components/layout/AppLayout';

// Public / Auth
import LandingPage from './pages/Landing';
import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';

// Profile
import ProfileSelectorPage from './pages/ProfileSelector';
import ManageProfilesPage from './pages/ManageProfiles';

// Content
import HomePage from './pages/Home';
import BrowsePage from './pages/Browse';
import SearchPage from './pages/Search';
import DetailPage from './pages/Detail';
import StreamPage from './pages/Stream';
import WatchlistPage from './pages/Watchlist';

// Account / Admin
import SettingsPage from './pages/Settings';
import AdminDashboardPage from './pages/AdminDashboard';
import AboutPage from './pages/About';

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },

  {
    element: <AuthLayout />,
    children: [
      { path: '/signin', element: <SignInPage /> },
      { path: '/signup', element: <SignUpPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },

  { path: '/profiles', element: <ProfileSelectorPage /> },
  { path: '/profiles/manage', element: <ManageProfilesPage /> },

  {
    element: <AppLayout />,
    children: [
      { path: '/home', element: <HomePage /> },
      { path: '/movies', element: <BrowsePage /> },
      { path: '/tv', element: <BrowsePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/:mediaType/:tmdbId', element: <DetailPage /> },
      { path: '/watchlist', element: <WatchlistPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/admin', element: <AdminDashboardPage /> },
      { path: '/about', element: <AboutPage /> },
    ],
  },

  { path: '/watch/:mediaType/:tmdbId', element: <StreamPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
