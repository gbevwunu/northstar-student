import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://localhost:3001/api'; // Change for production

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

export async function api<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data as T;
}

// Auth
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    university?: string;
  }) => api('/auth/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    api('/auth/login', { method: 'POST', body: data }),

  me: (token: string) => api('/auth/me', { token }),
};

// Work Logs
export const workLogApi = {
  dashboard: (token: string) => api('/work-logs/dashboard', { token }),

  logHours: (token: string, data: {
    date: string;
    hoursWorked: number;
    employer: string;
    notes?: string;
  }) => api('/work-logs', { method: 'POST', body: data, token }),
};

// Compliance
export const complianceApi = {
  getChecklist: (token: string) => api('/compliance/checklist', { token }),

  updateItem: (token: string, itemId: string, data: { status: string }) =>
    api(`/compliance/checklist/${itemId}`, { method: 'PATCH', body: data, token }),
};

// Permits
export const permitApi = {
  get: (token: string) => api('/permits', { token }),
};

// Notifications
export const notificationApi = {
  getAll: (token: string) => api('/notifications', { token }),

  markAllRead: (token: string) =>
    api('/notifications/read-all', { method: 'POST', token }),
};

// Documents
export const documentApi = {
  getAll: (token: string) => api('/documents', { token }),
};
