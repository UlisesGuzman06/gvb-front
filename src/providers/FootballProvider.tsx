'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { WorldCupApiProvider } from '../services/worldcup/WorldCupApiProvider';

interface FootballContextType {
  worldCupApi: WorldCupApiProvider;
}

const FootballContext = createContext<FootballContextType | null>(null);

export const FootballProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useMemo(() => ({
    worldCupApi: new WorldCupApiProvider(),
  }), []);

  return (
    <FootballContext.Provider value={value}>
      {children}
    </FootballContext.Provider>
  );
};

export const useFootball = () => {
  const context = useContext(FootballContext);
  if (!context) {
    throw new Error('useFootball must be used within a FootballProvider');
  }
  return context;
};
