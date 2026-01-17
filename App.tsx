import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { DailyLog } from './pages/DailyLog';
import { BodyCheck } from './pages/BodyCheck';
import { Survey } from './pages/Survey';
import { Report } from './pages/Report';
import { Dashboard } from './pages/Dashboard';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

// Protected Route Wrapper: Redirects to /login if NOT authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

// Public Route Wrapper: Redirects to / if ALREADY authenticated
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useStore((state) => state.user);
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const setUser = useStore(state => state.setUser);
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);
  
  // Initialize Notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
  }, []);

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
      } else {
        setUser(null);
      }
      setIsAuthInitializing(false);
    });
    return () => unsubscribe();
  }, [setUser]);

  if (isAuthInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-primary">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/" element={
          <ProtectedRoute>
            <DailyLog />
          </ProtectedRoute>
        } />
        
        <Route path="/body-check" element={
          <ProtectedRoute>
            <BodyCheck />
          </ProtectedRoute>
        } />
        
        <Route path="/survey" element={
          <ProtectedRoute>
            <Survey />
          </ProtectedRoute>
        } />
        
        <Route path="/report" element={
          <ProtectedRoute>
            <Report />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;