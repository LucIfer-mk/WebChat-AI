"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import StatsCard from "@/components/StatsCard";
import VisitsChart from "@/components/VisitsChart";
import ReviewProgress from "@/components/ReviewProgress";
import RecentConversations from "@/components/RecentConversations";
import styles from "./analytics.module.css";

const API_URL = "http://localhost:8000";

interface Chatbot {
  id: string;
  name: string;
}

interface DashboardStats {
  total_bots: number;
  total_conversations: number;
  total_messages: number;
  total_usage: number;
  messages_today: number;
  active_conversations: number;
}

export default function AnalyticsPage() {
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const [stats, setStats] = useState<DashboardStats>({
    total_bots: 0,
    total_conversations: 0,
    total_messages: 0,
    total_usage: 0,
    messages_today: 0,
    active_conversations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBots();
  }, []);

  useEffect(() => {
    if (selectedBotId) {
      fetchStats(selectedBotId);
    }
  }, [selectedBotId]);

  async function fetchBots() {
    try {
      const storedUser = localStorage.getItem("user");
      let userId = "";
      if (storedUser) {
        const user = JSON.parse(storedUser);
        userId = user.id;
      }
      const res = await fetch(`${API_URL}/api/chatbots?user_id=${userId}`);
      const data = await res.json();
      setBots(data);
      if (data.length > 0) {
        setSelectedBotId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch bots:", err);
    }
  }

  async function fetchStats(botId: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/analytics/dashboard?bot_id=${botId}`,
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
      <DashboardHeader title="Analytics" />

      <div className={styles.content}>
        <div className={styles.selectorCard}>
          <label htmlFor="bot-selector" className={styles.label}>
            Select Chatbot
          </label>
          <select
            id="bot-selector"
            className={styles.select}
            value={selectedBotId}
            onChange={(e) => setSelectedBotId(e.target.value)}
          >
            {bots.map((bot) => (
              <option key={bot.id} value={bot.id}>
                {bot.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Section */}
        <div className={styles.statsGrid}>
          <StatsCard
            title="Chatbot Usage"
            value={loading ? "..." : stats.total_usage.toLocaleString()}
          />
          <StatsCard
            title="Messages Today"
            value={loading ? "..." : stats.messages_today.toLocaleString()}
          />
          <StatsCard
            title="Total Messages"
            value={loading ? "..." : stats.total_messages.toLocaleString()}
          />
          <StatsCard
            title="Active Chats"
            value={
              loading ? "..." : stats.active_conversations.toLocaleString()
            }
          />
        </div>

        {/* Top Charts Section */}
        <div className={styles.topChartsGrid}>
          <div className={styles.mainChart}>
            <VisitsChart botId={selectedBotId} />
          </div>
          <div className={styles.sideChart}>
            <ReviewProgress botId={selectedBotId} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomGrid}>
          <div className={styles.tableContainer}>
            <RecentConversations botId={selectedBotId} />
          </div>
        </div>
      </div>
    </div>
  );
}
