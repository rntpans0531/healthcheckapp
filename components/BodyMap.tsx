import React from 'react';
import { BodyPartId, Side, PainRecord } from '../types';
import clsx from 'clsx';

interface BodyMapProps {
  mode: 'select' | 'report';
  selectedParts?: { id: BodyPartId; side: Side }[];
  painRecords?: PainRecord[];
  onPartClick?: (id: BodyPartId, side: Side) => void;
}

// 색상 팔레트 (조금 더 부드러운 톤으로 조정 가능)
const getColor = (level: number) => {
  if (level === 1) return '#60a5fa'; // Soft Blue
  if (level >= 2 && level <= 3) return '#4ade80'; // Soft Green
  if (level >= 4 && level <= 5) return '#facc15'; // Soft Yellow
  if (level >= 6 && level <= 7) return '#fb923c'; // Soft Orange
  if (level >= 8 && level <= 9) return '#f87171'; // Soft Red
  if (level >= 10) return '#dc2626'; // Deep Soft Red
  return '#f1f5f9'; // Default soft gray
};

export const BodyMap: React.FC<BodyMapProps> = ({ mode, selectedParts = [], painRecords = [], onPartClick }) => {
  
  const getFill = (partId: BodyPartId, side: 'left' | 'right' | 'center') => {
    // Report Mode
    if (mode === 'report') {
      const record = painRecords.find(r => r.partId === partId);
      if (!record) return '#f8fafc'; // 아주 연한 회색 배경
      
      if (record.side === 'both' || record.side === side || record.side === 'center') {
        return getColor(record.painLevel);
      }
      return '#f8fafc';
    }

    // Select Mode
    const selected = selectedParts.find(p => p.id === partId);
    if (!selected) return '#f8fafc'; // 기본 상태

    if (selected.side === 'center' || selected.side === 'both') return '#93c5fd'; // 선택됨 (부드러운 파랑)
    if (selected.side === side) return '#93c5fd';

    return '#f8fafc';
  };

  const handleInteraction = (id: BodyPartId, side: Side) => {
    if (mode === 'select' && onPartClick) {
      onPartClick(id, side);
    }
  };

  // 스타일: 테두리를 더 연하게 하고(slate-300), 부드러운 호버 효과 적용
  const pathProps = (id: BodyPartId) => ({
    className: clsx(
      "transition-all duration-300 ease-in-out stroke-slate-300 stroke-[1.5]", 
      mode === 'select' ? "cursor-pointer hover:fill-blue-50" : ""
    ),
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const
  });

  return (
    <div className="relative w-full max-w-[300px] mx-auto py-4">
      {/* SVG 뷰박스를 약간 늘려서 여유 공간 확보 */}
      <svg viewBox="0 -10 300 620" className="w-full h-auto drop-shadow-sm">
        <desc>Organic Soft Body Map</desc>

        {/* --- HEAD (Visual Only - 더 둥글게) --- */}
        <path
          d="M150 25 C 125 25, 110 45, 110 70 C 110 95, 125 110, 150 110 C 175 110, 190 95, 190 70 C 190 45, 175 25, 150 25 Z"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />

        {/* --- NECK (부드러운 연결) --- */}
        <g>
          <path // Left
            onClick={() => handleInteraction('neck', 'left')}
            d="M150 110 C 140 110, 135 112, 128 118 C 130 130, 132 135, 150 135 Z"
            fill={getFill('neck', 'left')} {...pathProps('neck')}
          />
          <path // Right
            onClick={() => handleInteraction('neck', 'right')}
            d="M150 110 C 160 110, 165 112, 172 118 C 170 130, 168 135, 150 135 Z"
            fill={getFill('neck', 'right')} {...pathProps('neck')}
          />
        </g>

        {/* --- SHOULDERS (둥근 어깨 라인) --- */}
        <g>
          <path // Left
            onClick={() => handleInteraction('shoulder', 'left')}
            d="M128 118 C 110 120, 90 125, 80 140 C 85 155, 95 150, 150 135 C 145 128, 135 122, 128 118 Z"
            fill={getFill('shoulder', 'left')} {...pathProps('shoulder')}
          />
          <path // Right
            onClick={() => handleInteraction('shoulder', 'right')}
            d="M172 118 C 190 120, 210 125, 220 140 C 215 155, 205 150, 150 135 C 155 128, 165 122, 172 118 Z"
            fill={getFill('shoulder', 'right')} {...pathProps('shoulder')}
          />
        </g>

        {/* --- CHEST (가슴 근육 표현) --- */}
        <g onClick={() => handleInteraction('back', 'center')}>
          <path
            d="M150 135 C 120 140, 95 145, 90 155 C 95 180, 100 210, 150 220 C 200 210, 205 180, 210 155 C 205 145, 180 140, 150 135 Z"
            fill={getFill('back', 'center')} {...pathProps('back')}
          />
        </g>

        {/* --- ARMS (Upper - 알통 표현) --- */}
        <g>
          <path // Left
            onClick={() => handleInteraction('elbow', 'left')}
            d="M80 140 C 70 160, 65 200, 70 230 C 85 225, 95 220, 90 155 C 85 145, 82 142, 80 140 Z"
            fill={getFill('elbow', 'left')} {...pathProps('elbow')}
          />
          <path // Right
            onClick={() => handleInteraction('elbow', 'right')}
            d="M220 140 C 230 160, 235 200, 230 230 C 215 225, 205 220, 210 155 C 215 145, 218 142, 220 140 Z"
            fill={getFill('elbow', 'right')} {...pathProps('elbow')}
          />
        </g>

        {/* --- FOREARMS / HANDS (팔뚝 곡선) --- */}
        <g>
          <path // Left
            onClick={() => handleInteraction('hand_wrist', 'left')}
            d="M70 230 C 65 260, 60 300, 40 340 C 55 350, 70 345, 85 330 C 90 280, 85 240, 70 230 Z"
            fill={getFill('hand_wrist', 'left')} {...pathProps('hand_wrist')}
          />
          <path // Right
            onClick={() => handleInteraction('hand_wrist', 'right')}
            d="M230 230 C 235 260, 240 300, 260 340 C 245 350, 230 345, 215 330 C 210 280, 215 240, 230 230 Z"
            fill={getFill('hand_wrist', 'right')} {...pathProps('hand_wrist')}
          />
        </g>

        {/* --- ABS / WAIST (허리 라인) --- */}
        <g onClick={() => handleInteraction('waist', 'center')}>
          <path
            d="M150 220 C 120 225, 105 230, 100 270 C 120 285, 150 290, 150 290 C 150 290, 180 285, 200 270 C 195 230, 180 225, 150 220 Z"
            fill={getFill('waist', 'center')} {...pathProps('waist')}
          />
        </g>

        {/* --- HIPS / THIGHS (허벅지 근육) --- */}
        <g>
          <path // Left
            onClick={() => handleInteraction('hip_thigh', 'left')}
            d="M100 270 C 90 300, 85 350, 95 400 C 115 395, 135 390, 145 395 C 150 350, 145 300, 150 290 C 130 285, 115 280, 100 270 Z"
            fill={getFill('hip_thigh', 'left')} {...pathProps('hip_thigh')}
          />
          <path // Right
            onClick={() => handleInteraction('hip_thigh', 'right')}
            d="M200 270 C 210 300, 215 350, 205 400 C 185 395, 165 390, 155 395 C 150 350, 155 300, 150 290 C 170 285, 185 280, 200 270 Z"
            fill={getFill('hip_thigh', 'right')} {...pathProps('hip_thigh')}
          />
        </g>

        {/* --- KNEES (둥근 무릎) --- */}
        <g>
          <path // Left
            onClick={() => handleInteraction('knee', 'left')}
            d="M95 400 C 98 420, 100 435, 105 445 C 125 440, 140 435, 142 445 C 145 420, 140 405, 145 395 C 130 395, 110 398, 95 400 Z"
            fill={getFill('knee', 'left')} {...pathProps('knee')}
          />
          <path // Right
            onClick={() => handleInteraction('knee', 'right')}
            d="M205 400 C 202 420, 200 435, 195 445 C 175 440, 160 435, 158 445 C 155 420, 160 405, 155 395 C 170 395, 190 398, 205 400 Z"
            fill={getFill('knee', 'right')} {...pathProps('knee')}
          />
        </g>

        {/* --- SHINS / FEET (종아리 곡선) --- */}
        <g>
          <path // Left
            onClick={() => handleInteraction('ankle_foot', 'left')}
            d="M105 445 C 110 480, 115 520, 105 550 C 120 560, 140 555, 150 550 C 145 500, 140 460, 142 445 C 130 440, 115 442, 105 445 Z"
            fill={getFill('ankle_foot', 'left')} {...pathProps('ankle_foot')}
          />
          <path // Right
            onClick={() => handleInteraction('ankle_foot', 'right')}
            d="M195 445 C 190 480, 185 520, 195 550 C 180 560, 160 555, 150 550 C 155 500, 160 460, 158 445 C 170 440, 185 442, 195 445 Z"
            fill={getFill('ankle_foot', 'right')} {...pathProps('ankle_foot')}
          />
        </g>
      </svg>
    </div>
  );
};