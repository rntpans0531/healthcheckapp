import React from 'react';
import { BodyPartId, Side, PainRecord } from '../types';
import clsx from 'clsx';

interface BodyMapProps {
  mode: 'select' | 'report';
  selectedParts?: { id: BodyPartId; side: Side }[];
  painRecords?: PainRecord[];
  onPartClick?: (id: BodyPartId, side: Side) => void;
}

const getColor = (level: number) => {
  if (level === 1) return '#3b82f6'; // Blue
  if (level >= 2 && level <= 3) return '#22c55e'; // Green
  if (level >= 4 && level <= 5) return '#eab308'; // Yellow
  if (level >= 6 && level <= 7) return '#f97316'; // Orange
  if (level >= 8 && level <= 9) return '#ef4444'; // Red
  if (level >= 10) return '#7f1d1d'; // Dark Red
  return '#e2e8f0'; // Default Slate-200
};

export const BodyMap: React.FC<BodyMapProps> = ({ mode, selectedParts = [], painRecords = [], onPartClick }) => {
  
  const getFill = (partId: BodyPartId, side: 'left' | 'right' | 'center') => {
    // Report Mode
    if (mode === 'report') {
      const record = painRecords.find(r => r.partId === partId);
      if (!record) return '#f8fafc'; // 아주 연한 회색 (기본 배경)
      
      if (record.side === 'both' || record.side === side || record.side === 'center') {
        return getColor(record.painLevel);
      }
      return '#f8fafc';
    }

    // Select Mode
    const selected = selectedParts.find(p => p.id === partId);
    if (!selected) return '#f8fafc'; // 선택 안됨

    if (selected.side === 'center' || selected.side === 'both') return '#3b82f6'; // 선택됨 (파랑)
    if (selected.side === side) return '#3b82f6';

    return '#f8fafc';
  };

  const handleInteraction = (id: BodyPartId, side: Side) => {
    if (mode === 'select' && onPartClick) {
      onPartClick(id, side);
    }
  };

  // 스타일: 제공된 이미지처럼 깔끔한 라인과 부드러운 호버 효과
  const pathProps = (id: BodyPartId) => ({
    className: clsx(
      "transition-all duration-200 stroke-slate-400 stroke-[1.5]", 
      mode === 'select' ? "cursor-pointer hover:opacity-80 hover:fill-blue-100" : ""
    ),
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const
  });

  return (
    <div className="relative w-full max-w-[300px] mx-auto">
      <svg viewBox="0 0 300 600" className="w-full h-auto drop-shadow-sm">
        <desc>Smooth Contour Body Map</desc>

        {/* --- HEAD (Visual Only) --- */}
        <path
          d="M150 20 C 130 20, 115 40, 115 65 C 115 85, 125 100, 150 100 C 175 100, 185 85, 185 65 C 185 40, 170 20, 150 20 Z"
          fill="#f8fafc"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />

        {/* --- NECK (Group B - Split) --- */}
        <g>
          {/* Left Neck */}
          <path
            onClick={() => handleInteraction('neck', 'left')}
            d="M150 100 L 150 115 L 125 118 L 122 100 Z"
            fill={getFill('neck', 'left')}
            {...pathProps('neck')}
          />
          {/* Right Neck */}
          <path
            onClick={() => handleInteraction('neck', 'right')}
            d="M150 100 L 150 115 L 175 118 L 178 100 Z"
            fill={getFill('neck', 'right')}
            {...pathProps('neck')}
          />
        </g>

        {/* --- SHOULDERS (Group B - Split) --- */}
        <g>
          {/* Left Shoulder */}
          <path
            onClick={() => handleInteraction('shoulder', 'left')}
            d="M125 118 L 150 115 L 150 120 L 90 135 L 85 120 Z"
            fill={getFill('shoulder', 'left')}
            {...pathProps('shoulder')}
          />
          {/* Right Shoulder */}
          <path
            onClick={() => handleInteraction('shoulder', 'right')}
            d="M175 118 L 150 115 L 150 120 L 210 135 L 215 120 Z"
            fill={getFill('shoulder', 'right')}
            {...pathProps('shoulder')}
          />
        </g>

        {/* --- CHEST / UPPER BACK (Group A - Center) --- */}
        {/* 기존 코드의 ID가 'back'이지만 이미지는 앞면이므로 가슴 부위에 매핑 */}
        <g onClick={() => handleInteraction('back', 'center')}>
          <path
            d="M90 135 L 150 120 L 210 135 L 205 200 L 150 210 L 95 200 Z"
            fill={getFill('back', 'center')}
            {...pathProps('back')}
          />
          {/* 가슴 근육 디테일 라인 (장식용) */}
          <path d="M150 120 L 150 210 M 95 200 Q 150 220 205 200" fill="none" stroke="#cbd5e1" strokeWidth="1" className="pointer-events-none" />
        </g>

        {/* --- ARMS (Upper) --- */}
        <g>
          {/* Left Upper Arm (ID: elbow로 매핑 - 기존 로직 유지) */}
          <path
            onClick={() => handleInteraction('elbow', 'left')}
            d="M85 120 L 90 135 L 95 200 L 80 230 L 55 220 L 60 140 Z"
            fill={getFill('elbow', 'left')}
            {...pathProps('elbow')}
          />
          {/* Right Upper Arm */}
          <path
            onClick={() => handleInteraction('elbow', 'right')}
            d="M215 120 L 210 135 L 205 200 L 220 230 L 245 220 L 240 140 Z"
            fill={getFill('elbow', 'right')}
            {...pathProps('elbow')}
          />
        </g>

        {/* --- FOREARMS / HANDS (Group B - Split) --- */}
        <g>
          {/* Left Forearm/Hand */}
          <path
            onClick={() => handleInteraction('hand_wrist', 'left')}
            d="M80 230 L 55 220 L 45 300 L 30 330 L 60 340 L 85 235 Z"
            fill={getFill('hand_wrist', 'left')}
            {...pathProps('hand_wrist')}
          />
          {/* Right Forearm/Hand */}
          <path
            onClick={() => handleInteraction('hand_wrist', 'right')}
            d="M220 230 L 245 220 L 255 300 L 270 330 L 240 340 L 215 235 Z"
            fill={getFill('hand_wrist', 'right')}
            {...pathProps('hand_wrist')}
          />
        </g>

        {/* --- ABS / WAIST (Group A - Center) --- */}
        <g onClick={() => handleInteraction('waist', 'center')}>
          <path
            d="M95 200 L 150 210 L 205 200 L 200 260 L 150 280 L 100 260 Z"
            fill={getFill('waist', 'center')}
            {...pathProps('waist')}
          />
           {/* 복근 디테일 라인 (장식용) */}
           <path d="M150 210 L 150 280 M 100 260 Q 150 290 200 260" fill="none" stroke="#cbd5e1" strokeWidth="1" className="pointer-events-none" />
        </g>

        {/* --- HIPS / THIGHS (Group B - Split) --- */}
        <g>
          {/* Left Thigh */}
          <path
            onClick={() => handleInteraction('hip_thigh', 'left')}
            d="M100 260 L 150 280 L 150 300 L 140 380 L 95 370 L 90 280 Z"
            fill={getFill('hip_thigh', 'left')}
            {...pathProps('hip_thigh')}
          />
          {/* Right Thigh */}
          <path
            onClick={() => handleInteraction('hip_thigh', 'right')}
            d="M200 260 L 150 280 L 150 300 L 160 380 L 205 370 L 210 280 Z"
            fill={getFill('hip_thigh', 'right')}
            {...pathProps('hip_thigh')}
          />
        </g>

        {/* --- KNEES (Group B - Split) --- */}
        <g>
          {/* Left Knee */}
          <path
            onClick={() => handleInteraction('knee', 'left')}
            d="M95 370 L 140 380 L 138 420 L 98 410 Z"
            fill={getFill('knee', 'left')}
            {...pathProps('knee')}
          />
          {/* Right Knee */}
          <path
            onClick={() => handleInteraction('knee', 'right')}
            d="M205 370 L 160 380 L 162 420 L 202 410 Z"
            fill={getFill('knee', 'right')}
            {...pathProps('knee')}
          />
        </g>

        {/* --- SHINS / FEET (Group B - Split) --- */}
        <g>
          {/* Left Shin/Foot */}
          <path
            onClick={() => handleInteraction('ankle_foot', 'left')}
            d="M98 410 L 138 420 L 135 500 L 145 530 L 105 530 L 100 480 Z"
            fill={getFill('ankle_foot', 'left')}
            {...pathProps('ankle_foot')}
          />
          {/* Right Shin/Foot */}
          <path
            onClick={() => handleInteraction('ankle_foot', 'right')}
            d="M202 410 L 162 420 L 165 500 L 155 530 L 195 530 L 200 480 Z"
            fill={getFill('ankle_foot', 'right')}
            {...pathProps('ankle_foot')}
          />
        </g>
      </svg>
      
      {/* 라벨 (절대 위치로 배치) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {/* 필요하다면 여기에 텍스트 라벨 추가 가능 (기존 방식처럼 SVG 내부에 넣어도 되지만, 깔끔함을 위해 제거하거나 별도 레이어로 추천) */}
      </div>
    </div>
  );
};