export interface User {
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  token: string;
}

export interface SensorData {
  points: number[];
  timestamp: string;
  lineNumber: number;
}

export interface AnalysisResult {
  plot: string; // base64 PNG
  description: string;
  firstName: string;
  lastName: string;
  email: string;
  lineNumber: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}