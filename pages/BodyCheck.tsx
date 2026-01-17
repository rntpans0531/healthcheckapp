import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BodyMap } from '../components/BodyMap';
import { BodyPartId, Side } from '../types';

export const BodyCheck: React.FC = () => {
  const navigate = useNavigate();
  const { selectedParts, togglePart, resetParts } = useStore();
  
  const handlePartClick = (id: BodyPartId, side: Side) => {
    // Direct Toggle for all parts
    togglePart(id, side);
  };

  const handleNext = () => {
    if (selectedParts.length === 0) {
      // Allow proceeding with no parts (implicit "No Pain" scenario)
    }
    navigate('/survey');
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">어디가 불편하신가요?</h2>
          <p className="text-sm text-slate-500">통증 부위를 탭하여 선택해주세요</p>
        </div>
        <button 
          onClick={resetParts}
          className="text-sm text-slate-400 hover:text-danger px-3 py-1"
        >
          초기화
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-inner p-4 overflow-hidden relative">
        <BodyMap 
          mode="select" 
          selectedParts={selectedParts} 
          onPartClick={handlePartClick} 
        />
      </div>

      <div className="mt-4 pb-4">
         <button 
          onClick={handleNext}
          className="w-full h-14 bg-primary text-white text-lg font-bold rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          {selectedParts.length > 0 ? `${selectedParts.length}개 부위 분석하기` : '통증 없음 / 계속하기'}
        </button>
      </div>
    </div>
  );
};