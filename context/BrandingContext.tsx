import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { brandingAPI, BrandingSettings } from '../api/branding';

interface BrandingContextType {
  branding: BrandingSettings | null;
  isLoading: boolean;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBranding = async () => {
    try {
      setIsLoading(true);
      const settings = await brandingAPI.getSettings();
      setBranding(settings);
    } catch {
      // Use defaults on error - branding API is optional
      setBranding(brandingAPI.getDefaults());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranding();
  }, []);

  const refreshBranding = async () => {
    await loadBranding();
  };

  return (
    <BrandingContext.Provider value={{ branding, isLoading, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = (): BrandingContextType => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};

export default BrandingContext;
