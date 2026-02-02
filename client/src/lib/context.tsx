import React, { createContext, useContext, useState } from 'react';

type AppState = {
  criticalCount: number;
  eodProgress: number;
  eodComplete: boolean;
  setCriticalCount: (count: number) => void;
  setEodProgress: (progress: number) => void;
  setEodComplete: (complete: boolean) => void;
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [criticalCount, setCriticalCount] = useState(0);
  const [eodProgress, setEodProgress] = useState(0);
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
