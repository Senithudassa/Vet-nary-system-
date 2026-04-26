import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.8.158:3001/api/v1";

export type UserRole = "MAIN_ADMIN" | "MINOR_ADMIN" | "VET" | "CUSTOMER";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

class ApiClient {
  private async getHeaders(auth = true) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (auth) {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async login(credentials: any): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: await this.getHeaders(false),
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  }

  async registerCustomer(data: any): Promise<any> {
    const response = await fetch(`${BASE_URL}/auth/register/customer`, {
      method: "POST",
      headers: await this.getHeaders(false),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  }

  async getMe(): Promise<UserProfile> {
    const response = await fetch(`${BASE_URL}/auth/me`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    return response.json();
  }

  async logout() {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: await this.getHeaders(),
      });
    } catch (e) {
      console.warn("Logout request failed", e);
    }
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
  }

  // Pet Management
  async getPets(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/pets`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pets");
    }

    return response.json();
  }

  async addPet(data: any): Promise<any> {
    const response = await fetch(`${BASE_URL}/pets`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add pet");
    }

    return response.json();
  }

  async getVetBook(petId: string): Promise<any> {
    const response = await fetch(`${BASE_URL}/vetbook/${petId}`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch vet book");
    }

    return response.json();
  }

  // Clinic Operations
  async getClinics(): Promise<Clinic[]> {
    const response = await fetch(`${BASE_URL}/clinics`, {
      method: "GET",
      headers: await this.getHeaders(false), // Public endpoint
    });

    if (!response.ok) {
      throw new Error("Failed to fetch clinics");
    }

    return response.json();
  }
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  operatingHours: string;
}

export const api = new ApiClient();
