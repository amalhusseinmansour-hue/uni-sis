import apiClient from './client';

export interface UserPreferences {
  id?: number;
  user_id?: number;
  language: 'en' | 'ar';
  theme: 'light' | 'dark' | 'system';
  notification_sound: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  reminders: Reminder[];
  recent_searches: string[];
  dashboard_layout?: Record<string, unknown>;
  custom_settings?: Record<string, unknown>;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  time?: string;
  type?: string;
  notified?: boolean;
}

// Get user preferences
export const getPreferences = async (): Promise<UserPreferences> => {
  const response = await apiClient.get('/preferences');
  return response.data.data;
};

// Update all preferences
export const updatePreferences = async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
  const response = await apiClient.put('/preferences', preferences);
  return response.data.data;
};

// Update a single preference
export const updatePreference = async <K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): Promise<UserPreferences> => {
  const response = await apiClient.put(`/preferences/${key}`, { value });
  return response.data.data;
};

// Add a reminder
export const addReminder = async (reminder: Reminder): Promise<UserPreferences> => {
  const response = await apiClient.post('/preferences/reminders', reminder);
  return response.data.data;
};

// Delete a reminder
export const deleteReminder = async (id: string): Promise<UserPreferences> => {
  const response = await apiClient.delete(`/preferences/reminders/${id}`);
  return response.data.data;
};

// Add recent search
export const addRecentSearch = async (query: string): Promise<UserPreferences> => {
  const response = await apiClient.post('/preferences/recent-searches', { query });
  return response.data.data;
};

// Preferences API object for easier imports
export const preferencesAPI = {
  get: getPreferences,
  update: updatePreferences,
  updateSingle: updatePreference,
  addReminder,
  deleteReminder,
  addRecentSearch,
};

export default preferencesAPI;
