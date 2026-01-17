import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { authService } from '../services/firebase';
import { Activity, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useStore(state => state.setUser);
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let user;
      if (isSignUp) {
        if (!name.trim()) throw new Error("이름을 입력해주세요.");
        user = await authService.signup(email, password, name);
      } else {
        user = await authService.login(email, password);
      }
      setUser(user);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
         setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (err.code === 'auth/email-already-in-use') {
         setError('이미 사용 중인 이메일입니다.');
      } else if (err.code === 'auth/weak-password') {
         setError('비밀번호는 최소 6자 이상이어야 합니다.');
      } else {
         setError(err.message || '인증에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setShowPassword(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <Activity size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">MusculoHealth</h1>
          <p className="text-slate-500 mt-2 text-center">
            {isSignUp ? '계정을 생성하세요' : '연구실 연구원을 위한 통증 모니터링'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
              <input 
                type="text" 
                required
                className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder-slate-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
            <input 
              type="email" 
              required
              className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder-slate-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">비밀번호</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="w-full h-12 px-4 pr-12 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center font-medium bg-red-50 p-2 rounded">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center mt-2"
          >
            {loading ? '처리 중...' : (isSignUp ? '계정 생성' : '로그인')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            {isSignUp ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"}
            <button 
              type="button"
              onClick={toggleMode}
              className="ml-1 text-primary font-bold hover:underline focus:outline-none"
            >
              {isSignUp ? '로그인' : '회원가입'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};