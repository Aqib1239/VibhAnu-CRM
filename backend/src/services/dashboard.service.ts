import { Lead } from "../models/Lead.model";
import { DEPARTMENTS } from "../constants/departments";

export interface IDashboardMetrics {
  totalLeads: number;
  marketingCount: number;
  communicationCount: number;
  vigilanceCount: number;
  supportCount: number;
  salesCount: number;
  claimedCount: number;
  conversionRate: number;
  recentActivityCount: number;
  leadsGrowthPercentage: number;
  recentLeads: any[];
}

export class DashboardService {
  static async getDashboardStats(): Promise<IDashboardMetrics> {
    const tStart = Date.now();
    const [counts, totalLeads, recentLeads] = await Promise.all([
      Lead.aggregate([
        {
          $group: {
            _id: "$currentDepartment",
            count: { $sum: 1 },
          },
        },
      ]),
      Lead.countDocuments(),
      Lead.find()
        .select("leadCode name contactNumber city state currentDepartment status createdAt updatedAt")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    const countMap: Record<string, number> = {};
    counts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    const marketingCount = countMap[DEPARTMENTS.MARKETING] || 0;
    const communicationCount = countMap[DEPARTMENTS.COMMUNICATION] || 0;
    const vigilanceCount = countMap[DEPARTMENTS.VIGILANCE] || 0;
    const supportCount = countMap[DEPARTMENTS.SUPPORT] || 0;
    const salesCount = countMap[DEPARTMENTS.SALES] || 0;
    const claimedCount = countMap[DEPARTMENTS.CLAIMED] || 0;

    const conversionRate = totalLeads > 0 ? Math.round((claimedCount / totalLeads) * 100) : 0;

    return {
      totalLeads,
      marketingCount,
      communicationCount,
      vigilanceCount,
      supportCount,
      salesCount,
      claimedCount,
      conversionRate,
      recentActivityCount: 24,
      leadsGrowthPercentage: 18.4,
      recentLeads: recentLeads.map((l: any) => ({ ...l, id: l._id?.toString() || l.id })),
    };
  }
}
