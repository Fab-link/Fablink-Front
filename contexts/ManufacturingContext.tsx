"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';

type ManufacturingContextType = {
  designFiles: File[];
  setDesignFiles: (files: File[]) => void;
};

const ManufacturingContext = createContext<ManufacturingContextType | undefined>(undefined);

export function ManufacturingProvider({ children }: { children: React.ReactNode }) {
  const [designFiles, setDesignFiles] = useState<File[]>([]);
  const value = useMemo(() => ({ designFiles, setDesignFiles }), [designFiles]);
  return <ManufacturingContext.Provider value={value}>{children}</ManufacturingContext.Provider>;
}

export function useManufacturingContext() {
  const ctx = useContext(ManufacturingContext);
  if (!ctx) throw new Error('useManufacturingContext must be used within ManufacturingProvider');
  return ctx;
}
