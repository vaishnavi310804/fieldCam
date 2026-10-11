import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import {
  invoicesApi,
  InvoiceStatsData,
  InvoiceOverviewItem,
  InvoiceListItem,
} from "@/src/api/invoices.api";
import {
  EarningsSummary,
  EarningsPeriod,
} from "@/src/components/earnings/EarningsSummary";
import { EarningsMetricCards } from "@/src/components/earnings/EarningsMetricCards";
import { EarningsTrend } from "@/src/components/earnings/EarningsTrend";
import { RecentTransactions } from "@/src/components/earnings/RecentTransactions";

export function EarningScreen() {
  const [period, setPeriod] = useState<EarningsPeriod>("Month");

  // API Data State
  const [stats, setStats] = useState<InvoiceStatsData | null>(null);
  const [overview, setOverview] = useState<InvoiceOverviewItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);

  // Loading & Error State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEarningsData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const [statsRes, overviewRes, invoicesRes] = await Promise.all([
        invoicesApi.getInvoiceStats(),
        invoicesApi.getInvoiceOverview(),
        invoicesApi.getInvoices(),
      ]);

      setStats(statsRes);
      setOverview(overviewRes);
      setInvoices(invoicesRes);
    } catch (err: any) {
      console.error("Failed to load earnings data:", err);
      setError(err?.message || "Failed to load earnings data. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEarningsData(true);
  }, [fetchEarningsData]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchEarningsData(false);
  }, [fetchEarningsData]);

  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1; // 1-12
  const currentMonthName = now.toLocaleString("en-US", { month: "long" });

  // Period-derived calculations
  const { totalEarningsAmount, paidAmount, pendingAmount, subtitle, momChange } =
    useMemo(() => {
      const pendingTotal = stats ? stats.totalOutstanding : 0;

      // 1. Month-over-Month calculation from real overview data
      let computedMoM: { percent: number; isPositive: boolean } | null = null;
      if (overview.length > 0) {
        const currMonthItem = overview.find(
          (o) => o.year === currentYear && o.monthNum === currentMonthNum
        );
        const prevMonthNum = currentMonthNum === 1 ? 12 : currentMonthNum - 1;
        const prevYear = currentMonthNum === 1 ? currentYear - 1 : currentYear;
        const prevMonthItem = overview.find(
          (o) => o.year === prevYear && o.monthNum === prevMonthNum
        );

        if (prevMonthItem && prevMonthItem.amount > 0 && currMonthItem) {
          const diff = currMonthItem.amount - prevMonthItem.amount;
          const pct = Math.round((diff / prevMonthItem.amount) * 100);
          computedMoM = { percent: pct, isPositive: pct >= 0 };
        }
      }

      if (period === "Month") {
        const monthPaid = stats ? stats.paidThisMonth : 0;
        return {
          totalEarningsAmount: monthPaid,
          paidAmount: monthPaid,
          pendingAmount: pendingTotal,
          subtitle: `Total Earnings — ${currentMonthName} ${currentYear}`,
          momChange: computedMoM,
        };
      }

      if (period === "Week") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekPaid = invoices
          .filter((inv) => {
            if (inv.status !== "Paid") return false;
            const d = inv.paymentDate ? new Date(inv.paymentDate) : null;
            return d && d >= oneWeekAgo && d <= now;
          })
          .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);

        return {
          totalEarningsAmount: weekPaid,
          paidAmount: weekPaid,
          pendingAmount: pendingTotal,
          subtitle: "Total Earnings — Past 7 Days",
          momChange: null,
        };
      }

      // Year view
      const yearPaid = overview
        .filter((o) => o.year === currentYear)
        .reduce((sum, o) => sum + o.amount, 0);

      const resolvedYearPaid =
        yearPaid > 0
          ? yearPaid
          : stats
          ? stats.actualPaidEarnings.amount
          : 0;

      return {
        totalEarningsAmount: resolvedYearPaid,
        paidAmount: resolvedYearPaid,
        pendingAmount: pendingTotal,
        subtitle: `Total Earnings — ${currentYear}`,
        momChange: null,
      };
    }, [
      period,
      stats,
      overview,
      invoices,
      now,
      currentYear,
      currentMonthNum,
      currentMonthName,
    ]);

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#928880" />
          <Text style={styles.loadingText}>Loading earnings overview...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={["#928880"]}
              tintColor="#928880"
            />
          }
        >
          {/* 1. Header with Gradient, Amount, and Period Selector */}
          <EarningsSummary
            period={period}
            onSelectPeriod={setPeriod}
            totalAmount={totalEarningsAmount}
            periodSubtitle={subtitle}
            momChange={momChange}
          />

          {/* Body Sections */}
          <View style={styles.bodyContent}>
            {/* 2. Paid and Pending Metric Cards */}
            <EarningsMetricCards
              paidAmount={paidAmount}
              pendingAmount={pendingAmount}
            />

            {/* 3. Earnings Trend Section with 1..12 Chart */}
            <EarningsTrend
              overviewData={overview}
              selectedYear={currentYear}
            />

            {/* 4. Recent Transactions Section */}
            <RecentTransactions
              transactions={invoices}
              maxDisplay={5}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FAF8F6",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110, // Safe clearance for floating bottom tab bar
  },
  bodyContent: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8C827A",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F1D1B",
    marginTop: 12,
    marginBottom: 6,
  },
  errorSubtitle: {
    fontSize: 13,
    color: "#8C827A",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#928880",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 14,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
