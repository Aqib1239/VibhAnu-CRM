"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Lead, LeadFilters, DashboardStats, AudioData, Department } from "@/types/leads";
import { LeadsService } from "@/services/leads.service";
import { useAuth } from "./auth-context";
import { toast } from "sonner";

interface LeadsContextType {
  leads: Lead[];
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refreshLeads: (filters?: LeadFilters) => Promise<void>;
  getLeadById: (id: string) => Promise<Lead | null>;
  createLead: (data: { name: string; contactNumber: string; city?: string; state?: string; initialRemarks?: string }) => Promise<Lead>;
  scheduleCommunicationMeeting: (
    leadId: string,
    data: {
      name: string;
      postalAddress: string;
      city: string;
      state: string;
      pincode?: string;
      date: string;
      time: string;
      remark: string;
    }
  ) => Promise<Lead>;
  verifyVigilanceLead: (
    leadId: string,
    data: {
      name: string;
      postalAddress: string;
      city: string;
      state: string;
      pincode?: string;
      date: string;
      time: string;
      remark: string;
      audio: AudioData;
    }
  ) => Promise<Lead>;
  allocateSupportLead: (
    leadId: string,
    data: {
      isDateVerified: boolean;
      isTimeVerified: boolean;
      isAddressVerified: boolean;
      allocatedTo: string;
      allocationNotes?: string;
    }
  ) => Promise<Lead>;
  markAudioListenCompleted: (leadId: string) => Promise<Lead>;
  claimSalesLead: (
    leadId: string,
    data: {
      dealValue?: number;
      closingRemarks?: string;
    }
  ) => Promise<Lead>;
  resetToDefaultMockData: () => void;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

const LEADS_CACHE_KEY = "vibhanu_crm_leads_cache_v2";
const STATS_CACHE_KEY = "vibhanu_crm_stats_cache_v2";

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useAuth();
  
  // 1. Deterministic initial state (identical on server and initial client render)
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request race-condition counter and state refs
  const latestRequestId = React.useRef(0);
  const leadsRef = React.useRef<Lead[]>([]);
  const lastRoleFetchedRef = React.useRef<string | null>(null);

  // 2. Fetch fresh data from backend — STABLE CALLBACK WITH ZERO STATE DEPENDENCIES
  const refreshLeads = useCallback(async (filters: LeadFilters = {}) => {
    const requestId = ++latestRequestId.current;
    setIsRevalidating(true);
    setError(null);

    try {
      const [leadsResponse, computedStats] = await Promise.all([
        LeadsService.getLeads({ limit: 50, ...filters }),
        LeadsService.getDashboardStats().catch(() => null),
      ]);

      // If a newer refresh request was initiated in the meantime, ignore this stale result
      if (requestId !== latestRequestId.current) {
        return;
      }

      const freshLeads = leadsResponse?.data ?? [];
      const finalStats = computedStats || LeadsService.computeStatsFromLeads(freshLeads);

      leadsRef.current = freshLeads;
      setLeads(freshLeads);
      setStats(finalStats);

      // Persist to client cache safely
      if (typeof window !== "undefined" && freshLeads.length > 0) {
        try {
          sessionStorage.setItem(LEADS_CACHE_KEY, JSON.stringify(freshLeads));
          if (finalStats) {
            sessionStorage.setItem(STATS_CACHE_KEY, JSON.stringify(finalStats));
          }
        } catch (_) {}
      }
    } catch (err: any) {
      if (requestId === latestRequestId.current) {
        console.error("Failed to load leads", err);
        setError(err?.message || "Failed to load lead database");
        setStats((prevStats) => prevStats || (leadsRef.current.length > 0 ? LeadsService.computeStatsFromLeads(leadsRef.current) : null));
      }
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false);
        setIsRevalidating(false);
      }
    }
  }, []);

  // 3. Hydrate cache AFTER initial mount and trigger fetch ONCE when auth is ready or when role changes
  useEffect(() => {
    setIsHydrated(true);

    let hasCachedData = false;
    try {
      const cachedLeadsStr = sessionStorage.getItem(LEADS_CACHE_KEY) || localStorage.getItem(LEADS_CACHE_KEY);
      const cachedStatsStr = sessionStorage.getItem(STATS_CACHE_KEY) || localStorage.getItem(STATS_CACHE_KEY);

      if (cachedLeadsStr) {
        const parsedLeads = JSON.parse(cachedLeadsStr);
        if (Array.isArray(parsedLeads) && parsedLeads.length > 0) {
          leadsRef.current = parsedLeads;
          setLeads(parsedLeads);
          hasCachedData = true;
          if (cachedStatsStr) {
            const parsedStats = JSON.parse(cachedStatsStr);
            if (parsedStats && typeof parsedStats === "object") {
              setStats(parsedStats);
            }
          } else {
            setStats(LeadsService.computeStatsFromLeads(parsedLeads));
          }
        }
      }
    } catch (_) {}

    // If cache exists, unblock loading immediately!
    if (hasCachedData) {
      setIsLoading(false);
    }

    // Refresh ONLY once when auth becomes ready, or when active role genuinely changes
    if (isReady && lastRoleFetchedRef.current !== user.role) {
      lastRoleFetchedRef.current = user.role;
      refreshLeads();
    }
  }, [isReady, user.role, refreshLeads]);

  const getLeadById = async (id: string): Promise<Lead | null> => {
    return await LeadsService.getLeadById(id);
  };

  const createLead = async (data: {
    name: string;
    contactNumber: string;
    city?: string;
    state?: string;
    initialRemarks?: string;
  }): Promise<Lead> => {
    try {
      const newLead = await LeadsService.createMarketingLead(data, user);
      await refreshLeads();
      toast.success("Lead Created Successfully", {
        description: `${newLead.name} (${newLead.leadCode}) entered Communication queue.`,
      });
      return newLead;
    } catch (e: any) {
      toast.error("Failed to create lead", { description: e?.message });
      throw e;
    }
  };

  const scheduleCommunicationMeeting = async (
    leadId: string,
    data: {
      name: string;
      postalAddress: string;
      city: string;
      state: string;
      pincode?: string;
      date: string;
      time: string;
      remark: string;
    }
  ): Promise<Lead> => {
    try {
      const updated = await LeadsService.scheduleCommunicationMeeting(leadId, data, user);
      await refreshLeads();
      toast.success("Meeting Scheduled & Transferred", {
        description: `${updated.name} has been moved to the Vigilance audit queue.`,
      });
      return updated;
    } catch (e: any) {
      toast.error("Failed to update communication", { description: e?.message });
      throw e;
    }
  };

  const verifyVigilanceLead = async (
    leadId: string,
    data: {
      name: string;
      postalAddress: string;
      city: string;
      state: string;
      pincode?: string;
      date: string;
      time: string;
      remark: string;
      audio: AudioData;
    }
  ): Promise<Lead> => {
    try {
      const updated = await LeadsService.verifyVigilanceLead(leadId, data, user);
      await refreshLeads();
      toast.success("Vigilance Verified & Audio Attached", {
        description: `${updated.name} successfully transferred to Support for allocation.`,
      });
      return updated;
    } catch (e: any) {
      toast.error("Failed to verify vigilance lead", { description: e?.message });
      throw e;
    }
  };

  const allocateSupportLead = async (
    leadId: string,
    data: {
      isDateVerified: boolean;
      isTimeVerified: boolean;
      isAddressVerified: boolean;
      allocatedTo: string;
      allocationNotes?: string;
    }
  ): Promise<Lead> => {
    try {
      const updated = await LeadsService.allocateSupportLead(leadId, data, user);
      await refreshLeads();
      toast.success("Lead Allocated to Sales Queue", {
        description: `Assigned to ${data.allocatedTo}. Ready for audio listening & claim.`,
      });
      return updated;
    } catch (e: any) {
      toast.error("Failed to allocate lead", { description: e?.message });
      throw e;
    }
  };

  const markAudioListenCompleted = async (leadId: string): Promise<Lead> => {
    try {
      const updated = await LeadsService.markAudioListenCompleted(leadId);
      await refreshLeads();
      toast.success("Audio Playback Verified", {
        description: "Full audio recording finished. Claim action is now unlocked!",
      });
      return updated;
    } catch (e: any) {
      console.error("Audio mark completed error", e);
      throw e;
    }
  };

  const claimSalesLead = async (
    leadId: string,
    data: {
      dealValue?: number;
      closingRemarks?: string;
    }
  ): Promise<Lead> => {
    try {
      const updated = await LeadsService.claimSalesLead(leadId, data, user);
      await refreshLeads();
      toast.success("Lead Successfully Claimed!", {
        description: `${updated.name} claimed by ${user.name}. Pipeline lifecycle completed.`,
      });
      return updated;
    } catch (e: any) {
      toast.error("Failed to claim lead", { description: e?.message });
      throw e;
    }
  };

  const resetToDefaultMockData = () => {
    LeadsService.resetData();
    refreshLeads();
    toast.info("Database Reset", { description: "Restored 16 high-fidelity mock leads." });
  };

  return (
    <LeadsContext.Provider
      value={{
        leads,
        stats,
        isLoading,
        error,
        refreshLeads,
        getLeadById,
        createLead,
        scheduleCommunicationMeeting,
        verifyVigilanceLead,
        allocateSupportLead,
        markAudioListenCompleted,
        claimSalesLead,
        resetToDefaultMockData,
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error("useLeads must be used within a LeadsProvider");
  }
  return context;
}
