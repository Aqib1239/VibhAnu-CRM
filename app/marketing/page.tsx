"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLeadMarketingSchema, CreateLeadMarketingFormData } from "@/schemas/leads.schema";
import { useLeads } from "@/context/leads-context";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { DepartmentBadge } from "@/components/ui/status-badge";
import { Lead } from "@/types/leads";
import { 
  CheckCircle2, 
  ArrowRight, 
  UserPlus, 
  Phone, 
  User, 
  MapPin, 
  Plus
} from "lucide-react";

export default function MarketingPage() {
  const { leads, createLead } = useLeads();
  const [createdLead, setCreatedLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLeadMarketingFormData>({
    resolver: zodResolver(createLeadMarketingSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      contactNumber: "",
      city: "Mumbai",
      state: "Maharashtra",
      initialRemarks: "",
    },
  });

  const onSubmit = async (data: CreateLeadMarketingFormData) => {
    setIsSubmitting(true);
    try {
      const newLead = await createLead(data);
      setCreatedLead(newLead);
      reset();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const recentDispatches = leads
    .filter((l) => l.currentDepartment === "marketing" || l.currentDepartment === "communication")
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Marketing Console"
        description="Stage 1: Capture prospective enterprise leads and automatically dispatch them into the Communication queue."
        badge={<DepartmentBadge department="marketing" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form / Success State */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader className="py-4 px-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-[16px]">Create Inbound Lead</CardTitle>
                  <CardDescription className="text-[13px]">Enter prospect credentials to initiate pipeline</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {createdLead ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-4 animate-in fade-in-50">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-500/20">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[15px] font-semibold text-foreground">
                        Lead Registered & Transferred to Communication
                      </h4>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">{createdLead.name}</strong> has entered the workflow under Lead ID{" "}
                        <span className="bg-muted px-2 py-0.5 rounded-md font-mono text-foreground font-semibold text-[12px] border border-border/60">{createdLead.leadCode}</span>.
                      </p>
                    </div>
                  </div>

                  <div className="bg-background/90 rounded-lg border border-border p-3.5 text-[13px] space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Lead Code:</span>
                      <span className="font-semibold text-foreground">{createdLead.leadCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Contact:</span>
                      <span className="text-foreground">{createdLead.contactNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-sans">Stage Destination:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase">Communication</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      size="md"
                      variant="outline"
                      onClick={() => setCreatedLead(null)}
                    >
                      Create Another Lead
                    </Button>
                    <Link href={`/leads/${createdLead.id}`}>
                      <Button size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" required>
                      Prospect Name / Organization Contact
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Vikramaditya Rawat"
                      leftIcon={<User className="w-4 h-4" />}
                      error={errors.name?.message}
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-[12px] text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contactNumber" required>
                      Contact Number (Indian Mobile)
                    </Label>
                    <Input
                      id="contactNumber"
                      placeholder="e.g. +91 98230 45129"
                      leftIcon={<Phone className="w-4 h-4" />}
                      error={errors.contactNumber?.message}
                      {...register("contactNumber")}
                    />
                    {errors.contactNumber && (
                      <p className="text-[12px] text-destructive">
                        {errors.contactNumber.message}
                      </p>
                    )}
                    <p className="text-[12px] text-muted-foreground">
                      Locked automatically in downstream stages per anti-tampering policy.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="e.g. Mumbai"
                        leftIcon={<MapPin className="w-4 h-4" />}
                        {...register("city")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="e.g. Maharashtra"
                        {...register("state")}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="initialRemarks">
                      Source / Inbound Inquiry Remarks
                    </Label>
                    <Textarea
                      id="initialRemarks"
                      placeholder="e.g. Inbound inquiry from BFSI Cloud Summit. Interested in 50-user tier."
                      rows={3}
                      {...register("initialRemarks")}
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      size="md"
                      className="w-full sm:w-auto"
                      isLoading={isSubmitting}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Create Lead & Send to Communication
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Policy & Recent Dispatches */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-muted/20 border-border/80">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-[12px] font-mono uppercase tracking-wider text-muted-foreground">
                Marketing Stage Directives
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[13px] space-y-2.5 text-muted-foreground px-5 pb-5 leading-relaxed">
              <p>
                <strong className="text-foreground">Intake:</strong> Captures fresh prospects with verified contact numbers.
              </p>
              <p>
                <strong className="text-foreground">Lifecycle Rule:</strong> Creating a lead automatically advances it to <strong className="text-foreground">Communication</strong> for outreach and meeting scheduling.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-[16px]">Recent Marketing Entries</CardTitle>
              <CardDescription className="text-[13px]">Recently registered inbound leads</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50 text-[13px]">
                {recentDispatches.map((lead) => (
                  <div key={lead.id} className="p-4 hover:bg-muted/40 transition-colors flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/leads/${lead.id}`} className="font-semibold text-foreground hover:text-primary transition-colors text-[14px]">
                          {lead.name}
                        </Link>
                        <span className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                          {lead.leadCode}
                        </span>
                      </div>
                      <p className="text-[12px] text-muted-foreground font-mono mt-0.5">
                        {lead.contactNumber} • {lead.city}
                      </p>
                    </div>
                    <DepartmentBadge department={lead.currentDepartment} className="text-[11px] py-0.5 px-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
