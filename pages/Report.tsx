import React from 'react';
import { useStore } from '../store/useStore';
import { BodyMap } from '../components/BodyMap';
import { useNavigate } from 'react-router-dom';

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

const sideNames: Record<string, string> = {
  left: '왼쪽',
  right: '오른쪽',
  both: '양쪽',
  center: '중앙'
};

export const Report: React.FC = () => {
  const navigate = useNavigate();
  const { painRecords, dailyLog } = useStore();

  const getRiskLevel = (level: number) => {
    if (level >= 8) return { text: '위험', color: 'text-red-600' };
    if (level >= 6) return { text: '주의', color: 'text-orange-500' };
    if (level >= 4) return { text: '보통', color: 'text-yellow-600' };
    return { text: '안전', color: 'text-green-600' };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">일일 리포트</h2>
        <p className="text-slate-500">{dailyLog.date}</p>
        
        <div className="mt-6 flex justify-center">
             <div className="w-64 h-96 relative">
                 <BodyMap mode="report" painRecords={painRecords} />
                 {/* Legend Overlay */}
                 <div className="absolute bottom-0 right-0 bg-white/90 backdrop-blur text-[10px] p-2 rounded-lg shadow border border-slate-200">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> 안전 (1)</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> 정상 (2-3)</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> 보통 (4-5)</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> 주의 (6-7)</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> 심각 (8-9)</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-900"></div> 위험 (10)</div>
                 </div>
             </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold mb-4">요약</h3>
        {painRecords.length === 0 ? (
            <p className="text-slate-500 text-center py-4">오늘 기록된 통증이 없습니다. 수고하셨습니다!</p>
        ) : (
            <div className="space-y-3">
                {painRecords.map((record, idx) => {
                    const risk = getRiskLevel(record.painLevel);
                    return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                                <span className="font-bold capitalize text-slate-700">{partNames[record.partId] || record.partId}</span>
                                <span className="text-xs text-slate-500 ml-2 uppercase">({sideNames[record.side]})</span>
                            </div>
                            <div className="text-right">
                                <div className={`font-bold ${risk.color}`}>{risk.text} ({record.painLevel})</div>
                                {record.workInterference && <div className="text-[10px] text-red-400">업무 지장 있음</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      <div className="pb-8">
        <button 
            onClick={() => navigate('/dashboard')}
            className="w-full h-12 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
        >
            대시보드 보기
        </button>
      </div>
    </div>
  );
};