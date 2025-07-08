import { apiRequest } from "./queryClient";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  storageUsed: number;
  storageLimit: number;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

class AuthService {
  private token: string | null = null;
  private user: AuthUser | null = null;

  constructor() {
    this.token = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiRequest("POST", "/api/auth/login", {
      email,
      password,
    });
    
    const data: LoginResponse = await response.json();
    
    this.token = data.token;
    this.user = data.user;
    
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    
    return data;
  }

  async logout(): Promise<void> {
    if (this.token) {
      try {
        await apiRequest("POST", "/api/auth/logout", {});
      } catch (error) {
        // Ignore logout errors
      }
    }
    
    this.token = null;
    this.user = null;
    
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (!this.token) return null;
    
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      
      if (!response.ok) {
        this.logout();
        return null;
      }
      
      const user = await response.json();
      this.user = user;
      localStorage.setItem("auth_user", JSON.stringify(user));
      return user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): AuthUser | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.token !== null && this.user !== null;
  }

  getInitials(): string {
    if (!this.user) return "";
    return `${this.user.firstName[0]}${this.user.lastName[0]}`.toUpperCase();
  }

  getFullName(): string {
    if (!this.user) return "";
    return `${this.user.firstName} ${this.user.lastName}`;
  }
}

export const authService = new AuthService();

// Override the default query client to include auth headers
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = authService.getToken();
  
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  return fetch(url, { ...options, headers });
};
