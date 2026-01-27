import React, { createContext, useContext, useState } from 'react';
import { mockActionItems } from '@/components/dashboard/mockData';

type AppState = {
  criticalCount: number;
  eodProgress: number; // 0 to 100
  eodComplete: boolean;
  setCriticalCount: (count: number) => void;
  setEodProgress: (progress: number) => void;
  setEodComplete: (complete: boolean) => void;
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Initialize with mock data count (2 critical items in mockData)
  const [criticalCount, setCriticalCount] = useState(
    mockActionItems.filter(i => i.state === 'action_required').length
  );
  const [eodProgress, setEodProgress] = useState(50); // Start at 50% as per initial EODChecklist state
  const [eodComplete, setEodComplete] = useState(false);

  return (
    <AppContext.Provider 
      value={{ 
        criticalCount, 
        setCriticalCount, 
        eodProgress, 
        setEodProgress,
        eodComplete,
        setEodComplete
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}
