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
  idCardTemplate: 'modern' | 'classic' | 'minimal';
  idCardPrimaryColor: string;
  idCardSecondaryColor: string;
  idCardTextColor: string;
  idCardBackgroundPattern?: string;
  showQRCode: boolean;
  showBarcode: boolean;

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

  updatedAt?: string;
}

// Default branding settings
const DEFAULT_BRANDING: BrandingSettings = {
  universityName: 'Vertix University',
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
  idCardPrimaryColor: '#1e3a5f',
  idCardSecondaryColor: '#2563eb',
  idCardTextColor: '#ffffff',
  idCardBackgroundPattern: '',
  showQRCode: true,
  showBarcode: true,

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
  } catch (e) {
    console.error('Error reading branding from localStorage:', e);
  }
  return DEFAULT_BRANDING;
};

// Save branding to localStorage
const saveLocalBranding = (settings: BrandingSettings): void => {
  try {
    localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving branding to localStorage:', e);
  }
};

export const brandingAPI = {
  // Get branding settings
  getSettings: async (): Promise<BrandingSettings> => {
    try {
      const response = await apiClient.get('/admin/branding');
      const settings = { ...DEFAULT_BRANDING, ...response.data };
      saveLocalBranding(settings); // Cache locally
      return settings;
    } catch (error) {
      console.warn('Using local branding settings');
      return getLocalBranding();
    }
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
