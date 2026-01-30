import apiClient from './client';

// Types
export interface DisciplineIncident {
  id: number;
  student_id: number;
  reported_by: number;
  semester_id?: number;
  incident_number: string;
  type: string;
  type_other?: string;
  severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'SEVERE';
  points: number;
  incident_date: string;
  incident_time?: string;
  location?: string;
  description: string;
  description_ar?: string;
  witnesses?: string[];
  evidence?: string[];
  status: 'REPORTED' | 'INVESTIGATING' | 'CONFIRMED' | 'DISMISSED' | 'RESOLVED' | 'APPEALED';
  guardian_notified: boolean;
  guardian_notified_at?: string;
  investigation_notes?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  student?: any;
  reporter?: any;
  semester?: any;
  actions?: DisciplineAction[];
  appeals?: DisciplineAppeal[];
}

export interface DisciplineAction {
  id: number;
  incident_id: number;
  student_id: number;
  assigned_by: number;
  action_type: string;
  action_type_other?: string;
  action_date: string;
  start_date?: string;
  end_date?: string;
  duration_days?: number;
  description: string;
  description_ar?: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  is_appealable: boolean;
  appeal_deadline?: string;
  created_at: string;
  // Relations
  incident?: DisciplineIncident;
  student?: any;
}

export interface DisciplineAppeal {
  id: number;
  incident_id?: number;
  action_id?: number;
  student_id: number;
  submitted_by: number;
  appeal_number: string;
  appeal_type: 'INCIDENT_DISPUTE' | 'ACTION_REDUCTION' | 'POINTS_REDUCTION' | 'FULL_DISMISSAL';
  reason: string;
  reason_ar?: string;
  supporting_documents?: string[];
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PARTIALLY_APPROVED' | 'REJECTED' | 'WITHDRAWN';
  reviewed_by?: number;
  reviewed_at?: string;
  decision?: string;
  points_reduced: number;
  created_at: string;
  // Relations
  incident?: DisciplineIncident;
  action?: DisciplineAction;
  student?: any;
  reviewer?: any;
}

export interface DisciplinePoints {
  id: number;
  student_id: number;
  semester_id?: number;
  total_points: number;
  active_points: number;
  expired_points: number;
  reduced_points: number;
  status: 'GOOD_STANDING' | 'WARNING_1' | 'WARNING_2' | 'PROBATION' | 'CRITICAL';
  warning_1_issued: boolean;
  warning_2_issued: boolean;
  suspension_issued: boolean;
  expulsion_recommended: boolean;
}

export interface DisciplineSummary {
  student: any;
  points: {
    total: number;
    active: number;
    status: string;
    status_display: string;
    status_display_ar: string;
    status_color: string;
    points_to_next_threshold?: number;
    next_threshold_name?: string;
  };
  incidents_count: number;
  incidents_by_status: Record<string, number>;
  active_actions_count: number;
  pending_appeals_count: number;
  recent_incidents: any[];
  active_actions: any[];
}

export const disciplineAPI = {
  // ==========================================
  // STUDENT ENDPOINTS
  // ==========================================

  // Get my discipline record
  getMyRecord: async (): Promise<DisciplineSummary> => {
    const response = await apiClient.get('/my-discipline');
    return response.data;
  },

  // Get my incidents
  getMyIncidents: async (params?: { per_page?: number; page?: number }) => {
    const response = await apiClient.get('/my-discipline/incidents', { params });
    return response.data;
  },

  // Get my actions
  getMyActions: async (params?: { per_page?: number; page?: number }) => {
    const response = await apiClient.get('/my-discipline/actions', { params });
    return response.data;
  },

  // Get my appeals
  getMyAppeals: async (params?: { per_page?: number; page?: number }) => {
    const response = await apiClient.get('/my-discipline/appeals', { params });
    return response.data;
  },

  // Submit appeal (student)
  submitAppeal: async (data: {
    incident_id?: number;
    action_id?: number;
    student_id: number;
    appeal_type: string;
    reason: string;
    reason_ar?: string;
    supporting_documents?: string[];
  }): Promise<DisciplineAppeal> => {
    const response = await apiClient.post('/my-discipline/appeals', data);
    return response.data.appeal;
  },

  // Withdraw appeal (student)
  withdrawAppeal: async (appealId: number): Promise<DisciplineAppeal> => {
    const response = await apiClient.post(`/my-discipline/appeals/${appealId}/withdraw`);
    return response.data.appeal;
  },

  // ==========================================
  // ADMIN ENDPOINTS - INCIDENTS
  // ==========================================

  // Get all incidents
  getIncidents: async (filters?: {
    student_id?: number;
    semester_id?: number;
    status?: string;
    severity?: string;
    type?: string;
    date_from?: string;
    date_to?: string;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/discipline/incidents', { params: filters });
    return response.data;
  },

  // Get incident by ID
  getIncident: async (id: number): Promise<DisciplineIncident> => {
    const response = await apiClient.get(`/discipline/incidents/${id}`);
    return response.data;
  },

  // Report new incident
  reportIncident: async (data: {
    student_id: number;
    semester_id?: number;
    type: string;
    type_other?: string;
    severity: string;
    incident_date: string;
    incident_time?: string;
    location?: string;
    description: string;
    description_ar?: string;
    witnesses?: string[];
    evidence?: string[];
  }): Promise<DisciplineIncident> => {
    const response = await apiClient.post('/discipline/incidents', data);
    return response.data.incident;
  },

  // Update incident
  updateIncident: async (id: number, data: Partial<DisciplineIncident>): Promise<DisciplineIncident> => {
    const response = await apiClient.put(`/discipline/incidents/${id}`, data);
    return response.data.incident;
  },

  // Delete incident
  deleteIncident: async (id: number): Promise<void> => {
    await apiClient.delete(`/discipline/incidents/${id}`);
  },

  // Start investigation
  startInvestigation: async (id: number): Promise<DisciplineIncident> => {
    const response = await apiClient.post(`/discipline/incidents/${id}/investigate`);
    return response.data.incident;
  },

  // Confirm incident
  confirmIncident: async (id: number, data?: {
    severity?: string;
    investigation_notes?: string;
  }): Promise<DisciplineIncident> => {
    const response = await apiClient.post(`/discipline/incidents/${id}/confirm`, data || {});
    return response.data.incident;
  },

  // Dismiss incident
  dismissIncident: async (id: number, reason: string): Promise<DisciplineIncident> => {
    const response = await apiClient.post(`/discipline/incidents/${id}/dismiss`, { reason });
    return response.data.incident;
  },

  // Resolve incident
  resolveIncident: async (id: number, notes?: string): Promise<DisciplineIncident> => {
    const response = await apiClient.post(`/discipline/incidents/${id}/resolve`, { notes });
    return response.data.incident;
  },

  // ==========================================
  // ADMIN ENDPOINTS - ACTIONS
  // ==========================================

  // Get all actions
  getActions: async (filters?: {
    student_id?: number;
    incident_id?: number;
    status?: string;
    action_type?: string;
    active_only?: boolean;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/discipline/actions', { params: filters });
    return response.data;
  },

  // Get action by ID
  getAction: async (id: number): Promise<DisciplineAction> => {
    const response = await apiClient.get(`/discipline/actions/${id}`);
    return response.data;
  },

  // Assign action
  assignAction: async (data: {
    incident_id: number;
    action_type: string;
    action_type_other?: string;
    action_date?: string;
    start_date?: string;
    end_date?: string;
    duration_days?: number;
    description: string;
    description_ar?: string;
    status?: string;
    is_appealable?: boolean;
  }): Promise<DisciplineAction> => {
    const response = await apiClient.post('/discipline/actions', data);
    return response.data.action;
  },

  // Update action
  updateAction: async (id: number, data: Partial<DisciplineAction>): Promise<DisciplineAction> => {
    const response = await apiClient.put(`/discipline/actions/${id}`, data);
    return response.data.action;
  },

  // Activate action
  activateAction: async (id: number): Promise<DisciplineAction> => {
    const response = await apiClient.post(`/discipline/actions/${id}/activate`);
    return response.data.action;
  },

  // Complete action
  completeAction: async (id: number, notes?: string): Promise<DisciplineAction> => {
    const response = await apiClient.post(`/discipline/actions/${id}/complete`, { notes });
    return response.data.action;
  },

  // Cancel action
  cancelAction: async (id: number, reason?: string): Promise<DisciplineAction> => {
    const response = await apiClient.post(`/discipline/actions/${id}/cancel`, { reason });
    return response.data.action;
  },

  // ==========================================
  // ADMIN ENDPOINTS - APPEALS
  // ==========================================

  // Get all appeals
  getAppeals: async (filters?: {
    student_id?: number;
    status?: string;
    pending_only?: boolean;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/discipline/appeals', { params: filters });
    return response.data;
  },

  // Get appeal by ID
  getAppeal: async (id: number): Promise<DisciplineAppeal> => {
    const response = await apiClient.get(`/discipline/appeals/${id}`);
    return response.data;
  },

  // Review appeal
  reviewAppeal: async (id: number, data: {
    status: 'APPROVED' | 'PARTIALLY_APPROVED' | 'REJECTED';
    decision: string;
    decision_ar?: string;
    review_notes?: string;
    points_reduced?: number;
    action_modified?: boolean;
    modified_action_details?: string;
  }): Promise<DisciplineAppeal> => {
    const response = await apiClient.post(`/discipline/appeals/${id}/review`, data);
    return response.data.appeal;
  },

  // ==========================================
  // ADMIN ENDPOINTS - POINTS & STATISTICS
  // ==========================================

  // Get student points
  getStudentPoints: async (studentId: number, semesterId?: number): Promise<DisciplinePoints> => {
    const response = await apiClient.get(`/discipline/students/${studentId}/points`, {
      params: { semester_id: semesterId }
    });
    return response.data;
  },

  // Get student points history
  getStudentPointsHistory: async (studentId: number): Promise<DisciplinePoints[]> => {
    const response = await apiClient.get(`/discipline/students/${studentId}/points/history`);
    return response.data;
  },

  // Get student summary
  getStudentSummary: async (studentId: number, semesterId?: number): Promise<DisciplineSummary> => {
    const response = await apiClient.get(`/discipline/students/${studentId}/summary`, {
      params: { semester_id: semesterId }
    });
    return response.data;
  },

  // Get statistics
  getStatistics: async (semesterId?: number) => {
    const response = await apiClient.get('/discipline/statistics', {
      params: { semester_id: semesterId }
    });
    return response.data;
  },
};
