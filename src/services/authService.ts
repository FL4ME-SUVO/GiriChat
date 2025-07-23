const API_BASE_URL = 'http://localhost:3001/api/auth';

export interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    avatar: string;
    status?: string;
    isEmailVerified: boolean;
  };
  requiresVerification?: boolean;
  userId?: string;
  verificationCode?: string; // For development mode when email is not configured
  resetCode?: string; // For password reset when email is not configured
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  verificationCode: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  resetCode: string;
  newPassword: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyEmail(verificationData: VerifyEmailData): Promise<AuthResponse> {
    const response = await this.makeRequest('/verify-email', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    const response = await this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async forgotPassword(data: ForgotPasswordData): Promise<AuthResponse> {
    return this.makeRequest('/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    return this.makeRequest('/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resendVerification(email: string): Promise<AuthResponse> {
    return this.makeRequest('/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getProfile(): Promise<AuthResponse> {
    return this.makeRequest('/me');
  }

  async checkEmailConfig(): Promise<{ emailConfigured: boolean; message: string }> {
    return this.makeRequest('/email-config');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return this.token;
  }

  removeToken(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = new AuthService();