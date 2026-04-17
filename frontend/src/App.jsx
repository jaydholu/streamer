import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { ToastProvider } from './components/common/Toast';
import router from './router';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ProfileProvider>
            <RouterProvider router={router} />
          </ProfileProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
