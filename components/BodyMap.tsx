import React from 'react';
import { BodyPartId, Side, PainRecord } from '../types';
import clsx from 'clsx';

interface BodyMapProps {
  mode: 'select' | 'report';
  selectedParts?: { id: BodyPartId; side: Side }[];
  painRecords?: PainRecord[];
  onPartClick?: (id: BodyPartId, side: Side) => void;
}

// 색상 팔레트
const getColor = (level: number) => {
  if (level === 1) return '#60a5fa'; 
  if (level >= 2 && level <= 3) return '#4ade80';
  if (level >= 4 && level <= 5) return '#facc15';
  if (level >= 6 && level <= 7) return '#fb923c'; 
  if (level >= 8 && level <= 9) return '#f87171';
  if (level >= 10) return '#dc2626';
  return '#f1f5f9';
};

export const BodyMap: React.FC<BodyMapProps> = ({ mode, selectedParts = [], painRecords = [], onPartClick }) => {
  
  // 선택 여부 확인 헬퍼 함수
  const isSelected = (partId: BodyPartId, side: 'left' | 'right' | 'center') => {
    return selectedParts.some(p => p.id === partId && (p.side === side || p.side === 'both' || p.side === 'center'));
  };

  const getFill = (partId: BodyPartId, side: 'left' | 'right' | 'center') => {
    // Report Mode
    if (mode === 'report') {
      const record = painRecords.find(r => r.partId === partId);
      if (!record) return '#f8fafc';
      
      if (record.side === 'both' || record.side === side || record.side === 'center') {
        return getColor(record.painLevel);
      }
      return '#f8fafc';
    }

    // Select Mode
    if (isSelected(partId, side)) return '#93c5fd'; // 선택됨 (즉시 파란색)

    return '#f8fafc'; // 기본
  };

  const handleInteraction = (id: BodyPartId, side: Side) => {
    if (mode === 'select' && onPartClick) {
      onPartClick(id, side);
    }
  };

  // ★ 여기가 핵심 수정 사항 ★
  // "선택되지 않았을 때만" 호버 효과(연한 파랑)를 줍니다.
  // 선택된 상태면 호버 효과를 꺼버려서 색깔 싸움을 막습니다.
  const pathProps = (id: BodyPartId, side: 'left' | 'right' | 'center') => {
    const selected = isSelected(id, side);
    return {
      className: clsx(
        "transition-all duration-200 ease-in-out stroke-slate-300 stroke-[1.5]", 
        mode === 'select' 
          ? selected 
            ? "cursor-pointer" // 선택됨: 커서만 손가락, 호버 색상 변경 없음 (파란색 유지)
            : "cursor-pointer hover:fill-blue-50" // 선택안됨: 마우스 올리면 연한 색
          : ""
      ),
      strokeLinejoin: "round" as const,
      strokeLinecap: "round" as const
    };
  };

  return (
    <div className="relative w-full max-w-[300px] mx-auto py-4">
      <svg viewBox="0 0 300 600" className="w-full h-auto drop-shadow-sm">
        <desc>Refined Organic Body Map</desc>

        {/* --- HEAD --- */}
        <path
          d="M150 35 C 132 35, 122 50, 122 70 C 122 90, 132 105, 150 105 C 168 105, 178 90, 178 70 C 178 50, 168 35, 150 35 Z"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />

        {/* --- NECK --- */}
        <g>
          <path // Left
            onClick={() => handleInteraction('neck', 'left')}
            d="M150 105 C 142 105, 138 108, 132 115 C 134 125, 136 132, 150 135 Z"
            fill={getFill('neck', 'left')} {...pathProps('neck', 'left')}
          />
          <path // Right
            onClick={() => handleInteraction('neck', 'right')}
            d="M150 105 C 158 105, 162 108, 168 115 C 166 125, 164 132, 150 135 Z"
            fill={getFill('neck', 'right')} {...pathProps('neck', 'right')}
          />
        </g>

        {/* --- SHOULDERS --- */}
        <g>
          <path // Left
            onClick={() => handleInteraction('shoulder', 'left')}
            d="M132 115 C 115 118, 95 122, 85 135 C 90 150, 100 155, 150 140 C 145 132, 138 120, 132 115 Z"
            fill={getFill('shoulder', 'left')} {...pathProps('shoulder', 'left')}
          />
          <path // Right
            onClick={() => handleInteraction('shoulder', 'right')}
            d="M168 115 C 185 118, 205 122, 215 135 C 210 150, 200 155, 150 140 C 155 132, 162 120, 168 115 Z"
            fill={getFill('shoulder', 'right')} {...pathProps('shoulder', 'right')}
          />
        </g>

        {/* --- CHEST --- */}
        <g onClick={() => handleInteraction('back', 'center')}>
          <path
            d="M150 140 C 125 145, 100 150, 95 160 C 100 185, 105 215, 150 225 C 195 215, 200 185, 205 160 C 200 150, 175 145, 150 140 Z"
            fill={getFill('back', 'center')} {...pathProps('back', 'center')}
          />
        </g>

        {/* --- ARMS --- */}
        <g>
          <path // Left
            onClick={() => handleInteraction('elbow', 'left')}
            d="M85 135 C 75 155, 70 195, 75 225 C 90 220, 100 215, 95 160 C 92 150, 88 140, 85 135 Z"
            fill={getFill('elbow', 'left')} {...pathProps('elbow', 'left')}
          />
          <path // Right
            onClick={() => handleInteraction('elbow', 'right')}
            d="M215 135 C 225 155, 230 195, 225 225 C 210 220, 200 215, 205 160 C 208 150, 212 140, 215 135 Z"
            fill={getFill('elbow', 'right')} {...pathProps('elbow', 'right')}
          />
        </g>

        {/* --- FOREARMS / HANDS --- */}
        <g>
          <path // Left
            onClick={() => handleInteraction('hand_wrist', 'left')}
            d="M75 225 C 70 255, 65 295, 45 335 C 35 345, 50 355, 65 350 C 80 345, 95 335, 90 225 C 85 222, 80 222, 75 225 Z"
            fill={getFill('hand_wrist', 'left')} {...pathProps('hand_wrist', 'left')}
          />
          <path // Right
            onClick={() => handleInteraction('hand_wrist', 'right')}
            d="M225 225 C 230 255, 235 295, 255 335 C 265 345, 250 355, 235 350 C 220 345, 205 335, 210 225 C 215 222, 220 222, 225 225 Z"
            fill={getFill('hand_wrist', 'right')} {...pathProps('hand_wrist', 'right')}
          />
        </g>

        {/* --- ABS / WAIST --- */}
        <g onClick={() => handleInteraction('waist', 'center')}>
          <path
            d="M150 225 C 125 230, 110 235, 105 270 C 125 285, 150 290, 150 290 C 150 290, 175 285, 195 270 C 190 235, 175 230, 150 225 Z"
            fill={getFill('waist', 'center')} {...pathProps('waist', 'center')}
          />
        </g>

        {/* --- HIPS / THIGHS --- */}
        <g>
          <path // Left
            onClick={() => handleInteraction('hip_thigh', 'left')}
            d="M105 270 C 95 300, 90 350, 100 400 C 120 395, 135 390, 145 395 C 150 350, 145 300, 150 290 C 130 285, 120 280, 105 270 Z"
            fill={getFill('hip_thigh', 'left')} {...pathProps('hip_thigh', 'left')}
          />
          <path // Right
            onClick={() => handleInteraction('hip_thigh', 'right')}
            d="M195 270 C 205 300, 210 350, 200 400 C 180 395, 165 390, 155 395 C 150 350, 155 300, 150 290 C 170 285, 180 280, 195 270 Z"
            fill={getFill('hip_thigh', 'right')} {...pathProps('hip_thigh', 'right')}
          />
        </g>

        {/* --- KNEES --- */}
        <g>
          <path // Left
            onClick={() => handleInteraction('knee', 'left')}
            d="M100 400 C 102 420, 105 435, 110 445 C 125 440, 140 435, 142 445 C 145 420, 140 405, 145 395 C 130 395, 115 398, 100 400 Z"
            fill={getFill('knee', 'left')} {...pathProps('knee', 'left')}
          />
          <path // Right
            onClick={() => handleInteraction('knee', 'right')}
            d="M200 400 C 198 420, 195 435, 190 445 C 175 440, 160 435, 158 445 C 155 420, 160 405, 155 395 C 170 395, 185 398, 200 400 Z"
            fill={getFill('knee', 'right')} {...pathProps('knee', 'right')}
          />
        </g>

        {/* --- SHINS / FEET --- */}
        <g>
          <path // Left
            onClick={() => handleInteraction('ankle_foot', 'left')}
            d="M110 445 C 115 480, 120 520, 110 545 C 120 560, 145 560, 155 545 C 150 500, 145 460, 142 445 C 130 440, 120 442, 110 445 Z"
            fill={getFill('ankle_foot', 'left')} {...pathProps('ankle_foot', 'left')}
          />
          <path // Right
            onClick={() => handleInteraction('ankle_foot', 'right')}
            d="M190 445 C 185 480, 180 520, 190 545 C 180 560, 155 560, 145 545 C 150 500, 155 460, 158 445 C 170 440, 180 442, 190 445 Z"
            fill={getFill('ankle_foot', 'right')} {...pathProps('ankle_foot', 'right')}
          />
        </g>
      </svg>
    </div>
  );
};