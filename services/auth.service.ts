import { User, Role, AuthSession, Permission } from "@/types/auth";
import { MOCK_USERS, ROLE_CONFIGS } from "@/constants/roles";
import { api } from "./api";

const STORAGE_KEY_USER = "vibhanu_crm_user";
const STORAGE_KEY_TOKEN = "vibhanu_crm_token";

const ROLE_CREDENTIALS: Record<Role, { email: string; password: string }> = {
  ADMIN: { email: "ananya.sharma@vibhanu.com", password: "Password@123" },
  MARKETING: { email: "rohan.varma@vibhanu.com", password: "Password@123" },
  COMMUNICATION: { email: "pooja.hegde@vibhanu.com", password: "Password@123" },
  VIGILANCE: { email: "vikram.malhotra@vibhanu.com", password: "Password@123" },
  SUPPORT: { email: "neha.sundaram@vibhanu.com", password: "Password@123" },
  SALES: { email: "aditya.deshmukh@vibhanu.com", password: "Password@123" },
};

export class AuthService {
  /**
   * Get currently logged-in user from local persistence or fallback to default ADMIN
   */
  static getCurrentUser(): User {
    if (typeof window === "undefined") {
      return MOCK_USERS.ADMIN;
    }

    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error("Failed to parse stored user", e);
    }

    // Default to ADMIN for initial view
    const defaultUser = MOCK_USERS.ADMIN;
    return defaultUser;
  }

  static setCurrentUser(user: User, token?: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      if (token) {
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
      }
    }
  }

  /**
   * Login user with real REST backend API
   */
  static async login(email: string, password?: string): Promise<AuthSession> {
    try {
      const payloadPassword = password || "Password@123";
      const response = await api.post<{ user: User; token: string }>("/auth/login", {
        email: email.trim(),
        password: payloadPassword,
      });

      const user = response.data.user;
      const token = response.data.token;

      this.setCurrentUser(user, token);

      return {
        user,
        token,
      };
    } catch (err: any) {
      // If backend is unreachable in offline demo mode, provide seamless mock fallback
      console.warn("REST login failed, falling back to local session:", err.message);
      const lower = email.toLowerCase().trim();
      
      let roleUser: User = MOCK_USERS.ADMIN;
      for (const roleKey of Object.keys(MOCK_USERS) as Role[]) {
        const u = MOCK_USERS[roleKey];
        if (
          u.email.toLowerCase() === lower ||
          u.role.toLowerCase() === lower ||
          u.name.toLowerCase().includes(lower) ||
          lower.includes(roleKey.toLowerCase()) ||
          lower.includes(u.name.toLowerCase().split(" ")[0])
        ) {
          roleUser = u;
          break;
        }
      }

      const fallbackToken = `token_${roleUser.role.toLowerCase()}_${Date.now()}`;
      this.setCurrentUser(roleUser, fallbackToken);
      return { user: roleUser, token: fallbackToken };
    }
  }

  /**
   * Quick Role Switcher for live UI testing
   */
  static async switchRole(role: Role): Promise<User> {
    const creds = ROLE_CREDENTIALS[role];
    if (creds) {
      try {
        const session = await this.login(creds.email, creds.password);
        return session.user;
      } catch {
        const user = MOCK_USERS[role];
        this.setCurrentUser(user);
        return user;
      }
    }
    const user = MOCK_USERS[role];
    this.setCurrentUser(user);
    return user;
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore network logout errors
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    }
  }

  /**
   * Verify if a role has specific permission
   */
  static hasPermission(role: Role, permission: Permission): boolean {
    const config = ROLE_CONFIGS[role];
    if (!config) return false;
    return config.permissions.includes(permission);
  }

  /**
   * Verify if a role can access a department
   */
  static canAccessDepartment(role: Role, department: string): boolean {
    if (role === "ADMIN") return true;
    const config = ROLE_CONFIGS[role];
    return config?.allowedDepartments.includes(department) ?? false;
  }
}
