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
      if (!record) return '#f1f5f9'; // Slate-100 for empty in report
      
      if (record.side === 'both' || record.side === side || record.side === 'center') {
        return getColor(record.painLevel);
      }
      return '#f1f5f9';
    }

    // Select Mode
    const selected = selectedParts.find(p => p.id === partId);
    if (!selected) return '#f1f5f9'; // Slate-100 for unselected

    if (selected.side === 'center' || selected.side === 'both') return '#3b82f6'; // Active Blue
    if (selected.side === side) return '#3b82f6';

    return '#f1f5f9';
  };

  const handleInteraction = (id: BodyPartId, side: Side) => {
    if (mode === 'select' && onPartClick) {
      onPartClick(id, side);
    }
  };

  // Common polygon props for clean look with rounded corners (fillet effect)
  const polyProps = (id: BodyPartId) => ({
    className: clsx(
      "transition-all duration-200 stroke-white stroke-[4]", // Increased stroke width for better rounding
      mode === 'select' ? "cursor-pointer hover:opacity-80 hover:stroke-blue-200" : ""
    ),
    strokeLinejoin: "round" as const // This creates the rounded corner effect
  });

  // Labels configuration
  const labels = [
    { text: '목', y: 72, lineStart: 180 },
    { text: '어깨', y: 105, lineStart: 220 },
    { text: '등', y: 140, lineStart: 185 },
    { text: '팔꿈치', y: 170, lineStart: 230 },
    { text: '허리', y: 205, lineStart: 180 },
    { text: '손/손목', y: 235, lineStart: 220 },
    { text: '엉덩이/허벅지', y: 270, lineStart: 195 },
    { text: '무릎', y: 330, lineStart: 185 },
    { text: '발/발목', y: 380, lineStart: 185 },
  ];

  return (
    <svg viewBox="0 0 360 450" className="w-full h-full max-h-[450px] drop-shadow-xl mx-auto bg-transparent rounded-xl">
      <desc>Compact polygon body map with labels</desc>
      
      {/* --- HEAD (Visual Only) --- */}
      <circle cx="150" cy="40" r="25" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />

      {/* --- NECK & TRAPS (Group B - Split) --- */}
      <g>
        {/* Left */}
        <polygon 
          onClick={() => handleInteraction('neck', 'left')}
          points="130,60 150,60 150,85 115,85" 
          fill={getFill('neck', 'left')}
          {...polyProps('neck')}
        />
        {/* Right */}
        <polygon 
          onClick={() => handleInteraction('neck', 'right')}
          points="150,60 170,60 185,85 150,85" 
          fill={getFill('neck', 'right')}
          {...polyProps('neck')}
        />
      </g>

      {/* --- SHOULDERS (Group B - Split) --- */}
      <g>
        {/* Left */}
        <polygon 
          onClick={() => handleInteraction('shoulder', 'left')}
          points="115,85 75,95 80,130 115,130" 
          fill={getFill('shoulder', 'left')} 
          {...polyProps('shoulder')}
        />
        {/* Right */}
        <polygon 
          onClick={() => handleInteraction('shoulder', 'right')}
          points="185,85 225,95 220,130 185,130" 
          fill={getFill('shoulder', 'right')} 
          {...polyProps('shoulder')}
        />
      </g>

      {/* --- BACK (Group A - Center) --- */}
      <g onClick={() => handleInteraction('back', 'center')}>
        <polygon 
          points="115,85 185,85 185,130 175,190 125,190 115,130" 
          fill={getFill('back', 'center')} 
          {...polyProps('back')}
        />
      </g>

      {/* --- WAIST (Group A - Center) --- */}
      <g onClick={() => handleInteraction('waist', 'center')}>
        <polygon 
          points="125,190 175,190 180,215 120,215" 
          fill={getFill('waist', 'center')} 
          {...polyProps('waist')}
        />
      </g>

      {/* --- HIPS / THIGHS (Group B - Split) --- */}
      <g>
        {/* Left */}
        <polygon 
          onClick={() => handleInteraction('hip_thigh', 'left')}
          points="120,215 150,215 150,310 110,310 100,245" 
          fill={getFill('hip_thigh', 'left')} 
          {...polyProps('hip_thigh')}
        />
        {/* Right */}
        <polygon 
          onClick={() => handleInteraction('hip_thigh', 'right')}
          points="180,215 150,215 150,310 190,310 200,245" 
          fill={getFill('hip_thigh', 'right')} 
          {...polyProps('hip_thigh')}
        />
      </g>

      {/* --- ARMS / ELBOW (Group B - Split) --- */}
      <g>
        {/* Left */}
        <polygon 
          onClick={() => handleInteraction('elbow', 'left')}
          points="80,130 115,130 110,190 65,190" 
          fill={getFill('elbow', 'left')} 
          {...polyProps('elbow')}
        />
        {/* Right */}
        <polygon 
          onClick={() => handleInteraction('elbow', 'right')}
          points="220,130 185,130 190,190 235,190" 
          fill={getFill('elbow', 'right')} 
          {...polyProps('elbow')}
        />
      </g>

      {/* --- HANDS / WRISTS (Group B - Split) --- */}
      <g>
        {/* Left */}
        <polygon 
          onClick={() => handleInteraction('hand_wrist', 'left')}
          points="65,190 110,190 98,260 77,260" 
          fill={getFill('hand_wrist', 'left')} 
          {...polyProps('hand_wrist')}
        />
        {/* Right */}
        <polygon 
          onClick={() => handleInteraction('hand_wrist', 'right')}
          points="235,190 190,190 202,260 223,260" 
          fill={getFill('hand_wrist', 'right')} 
          {...polyProps('hand_wrist')}
        />
      </g>

      {/* --- KNEES (Group B - Split) --- */}
      <g>
        {/* Left */}
        <polygon 
          onClick={() => handleInteraction('knee', 'left')}
          points="110,310 150,310 150,350 115,350" 
          fill={getFill('knee', 'left')} 
          {...polyProps('knee')}
        />
        {/* Right */}
        <polygon 
          onClick={() => handleInteraction('knee', 'right')}
          points="190,310 150,310 150,350 185,350" 
          fill={getFill('knee', 'right')} 
          {...polyProps('knee')}
        />
      </g>

      {/* --- ANKLES / FEET (Group B - Split) --- */}
      <g>
        {/* Left */}
        <polygon 
          onClick={() => handleInteraction('ankle_foot', 'left')}
          points="115,350 150,350 145,400 105,405 105,380" 
          fill={getFill('ankle_foot', 'left')} 
          {...polyProps('ankle_foot')}
        />
        {/* Right */}
        <polygon 
          onClick={() => handleInteraction('ankle_foot', 'right')}
          points="185,350 150,350 155,400 195,405 195,380" 
          fill={getFill('ankle_foot', 'right')} 
          {...polyProps('ankle_foot')}
        />
      </g>

      {/* --- LABELS --- */}
      <g className="select-none pointer-events-none">
        {labels.map((l, i) => (
          <React.Fragment key={i}>
            <text 
              x="350" 
              y={l.y + 4} 
              textAnchor="end" 
              className="font-bold fill-slate-500"
              style={{ fontSize: '12px' }}
            >
              {l.text}
            </text>
            <line 
              x1={l.lineStart} 
              y1={l.y} 
              x2="270" 
              y2={l.y} 
              stroke="#cbd5e1" 
              strokeWidth="1" 
              strokeDasharray="2 2"
            />
          </React.Fragment>
        ))}
      </g>
    </svg>
  );
};