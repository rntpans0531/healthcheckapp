import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Home, User, BarChart2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { authService } from '../services/firebase';

export const APP_VERSION = "v1.0.3";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useStore();
  const isAuthPage = location.pathname === '/login';

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    navigate('/login');
  };

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-bold text-primary tracking-tight">MusculoHealth</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
          <button onClick={handleLogout} className="p-2 text-gray-600 hover:text-danger rounded-full hover:bg-gray-100">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 md:max-w-2xl lg:max-w-4xl">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe-area shadow-lg z-40">
        <div className="flex justify-around items-center max-w-md mx-auto h-16">
          <button 
            onClick={() => navigate('/')} 
            className={`flex flex-col items-center justify-center w-full h-full ${location.pathname === '/' ? 'text-primary' : 'text-gray-400'}`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">기록</span>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard')} 
            className={`flex flex-col items-center justify-center w-full h-full ${location.pathname === '/dashboard' ? 'text-primary' : 'text-gray-400'}`}
          >
            <BarChart2 size={24} />
            <span className="text-xs mt-1">통계</span>
          </button>
        </div>
      </nav>

      {/* 메인 화면: 하단 네비게이션 위 우측에 표시 */}
      <div className="fixed bottom-20 right-4 z-30 text-[10px] font-bold text-slate-400 font-mono pointer-events-none select-none bg-white/80 px-1.5 py-0.5 rounded shadow-sm">
        {APP_VERSION}
      </div>
    </div>
  );
};