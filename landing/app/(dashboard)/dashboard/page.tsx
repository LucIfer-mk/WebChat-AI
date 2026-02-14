"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import StatsCard from "@/components/StatsCard";
import VisitsChart from "@/components/VisitsChart";
import ReviewProgress from "@/components/ReviewProgress";
import RecentConversations from "@/components/RecentConversations";
import PlanUsage from "@/components/PlanUsage";
import styles from "./page.module.css";

const getApiUrl = () => {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
  return `http://${hostname}:8000`;
};

interface DashboardStats {
  total_bots: number;
  total_conversations: number;
  total_messages: number;
  messages_today: number;
  active_conversations: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_bots: 0,
    total_conversations: 0,
    total_messages: 0,
    messages_today: 0,
    active_conversations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const storedUser = localStorage.getItem("user");
      let userId = "";
      if (storedUser) {
        const user = JSON.parse(storedUser);
        userId = user.id;
      }
      const res = await fetch(
        `${getApiUrl()}/api/analytics/dashboard?user_id=${userId}`,
      );
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <DashboardHeader title="Dashboard" />

      <div className={styles.content}>
        {/* Stats Section */}
        <div className={styles.statsGrid}>
          <StatsCard
            title="Total Bots"
            value={loading ? "..." : stats.total_bots.toLocaleString()}
          />
          <StatsCard
            title="Total Conversations"
            value={loading ? "..." : stats.total_conversations.toLocaleString()}
          />
          <StatsCard
            title="Messages Today"
            value={loading ? "..." : stats.messages_today.toLocaleString()}
          />
          <StatsCard
            title="Total Messages"
            value={loading ? "..." : stats.total_messages.toLocaleString()}
          />
        </div>

        {/* Top Charts Section */}
        <div className={styles.topChartsGrid}>
          <div className={styles.mainChart}>
            <VisitsChart />
          </div>
          <div className={styles.sideChart}>
            <ReviewProgress />
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomGrid}>
          <div className={styles.tableContainer}>
            <RecentConversations />
          </div>
          <div className={styles.usageContainer}>
            <PlanUsage />
          </div>
        </div>
      </div>
    </div>
  );
}
