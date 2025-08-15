import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse, SensorData, AnalysisResult } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'REACT_APP_API_URL',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token expiry
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(userData: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/login', userData);
    return response.data;
  }

  async getSensorData(): Promise<SensorData> {
    const response: AxiosResponse<SensorData> = await this.api.get('/points');
    return response.data;
  }

  async submitResults(results: AnalysisResult): Promise<void> {
    await this.api.post('/results', results);
  }
}

export const apiService = new ApiService();
