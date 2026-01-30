import apiClient from './client';

export interface BrandingSettings {
  id?: string;
  // University Info
  universityName: string;
  universityNameAr: string;
  universitySlogan?: string;
  universitySloganAr?: string;

  // Logos
  logo: string; // Base64 or URL
  logoLight?: string; // For dark backgrounds
  favicon?: string;

  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;

  // ID Card Settings
  idCardTemplate: 'modern' | 'classic' | 'minimal' | 'custom';
  idCardCustomTemplate?: string; // Base64 of uploaded template image
  idCardCustomTemplateFront?: string; // Front side template
  idCardCustomTemplateBack?: string; // Back side template
  idCardPrimaryColor: string;
  idCardSecondaryColor: string;
  idCardTextColor: string;
  idCardBackgroundPattern?: string;
  showQRCode: boolean;
  showBarcode: boolean;
  // Custom template field positions (for overlay)
  idCardFieldPositions?: {
    photo?: { x: number; y: number; width: number; height: number };
    name?: { x: number; y: number; fontSize: number; color: string };
    nameAr?: { x: number; y: number; fontSize: number; color: string };
    studentId?: { x: number; y: number; fontSize: number; color: string };
    college?: { x: number; y: number; fontSize: number; color: string };
    qrCode?: { x: number; y: number; size: number };
    barcode?: { x: number; y: number; width: number; height: number };
  };

  // Report/Transcript Settings
  reportHeaderLogo: string;
  reportFooterText?: string;
  reportFooterTextAr?: string;
  reportWatermark?: string;
  reportPrimaryColor: string;
  reportSecondaryColor: string;
  showReportWatermark: boolean;

  // Contact Info (for reports)
  universityAddress?: string;
  universityAddressAr?: string;
  universityPhone?: string;
  universityEmail?: string;
  universityWebsite?: string;

  // Currency Settings
  currency: string; // Currency code (USD, EUR, SAR, etc.)
  currencySymbol: string; // Currency symbol ($, €, ر.س, etc.)
  currencyPosition: 'before' | 'after'; // Symbol position relative to amount

  updatedAt?: string;
}

// Default branding settings
const DEFAULT_BRANDING: BrandingSettings = {
  universityName: 'Vertex University',
  universityNameAr: 'جامعة فيرتكس',
  universitySlogan: 'Excellence in Education',
  universitySloganAr: 'التميز في التعليم',

  logo: '',
  logoLight: '',
  favicon: '',

  primaryColor: '#1e40af',
  secondaryColor: '#3b82f6',
  accentColor: '#f59e0b',

  idCardTemplate: 'modern',
  idCardCustomTemplate: '',
  idCardCustomTemplateFront: '',
  idCardCustomTemplateBack: '',
  idCardPrimaryColor: '#1e3a5f',
  idCardSecondaryColor: '#2563eb',
  idCardTextColor: '#ffffff',
  idCardBackgroundPattern: '',
  showQRCode: true,
  showBarcode: true,
  idCardFieldPositions: {
    photo: { x: 20, y: 60, width: 80, height: 100 },
    name: { x: 110, y: 70, fontSize: 14, color: '#ffffff' },
    nameAr: { x: 110, y: 90, fontSize: 12, color: '#ffffff' },
    studentId: { x: 110, y: 120, fontSize: 11, color: '#ffffff' },
    college: { x: 110, y: 140, fontSize: 10, color: '#ffffff' },
    qrCode: { x: 20, y: 170, size: 50 },
    barcode: { x: 80, y: 180, width: 150, height: 30 },
  },

  reportHeaderLogo: '',
  reportFooterText: 'This is an official document issued by the university',
  reportFooterTextAr: 'هذه وثيقة رسمية صادرة من الجامعة',
  reportWatermark: '',
  reportPrimaryColor: '#1e40af',
  reportSecondaryColor: '#64748b',
  showReportWatermark: true,

  universityAddress: 'University Campus, Main Street',
  universityAddressAr: 'الحرم الجامعي، الشارع الرئيسي',
  universityPhone: '+966 11 123 4567',
  universityEmail: 'info@university.edu',
  universityWebsite: 'www.university.edu',

  // Currency defaults - USD
  currency: 'USD',
  currencySymbol: '$',
  currencyPosition: 'before',
};

// Local storage key
const BRANDING_STORAGE_KEY = 'university_branding_settings';

// Get branding from localStorage (fallback when API unavailable)
const getLocalBranding = (): BrandingSettings => {
  try {
    const stored = localStorage.getItem(BRANDING_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_BRANDING, ...JSON.parse(stored) };
    }
  } catch {
    // Silently fail - use defaults
  }
  return DEFAULT_BRANDING;
};

// Save branding to localStorage
const saveLocalBranding = (settings: BrandingSettings): void => {
  try {
    localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Silently fail - localStorage might be full or disabled
  }
};

export const brandingAPI = {
  // Get branding settings
  getSettings: async (): Promise<BrandingSettings> => {
    // API disabled - endpoint doesn't exist on server
    // Return local/default branding without making HTTP request
    return getLocalBranding();
  },

  // Update branding settings
  updateSettings: async (settings: Partial<BrandingSettings>): Promise<BrandingSettings> => {
    try {
      const response = await apiClient.put('/admin/branding', settings);
      const updatedSettings = { ...DEFAULT_BRANDING, ...response.data };
      saveLocalBranding(updatedSettings);
      return updatedSettings;
    } catch (error) {
      // Fallback to local storage
      const currentSettings = getLocalBranding();
      const newSettings = { ...currentSettings, ...settings, updatedAt: new Date().toISOString() };
      saveLocalBranding(newSettings);
      return newSettings;
    }
  },

  // Upload logo
  uploadLogo: async (file: File, type: 'logo' | 'logoLight' | 'reportHeaderLogo' | 'favicon'): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Get default settings
  getDefaults: (): BrandingSettings => {
    return { ...DEFAULT_BRANDING };
  },

  // Reset to defaults
  resetToDefaults: async (): Promise<BrandingSettings> => {
    try {
      await apiClient.post('/admin/branding/reset');
    } catch (error) {
      // Continue with local reset
    }
    saveLocalBranding(DEFAULT_BRANDING);
    return DEFAULT_BRANDING;
  },

  // Preview ID Card with settings
  previewIdCard: (settings: Partial<BrandingSettings>) => {
    return {
      ...getLocalBranding(),
      ...settings,
    };
  },
};

export default brandingAPI;
