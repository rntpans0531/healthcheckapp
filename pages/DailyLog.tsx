import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Clock, Activity, Calendar, FileEdit, PlusCircle, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { format, addDays, subDays, parseISO, isFuture, isSameDay } from 'date-fns';

export const DailyLog: React.FC = () => {
  const navigate = useNavigate();
  const { dailyLog, setDailyLog, loadReportForDate, painRecords, isLoading } = useStore();

  // Load report on mount (for today or current date state)
  useEffect(() => {
    if (dailyLog.date) {
        loadReportForDate(dailyLog.date);
    }
  }, []); // Only on mount

  const currentDateObj = parseISO(dailyLog.date);
  const isToday = isSameDay(currentDateObj, new Date());

  const handlePrevDay = () => {
    const newDate = subDays(currentDateObj, 1);
    loadReportForDate(format(newDate, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    if (isToday) return; // Prevent going to future
    const newDate = addDays(currentDateObj, 1);
    loadReportForDate(format(newDate, 'yyyy-MM-dd'));
  };

  const handleTimeChange = (key: keyof typeof dailyLog.times, value: string) => {
    setDailyLog({
      times: {
        ...dailyLog.times,
        [key]: Number(value)
      }
    });
  };

  const handleExerciseChange = (key: keyof typeof dailyLog.exercise, value: string) => {
    setDailyLog({
      exercise: {
        ...dailyLog.exercise,
        [key]: Number(value)
      }
    });
  };

  const handleNext = () => {
    navigate('/body-check');
  };

  const isEditing = painRecords.length > 0 || Object.values(dailyLog.times).some((v) => Number(v) > 0);
  
  // Parse date for display YYYY-MM-DD
  const [year, month, day] = dailyLog.date ? dailyLog.date.split('-') : ['----', '--', '--'];

  // Calculate Total Hours
  const totalHours = Object.values(dailyLog.times).reduce<number>((acc, curr) => acc + (Number(curr) || 0), 0);
  const isOver24 = totalHours > 24;

  return (
    <div className="space-y-6 animate-fade-in relative pb-10">
      {isLoading && (
         <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm rounded-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
         </div>
      )}

      {/* Date Stepper Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
         <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
                <Calendar size={24} />
             </div>
             <div>
                <label className="text-xs font-bold text-slate-400 block mb-0.5">기록 날짜</label>
                <div className="font-bold text-xl text-slate-800 tracking-tight whitespace-nowrap">
                    {year}년 {month}월 {day}일
                </div>
                 {isEditing ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-500">
                        <FileEdit size={10} />
                        수정 모드
                    </span>
                 ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-500">
                        <PlusCircle size={10} />
                        새 기록
                    </span>
                 )}
             </div>
         </div>
         
         <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1.5 border border-slate-100">
             <button 
                onClick={handlePrevDay}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-slate-600 shadow-sm border border-slate-100 active:scale-95 transition-all hover:bg-slate-50"
                aria-label="이전 날짜"
             >
                <ChevronLeft size={24} />
             </button>
             <button 
                onClick={handleNextDay}
                disabled={isToday}
                className={`w-10 h-10 flex items-center justify-center rounded-lg shadow-sm border border-slate-100 transition-all ${
                    isToday 
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                    : 'bg-white text-slate-600 active:scale-95 hover:bg-slate-50'
                }`}
                aria-label="다음 날짜"
             >
                <ChevronRight size={24} />
             </button>
         </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Clock size={20} className="text-primary" />
                활동 시간
            </h2>
            <div className={`text-sm font-bold px-2 py-1 rounded-lg border flex items-center gap-1 ${
                isOver24 
                ? 'bg-red-50 text-red-600 border-red-100' 
                : totalHours === 24 
                    ? 'bg-green-50 text-green-600 border-green-100' 
                    : 'bg-slate-50 text-slate-500 border-slate-100'
            }`}>
                {isOver24 && <AlertCircle size={12} />}
                <span>{totalHours} / 24 시간</span>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'sitting', label: '앉기', placeholder: '0' },
            { key: 'standing', label: '서기', placeholder: '0' },
            { key: 'sleeping', label: '수면', placeholder: '0' },
            { key: 'driving', label: '운전', placeholder: '0' },
          ].map((item) => (
            <div key={item.key} className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block pl-1">{item.label}</label>
              <div className="relative">
                  <input 
                    type="number" 
                    min="0" 
                    max="24"
                    step="0.5"
                    inputMode="decimal"
                    className={`w-full h-14 px-3 rounded-2xl border bg-slate-50 focus:bg-white focus:ring-2 outline-none transition-all text-center text-xl font-bold placeholder-slate-300 ${
                        isOver24 ? 'border-red-300 focus:border-red-500 focus:ring-red-200 text-red-600' : 'border-slate-200 focus:border-primary focus:ring-primary/20 text-slate-800'
                    }`}
                    value={dailyLog.times[item.key as keyof typeof dailyLog.times] || ''}
                    onChange={(e) => handleTimeChange(item.key as keyof typeof dailyLog.times, e.target.value)}
                    placeholder={item.placeholder}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">시간</span>
              </div>
            </div>
          ))}
        </div>
        {isOver24 && (
            <p className="text-xs text-red-500 mt-3 text-center font-medium animate-pulse">
                하루는 24시간입니다. 입력된 시간을 확인해주세요.
            </p>
        )}
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Activity size={20} className="text-red-500" />
          운동 시간 <span className="text-slate-400 text-sm font-normal">(분)</span>
        </h2>
        
        <div className="space-y-4">
          {[
            { key: 'high', label: '고강도', sub: '숨이 많이 참', color: 'text-red-500', bg: 'bg-red-50' },
            { key: 'mid', label: '중강도', sub: '약간 숨참', color: 'text-orange-500', bg: 'bg-orange-50' },
            { key: 'low', label: '저강도', sub: '편안함', color: 'text-green-500', bg: 'bg-green-50' },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              <div className={`w-24 flex-shrink-0 flex flex-col justify-center h-12 px-3 rounded-xl ${item.bg}`}>
                  <span className={`text-sm font-bold ${item.color}`}>{item.label}</span>
                  <span className="text-[10px] text-slate-500 leading-none mt-0.5">{item.sub}</span>
              </div>
              <div className="relative flex-1">
                  <input 
                    type="number" 
                    min="0"
                    step="5" 
                    inputMode="numeric"
                    className="w-full h-12 px-3 pl-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-right text-lg font-bold text-slate-800 placeholder-slate-300 transition-colors"
                    value={dailyLog.exercise[item.key as keyof typeof dailyLog.exercise] || ''}
                    onChange={(e) => handleExerciseChange(item.key as keyof typeof dailyLog.exercise, e.target.value)}
                    placeholder="0"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">시간(분)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={handleNext}
        disabled={isLoading || isOver24}
        className="w-full h-14 bg-slate-900 text-white text-lg font-bold rounded-xl shadow-xl hover:bg-black active:scale-[0.98] transition-all sticky bottom-4 disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>{isEditing ? '수정하고 다음단계' : '다음 단계'}</span>
        <ChevronRight size={20} className="opacity-60" />
      </button>
    </div>
  );
};