export type Side = 'left' | 'right' | 'both' | 'center';

export type BodyPartId = 
  | 'neck' 
  | 'shoulder' 
  | 'back' 
  | 'waist' 
  | 'elbow' 
  | 'hand_wrist' 
  | 'hip_thigh' 
  | 'knee' 
  | 'ankle_foot';

export interface BodyPartDefinition {
  id: BodyPartId;
  label: string;
  group: 'A' | 'B'; // A: Center (Single), B: Side (Left/Right/Both)
}

export interface SelectedPart {
  id: BodyPartId;
  side: Side;
}

export interface PainRecord {
  partId: BodyPartId;
  side: Side;
  painLevel: number; // 1-10
  history12Months: boolean;
  workInterference: boolean;
  recent7Days: boolean;
}

export interface DailyLogData {
  date: string;
  times: {
    sitting: number;
    sleeping: number;
    driving: number;
    standing: number;
  };
  exercise: {
    high: number;
    mid: number;
    low: number;
  };
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface FullReport {
  id?: string;
  userId: string;
  date: string; // ISO
  dailyLog: DailyLogData;
  painRecords: PainRecord[];
}