import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Info, X, Clock, Activity } from 'lucide-react';

const partNames: Record<string, string> = {
  neck: '목',
  shoulder: '어깨',
  back: '등',
  waist: '허리',
  elbow: '팔꿈치',
  hand_wrist: '손목/손',
  hip_thigh: '엉덩이/허벅지',
  knee: '무릎',
  ankle_foot: '발목/발'
};

const partColors: Record<string, string> = {
  neck: '#ef4444',      // Red
  shoulder: '#f97316',  // Orange
  back: '#eab308',      // Yellow
  waist: '#22c55e',     // Green
  elbow: '#06b6d4',     // Cyan
  hand_wrist: '#3b82f6',// Blue
  hip_thigh: '#6366f1', // Indigo
  knee: '#a855f7',      // Purple
  ankle_foot: '#ec4899' // Pink
};

export const Dashboard: React.FC = () => {
  const { user, reports, fetchHistory, isLoading } = useStore();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  useEffect(() => {
    if (user?.uid) {
        fetchHistory(user.uid);
    }
  }, [user, fetchHistory]);

  // Filter reports based on period (simplified: last 7 or 30 records)
  const filteredReports = period === 'weekly' ? reports.slice(0, 7).reverse() : reports.slice(0, 30).reverse();

  // Transform data for charts
  const chartData = filteredReports.map(r => {
    const dataPoint: any = { 
        date: r.date.substring(5), // MM-DD
        // Activity Data
        sitting: r.dailyLog?.times?.sitting || 0,
        standing: r.dailyLog?.times?.standing || 0,
        sleeping: r.dailyLog?.times?.sleeping || 0,
        driving: r.dailyLog?.times?.driving || 0,
        // Exercise Data
        high: r.dailyLog?.exercise?.high || 0,
        mid: r.dailyLog?.exercise?.mid || 0,
        low: r.dailyLog?.exercise?.low || 0,
    };
    
    // Fill in pain levels for all body parts
    Object.keys(partNames).forEach(partId => {
        const record = r.painRecords.find(p => p.partId === partId);
        dataPoint[partId] = record ? record.painLevel : 0; // Don't null, use 0 for clean lines
    });
    
    return dataPoint;
  });
  
  const displayData = chartData.length > 0 ? chartData : [];
  
  // Calculate health score
  const allPainLevels = filteredReports.flatMap(r => r.painRecords.map(p => p.painLevel));
  const averagePain = allPainLevels.length > 0
    ? allPainLevels.reduce((acc, curr) => acc + curr, 0) / allPainLevels.length
    : 0;
  
  const healthScore = filteredReports.length > 0 
    ? Math.max(0, Math.round((10 - averagePain) * 10))
    : 100;

  return (
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm border border-slate-100">
        <button 
            onClick={() => setPeriod('weekly')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${period === 'weekly' ? 'bg-primary text-white shadow-md' : 'text-slate-500'}`}
        >
            주간
        </button>
        <button 
            onClick={() => setPeriod('monthly')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${period === 'monthly' ? 'bg-primary text-white shadow-md' : 'text-slate-500'}`}
        >
            월간
        </button>
      </div>

      {/* --- Score Card --- */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex justify-between items-start z-10 relative">
            <h3 className="text-white/80 text-sm font-medium mb-1 flex items-center gap-2">
                근골격 건강 점수
                <button 
                    onClick={() => setShowScoreInfo(true)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    aria-label="점수 기준 보기"
                >
                    <Info size={16} className="text-white/70" />
                </button>
            </h3>
        </div>
        
        <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-black">{healthScore}</span>
            <span className="text-xl opacity-70">/ 100</span>
        </div>
        <p className="text-xs mt-2 text-blue-100 relative z-10">최근 기록된 통증 수치를 기반으로 계산되었습니다.</p>

        {/* Info Overlay */}
        {showScoreInfo && (
            <div className="absolute inset-0 bg-slate-900/95 z-20 p-5 animate-fade-in flex flex-col justify-center">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white text-sm">점수 산정 기준</h4>
                    <button onClick={() => setShowScoreInfo(false)} className="text-slate-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                    선택한 기간 동안 기록된 모든 부위의 <strong>통증 정도(VAS 1~10)</strong> 평균을 역산하여 산출합니다.
                </p>
                <div className="mt-3 space-y-1 text-xs text-slate-400">
                    <div className="flex justify-between">
                        <span>• 통증 없음 (0)</span>
                        <span className="text-green-400 font-bold">100점</span>
                    </div>
                    <div className="flex justify-between">
                        <span>• 통증 심함 (10)</span>
                        <span className="text-red-400 font-bold">0점</span>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* --- Pain Trend Chart --- */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">통증 추이</h3>
            <span className="text-xs text-slate-500">모든 부위 통합 (VAS)</span>
        </div>
        
        <div className="h-64 w-full flex items-center justify-center -ml-2">
            {isLoading ? (
                <div className="text-slate-400">기록 불러오는 중...</div>
            ) : displayData.length === 0 ? (
                <div className="text-slate-400">해당 기간의 데이터가 없습니다.</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 11}} 
                            dy={10}
                        />
                        <YAxis 
                            domain={[0, 10]} 
                            hide 
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                            labelStyle={{ color: '#64748b', marginBottom: '0.5rem' }}
                        />
                        <Legend 
                            wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} 
                            formatter={(value) => <span style={{ color: '#475569', fontWeight: 500 }}>{partNames[value]}</span>}
                        />
                        {Object.keys(partNames).map((partId) => (
                            <Line 
                                key={partId}
                                type="monotone" 
                                dataKey={partId} 
                                stroke={partColors[partId]} 
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
      </div>

      {/* --- Activity Chart --- */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Clock size={18} className="text-blue-500" />
                활동 패턴 분석
            </h3>
            <span className="text-xs text-slate-500">단위: 시간</span>
        </div>
        
        <div className="h-64 w-full flex items-center justify-center -ml-2">
            {displayData.length === 0 ? (
                <div className="text-slate-400">데이터가 없습니다.</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 11}} 
                            dy={10}
                        />
                        <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                        <Bar dataKey="sitting" name="앉기" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="driving" name="운전" stackId="a" fill="#f97316" />
                        <Bar dataKey="standing" name="서기" stackId="a" fill="#22c55e" />
                        <Bar dataKey="sleeping" name="수면" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
      </div>

      {/* --- Exercise Chart --- */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Activity size={18} className="text-red-500" />
                운동 강도 분석
            </h3>
            <span className="text-xs text-slate-500">단위: 분</span>
        </div>
        
        <div className="h-64 w-full flex items-center justify-center -ml-2">
             {displayData.length === 0 ? (
                <div className="text-slate-400">데이터가 없습니다.</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 11}} 
                            dy={10}
                        />
                        <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                        <Bar dataKey="low" name="저강도" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="mid" name="중강도" stackId="a" fill="#eab308" />
                        <Bar dataKey="high" name="고강도" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
      </div>

    </div>
  );
};