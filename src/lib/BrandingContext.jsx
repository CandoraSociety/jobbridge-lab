import React, { createContext, useContext, useEffect, useState } from 'react';

const BrandingContext = createContext();

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await fetch('https://beacon-92324875.base44.app/functions/getHubConfig');
        const data = await response.json();
        
        if (data.config?.branding) {
          const { brand_primary_color, brand_secondary_color } = data.config.branding;
          setBranding({ brand_primary_color, brand_secondary_color });
          
          // Apply colors to root element
          const root = document.documentElement;
          if (brand_primary_color) {
            root.style.setProperty('--brand-primary-hex', brand_primary_color);
          }
          if (brand_secondary_color) {
            root.style.setProperty('--brand-secondary-hex', brand_secondary_color);
          }
        }
      } catch (error) {
        console.error('Failed to fetch branding config:', error);
      }
    };

    fetchBranding();
  }, []);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  return useContext(BrandingContext);
};