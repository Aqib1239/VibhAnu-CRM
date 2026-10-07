"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Role, Permission } from "@/types/auth";
import { AuthService } from "@/services/auth.service";
import { MOCK_USERS } from "@/constants/roles";
import { toast } from "sonner";

interface AuthContextType {
  user: User;
  role: Role;
  isLoading: boolean;
  isReady: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: Role) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  canAccessDepartment: (department: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Deterministic initial render: default to ADMIN so server and client match identically
  const [user, setUser] = useState<User>(MOCK_USERS.ADMIN);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        if (isMounted) setUser(currentUser);
        // Ensure valid backend session exists before queries fire
        await AuthService.ensureSession();
      } catch (e) {
        console.error("Auth init error", e);
      } finally {
        if (isMounted) setIsHydrated(true);
      }
    };
    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password?: string) => {
    setIsAuthLoading(true);
    try {
      const session = await AuthService.login(email, password);
      setUser(session.user);
      toast.success(`Welcome back, ${session.user.name}`, {
        description: `Logged in with ${session.user.role} privileges`,
      });
    } catch (e: any) {
      toast.error("Login failed", { description: e?.message || "Invalid credentials" });
      throw e;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (_) {
      // ignore backend errors on logout – clear locally regardless
    }
    setUser(MOCK_USERS.ADMIN);
    toast.info("Logged out", { description: "You have been signed out." });
    router.push("/login");
  };

  const switchRole = async (newRole: Role) => {
    const newUser = await AuthService.switchRole(newRole);
    setUser(newUser);
    toast.success(`Active Role Switched: ${newUser.role}`, {
      description: `Viewing Vibh-Anu CRM as ${newUser.name} (${newUser.department})`,
    });
  };

  const hasPermission = (permission: Permission): boolean => {
    return AuthService.hasPermission(user.role, permission);
  };

  const canAccessDepartment = (department: string): boolean => {
    return AuthService.canAccessDepartment(user.role, department);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user.role,
        isLoading: !isHydrated || isAuthLoading,
        isReady: isHydrated,
        login,
        logout,
        switchRole,
        hasPermission,
        canAccessDepartment,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
