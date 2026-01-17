import { create } from 'zustand';
import { User, DailyLogData, SelectedPart, PainRecord, BodyPartId, FullReport } from '../types';
import { format } from 'date-fns';
import { dbService } from '../services/firebase';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  error: string | null;

  // Daily Log State
  dailyLog: DailyLogData;
  setDailyLog: (data: Partial<DailyLogData>) => void;
  loadReportForDate: (date: string) => Promise<void>;

  // Body Check State
  selectedParts: SelectedPart[];
  togglePart: (partId: BodyPartId, side: 'left' | 'right' | 'both' | 'center') => void;
  removePart: (partId: BodyPartId) => void;
  resetParts: () => void;

  // Survey State
  painRecords: PainRecord[];
  upsertPainRecord: (record: PainRecord) => void;
  
  // History for Dashboard
  reports: FullReport[];
  fetchHistory: (userId: string) => Promise<void>;
  saveReport: (report: FullReport) => Promise<void>;
}

const initialDailyLog: DailyLogData = {
  date: format(new Date(), 'yyyy-MM-dd'),
  times: { sitting: 0, sleeping: 0, driving: 0, standing: 0 },
  exercise: { high: 0, mid: 0, low: 0 }
};

export const useStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  isLoading: false,
  error: null,

  dailyLog: initialDailyLog,
  setDailyLog: (data) => set((state) => ({ 
    dailyLog: { ...state.dailyLog, ...data } 
  })),
  loadReportForDate: async (date) => {
    const { user } = get();
    if (!user) {
        // Just update date if no user logged in yet
        set(state => ({ dailyLog: { ...state.dailyLog, date }}));
        return;
    }

    set({ isLoading: true });
    try {
        const report = await dbService.fetchReportByDate(user.uid, date);
        if (report) {
            // Found existing report: Load it
            set({
                dailyLog: report.dailyLog,
                painRecords: report.painRecords,
                // Reconstruct selected parts from pain records for the BodyCheck UI
                selectedParts: report.painRecords.map(r => ({
                    id: r.partId,
                    side: r.side
                }))
            });
        } else {
            // No report: Reset for new entry (keep user selected date)
            set({
                dailyLog: {
                    date: date,
                    times: { sitting: 0, sleeping: 0, driving: 0, standing: 0 },
                    exercise: { high: 0, mid: 0, low: 0 }
                },
                painRecords: [],
                selectedParts: []
            });
        }
    } catch (e: any) {
        console.error(e);
        set({ error: e.message || "Failed to load report" });
    } finally {
        set({ isLoading: false });
    }
  },

  selectedParts: [],
  togglePart: (partId, side) => set((state) => {
    const existingIndex = state.selectedParts.findIndex(p => p.id === partId);
    
    // If not selected yet, add it
    if (existingIndex === -1) {
      return { selectedParts: [...state.selectedParts, { id: partId, side }] };
    }

    const existingPart = state.selectedParts[existingIndex];
    const newSelectedParts = [...state.selectedParts];

    // Logic for toggling sides
    
    // 1. Center parts (Back, Waist, Neck) simply toggle on/off
    if (side === 'center') {
      newSelectedParts.splice(existingIndex, 1);
      return { selectedParts: newSelectedParts };
    }

    // 2. Bilateral parts logic
    if (existingPart.side === 'center') {
      // Should rare/not happen for bilateral parts, but replace if so
      newSelectedParts[existingIndex] = { id: partId, side };
    } else if (existingPart.side === side) {
      // Clicked same side -> Toggle OFF
      newSelectedParts.splice(existingIndex, 1);
    } else if (existingPart.side === 'both') {
      // Clicked one side while 'both' is active -> Toggle that side OFF -> Remain with other side
      const otherSide = side === 'left' ? 'right' : 'left';
      newSelectedParts[existingIndex] = { id: partId, side: otherSide };
    } else {
      // Clicked different side (Left -> Clicked Right) -> Merge to 'both'
      newSelectedParts[existingIndex] = { id: partId, side: 'both' };
    }

    return { selectedParts: newSelectedParts };
  }),
  removePart: (partId) => set((state) => ({
    selectedParts: state.selectedParts.filter(p => p.id !== partId)
  })),
  resetParts: () => set({ selectedParts: [], painRecords: [] }),

  painRecords: [],
  upsertPainRecord: (record) => set((state) => {
    const others = state.painRecords.filter(r => r.partId !== record.partId);
    return { painRecords: [...others, record] };
  }),

  reports: [],
  fetchHistory: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const reports = await dbService.fetchHistory(userId);
      set({ reports, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to fetch history', isLoading: false });
    }
  },
  saveReport: async (report) => {
    set({ isLoading: true, error: null });
    try {
      await dbService.saveReport(report);
      // Refresh local history list optimistically or strictly by refetching?
      // Since save is upsert, simple prepend is risky (might duplicate).
      // Let's just refetch to be safe or intelligent update.
      // For simplicity in this iteration:
      const { user } = get();
      if (user) {
         const reports = await dbService.fetchHistory(user.uid);
         set({ reports, isLoading: false });
      } else {
         set({ isLoading: false });
      }
    } catch (e: any) {
      set({ error: e.message || 'Failed to save report', isLoading: false });
      throw e;
    }
  }
}));