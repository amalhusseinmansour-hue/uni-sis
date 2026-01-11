import apiClient from './client';

export interface SystemSettings {
  // General
  siteName: string;
  siteNameAr: string;
  logo?: string;
  favicon?: string;
  defaultLanguage: 'en' | 'ar';
  supportedLanguages: string[];

  // Academic
  currentSemester?: {
    id: string;
    name: string;
    nameAr: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  academicYear?: string;
  registrationOpen: boolean;
  registrationStartDate?: string;
  registrationEndDate?: string;
  dropDeadline?: string;

  // Financial
  currency: string;
  currencySymbol: string;
  paymentMethods: string[];
  lateFeePercentage?: number;

  // Grading
  gradingScale: 'letter' | 'percentage' | 'gpa';
  passingGrade: number;
  maxGPA: number;

  // Features
  features: {
    onlinePayment: boolean;
    onlineRegistration: boolean;
    aiAssistant: boolean;
    moodleIntegration: boolean;
    idCard: boolean;
    discipline: boolean;
    requests: boolean;
  };

  // Contact
  supportEmail?: string;
  supportPhone?: string;
  address?: string;
  addressAr?: string;

  // Social
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };

  // Maintenance
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  maintenanceMessageAr?: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  language: 'en' | 'ar';
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    academic: boolean;
    financial: boolean;
    announcements: boolean;
    soundEffects?: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reducedMotion: boolean;
  };
  privacy: {
    showProfile: boolean;
    showEmail: boolean;
    showPhone: boolean;
  };
}

export const settingsAPI = {
  // Get system settings (public)
  getSystemSettings: async (): Promise<SystemSettings> => {
    try {
      const response = await apiClient.get('/settings/system');
      return response.data;
    } catch (error) {
      // Return default settings if API fails
      return getDefaultSystemSettings();
    }
  },

  // Get user settings
  getUserSettings: async (): Promise<UserSettings | null> => {
    try {
      const response = await apiClient.get('/settings/user');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Update user settings
  updateUserSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    const response = await apiClient.put('/settings/user', settings);
    return response.data;
  },

  // Get setting by key
  getSetting: async (key: string): Promise<any> => {
    const response = await apiClient.get(`/settings/${key}`);
    return response.data;
  },

  // Get current semester
  getCurrentSemester: async () => {
    try {
      const response = await apiClient.get('/semesters/current');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Get all semesters
  getSemesters: async () => {
    const response = await apiClient.get('/semesters');
    return response.data;
  },

  // Get colleges
  getColleges: async () => {
    const response = await apiClient.get('/colleges');
    return response.data;
  },

  // Get departments
  getDepartments: async (collegeId?: string) => {
    const response = await apiClient.get('/departments', {
      params: { college_id: collegeId }
    });
    return response.data;
  },

  // Get programs
  getPrograms: async (departmentId?: string) => {
    const response = await apiClient.get('/programs', {
      params: { department_id: departmentId }
    });
    return response.data;
  },
};

// Default system settings
function getDefaultSystemSettings(): SystemSettings {
  return {
    siteName: 'Universe SIS',
    siteNameAr: 'نظام معلومات الطلاب',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ar'],
    registrationOpen: true,
    currency: 'USD',
    currencySymbol: '$',
    paymentMethods: ['credit_card', 'bank_transfer'],
    gradingScale: 'gpa',
    passingGrade: 60,
    maxGPA: 4.0,
    features: {
      onlinePayment: true,
      onlineRegistration: true,
      aiAssistant: true,
      moodleIntegration: false,
      idCard: true,
      discipline: true,
      requests: true,
    },
    maintenanceMode: false,
  };
}
