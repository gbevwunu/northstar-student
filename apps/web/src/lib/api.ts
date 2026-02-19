const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

// Auth-specific helpers
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    university?: string;
    program?: string;
  }) => api('/auth/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    api('/auth/login', { method: 'POST', body: data }),

  me: (token: string) => api('/auth/me', { token }),
};

// Work log helpers
export const workLogApi = {
  dashboard: (token: string) => api('/work-logs/dashboard', { token }),

  logHours: (token: string, data: {
    date: string;
    hoursWorked: number;
    employer: string;
    notes?: string;
  }) => api('/work-logs', { method: 'POST', body: data, token }),

  getWeek: (token: string, date: string) =>
    api(`/work-logs/week/${date}`, { token }),

  getHistory: (token: string, page = 1) =>
    api(`/work-logs/history?page=${page}`, { token }),
};

// Compliance helpers
export const complianceApi = {
  getChecklist: (token: string) => api('/compliance/checklist', { token }),

  updateItem: (token: string, itemId: string, data: {
    status: string;
    notes?: string;
    documentId?: string;
  }) => api(`/compliance/checklist/${itemId}`, { method: 'PATCH', body: data, token }),

  initialize: (token: string) =>
    api('/compliance/initialize', { method: 'POST', token }),
};

// Permit helpers
export const permitApi = {
  get: (token: string) => api('/permits', { token }),

  save: (token: string, data: {
    permitNumber?: string;
    issueDate?: string;
    expiryDate: string;
    conditions?: string[];
  }) => api('/permits', { method: 'POST', body: data, token }),
};

// Notification helpers
export const notificationApi = {
  getAll: (token: string, unread = false) =>
    api(`/notifications?unread=${unread}`, { token }),

  markRead: (token: string, id: string) =>
    api(`/notifications/${id}/read`, { method: 'PATCH', token }),

  markAllRead: (token: string) =>
    api('/notifications/read-all', { method: 'POST', token }),
};

// Document helpers
export const documentApi = {
  getAll: (token: string, type?: string) =>
    api(`/documents${type ? `?type=${type}` : ''}`, { token }),

  getUploadUrl: (token: string, data: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    type: string;
  }) => api('/documents/upload-url', { method: 'POST', body: data, token }),

  getDownloadUrl: (token: string, id: string) =>
    api(`/documents/${id}/download`, { token }),

  delete: (token: string, id: string) =>
    api(`/documents/${id}`, { method: 'DELETE', token }),
};
