import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { PainRecord } from '../types';
import { CheckCircle } from 'lucide-react';
import { dbService } from '../services/firebase';
import { subDays, format, parseISO, differenceInDays } from 'date-fns';

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

export const Survey: React.FC = () => {
  const navigate = useNavigate();
  const { user, selectedParts, upsertPainRecord, painRecords, dailyLog, saveReport, isLoading } = useStore();
  const [currentStep, setCurrentStep] = useState(0);

  // Helper to generate the Heartbeat (Activity) icon as a data URL
  const getActivityIconDataUrl = () => {
    // This SVG matches the 'Activity' icon from lucide-react used in Login.tsx
    // Background: blue-50 (#eff6ff), Stroke: blue-600 (#2563eb)
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">
        <rect width="24" height="24" rx="12" fill="#eff6ff"/>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `.trim();
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // Helper to send notification
  const sendNotification = (title: string, body: string) => {
    if (!('Notification' in window)) return;
    
    const iconUrl = getActivityIconDataUrl();

    if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: iconUrl });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                 new Notification(title, { body, icon: iconUrl });
            }
        });
    }
  };

  if (selectedParts.length === 0) {
     const handleQuickFinish = async () => {
        try {
            const report = {
                userId: user?.uid || 'guest',
                date: dailyLog.date,
                dailyLog,
                painRecords: []
            };
            await saveReport(report);
            navigate('/report');
        } catch (error) {
            console.error(error);
            alert("리포트 저장에 실패했습니다. 인터넷 연결을 확인해주세요.");
        }
     }

     return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">통증 없음</h2>
            <p className="text-slate-500 mb-6">좋은 소식이네요! 오늘은 통증 없는 날로 기록됩니다.</p>
            <button onClick={handleQuickFinish} disabled={isLoading} className="w-full bg-primary text-white h-12 rounded-lg font-bold disabled:opacity-50">
                {isLoading ? '저장 중...' : '완료 및 저장'}
            </button>
        </div>
     )
  }

  const currentPart = selectedParts[currentStep];
  const isLastStep = currentStep === selectedParts.length - 1;

  const [formData, setFormData] = useState<Partial<PainRecord>>({
    history12Months: false,
    workInterference: false,
    recent7Days: false,
    painLevel: 1
  });

  const handleToggle = (field: keyof PainRecord) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSlider = (val: number) => {
    setFormData(prev => ({ ...prev, painLevel: val }));
  };

  const handleNext = async () => {
    const record: PainRecord = {
        partId: currentPart.id,
        side: currentPart.side,
        painLevel: formData.painLevel as number,
        history12Months: formData.history12Months as boolean,
        workInterference: formData.workInterference as boolean,
        recent7Days: formData.recent7Days as boolean
    };
    
    upsertPainRecord(record);

    if (isLastStep) {
        try {
            const finalPainRecords = [...painRecords.filter(p => p.partId !== currentPart.id), record];
            const report = {
                userId: user?.uid || 'guest',
                date: dailyLog.date,
                dailyLog,
                painRecords: finalPainRecords
            };
            
            // 1. Immediate High Pain Alert
            const hasHighPain = finalPainRecords.some(r => r.painLevel >= 7);
            if (hasHighPain) {
                sendNotification('통증 경고', '통증 수치가 높습니다. 전문가와 상담하거나 휴식을 취하세요.');
            }

            // 2. Chronic Pain Check (Last 30 Days)
            if (user?.uid) {
                // Fetch reports from 35 days ago to ensure we cover a full month
                const startDate = format(subDays(parseISO(dailyLog.date), 35), 'yyyy-MM-dd');
                const recentReports = await dbService.fetchRecentReports(user.uid, startDate);
                
                // Check each body part recorded today
                for (const currentRecord of finalPainRecords) {
                    if (currentRecord.painLevel > 0) {
                        // Filter history specifically for this body part with pain > 0
                        const historyForPart = recentReports.filter(h => 
                            h.painRecords.some(p => p.partId === currentRecord.partId && p.painLevel > 0)
                        );
                        
                        // Add today's record context if not already saved/fetched (optimistic check)
                        
                        if (historyForPart.length >= 4) { // At least 4-5 previous records to minimize noise
                            const sortedHistory = historyForPart.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                            const firstRecordDate = parseISO(sortedHistory[0].date);
                            const lastRecordDate = parseISO(dailyLog.date); // Today
                            
                            const spanDays = differenceInDays(lastRecordDate, firstRecordDate);
                            
                            // If pain has persisted for roughly a month (>= 25 days span)
                            if (spanDays >= 25) {
                                const partLabel = partNames[currentRecord.partId];
                                sendNotification(
                                    '만성 통증 알림', 
                                    `${partLabel} 부위의 통증이 한 달간 지속되고 있습니다. 병원 방문을 권장합니다.`
                                );
                                break; // Notify once to avoid spamming for multiple parts
                            }
                        }
                    }
                }
            }

            await saveReport(report);
            navigate('/report');
        } catch (e) {
            console.error(e);
            alert("리포트 저장에 실패했습니다. 인터넷 연결을 확인해주세요.");
        }
    } else {
        setCurrentStep(prev => prev + 1);
        setFormData({
            history12Months: false,
            workInterference: false,
            recent7Days: false,
            painLevel: 1
        });
        window.scrollTo(0, 0);
    }
  };

  return (
    <div className="pb-24">
      <div className="mb-6">
        <div className="flex justify-between items-center text-sm text-slate-500 mb-2">
            <span>설문 진행률</span>
            <span>{currentStep + 1} / {selectedParts.length}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${((currentStep + 1) / selectedParts.length) * 100}%` }}
            />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up border border-slate-100">
        <h2 className="text-xl font-bold capitalize mb-1 text-slate-800">
            {partNames[currentPart.id] || currentPart.id} <span className="text-slate-400 font-normal">({sideNames[currentPart.side]})</span>
        </h2>
        <p className="text-slate-500 mb-6 text-sm">해당 부위에 대해 답변해주세요.</p>

        <div className="space-y-6">
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                <span className="text-sm font-medium text-slate-700 w-3/4">
                    지난 12개월 동안 통증이나 불편함이 있었나요?
                </span>
                <button 
                    onClick={() => handleToggle('history12Months')}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${formData.history12Months ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}
                >
                    {formData.history12Months ? '예' : '아니오'}
                </button>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                <span className="text-sm font-medium text-slate-700 w-3/4">
                    업무나 활동에 지장이 있었나요?
                </span>
                <button 
                    onClick={() => handleToggle('workInterference')}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${formData.workInterference ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}
                >
                    {formData.workInterference ? '예' : '아니오'}
                </button>
            </div>

             <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                <span className="text-sm font-medium text-slate-700 w-3/4">
                    지난 7일 동안 통증이 있었나요?
                </span>
                <button 
                    onClick={() => handleToggle('recent7Days')}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${formData.recent7Days ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}
                >
                    {formData.recent7Days ? '예' : '아니오'}
                </button>
            </div>

            <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-slate-800">현재 통증 정도 (VAS)</span>
                    <span className={`text-2xl font-black ${
                        formData.painLevel! <= 3 ? 'text-green-500' : 
                        formData.painLevel! <= 7 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                        {formData.painLevel}
                    </span>
                </div>
                <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1"
                    value={formData.painLevel}
                    onChange={(e) => handleSlider(Number(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>약함</span>
                    <span>중간</span>
                    <span>심함</span>
                </div>
            </div>
        </div>
      </div>

      <button 
        onClick={handleNext}
        disabled={isLoading}
        className="fixed bottom-20 left-4 right-4 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto h-14 bg-slate-900 text-white text-lg font-bold rounded-xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? '저장 중...' : isLastStep ? '완료 및 리포트 보기' : '다음 부위'}
      </button>
    </div>
  );
};