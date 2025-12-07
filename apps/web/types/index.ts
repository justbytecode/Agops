// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenant_id: string;
  created_at: string;
}

// Incident Types
export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "investigating" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  assigned_to?: string;
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
  last_run?: string;
  config: Record<string, any>;
}

// Integration Types
export interface Integration {
  id: string;
  provider: string;
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  created_at: string;
}

// Metric Types
export interface Metric {
  name: string;
  value: number;
  timestamp: string;
  labels?: Record<string, string>;
}
