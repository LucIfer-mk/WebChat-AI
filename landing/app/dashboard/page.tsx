"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsCard from "./components/StatsCard";
import AnalyticsChart from "./components/AnalyticsChart";
import ReviewChart from "./components/ReviewChart";
import UsageChart from "./components/UsageChart";
import RecentConversations from "./components/RecentConversations";
import "./dashboard.css";

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Check authentication
    const sessionToken = localStorage.getItem("session_token");
    const userEmail = localStorage.getItem("user_email");

    if (!sessionToken || !userEmail) {
      router.push("/");
      return;
    }

    setEmail(userEmail);
  }, [router]);

  if (!email) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="dashboard-body">
          <div className="stats-container">
            <StatsCard title="Total Bots" value="12" />
            <StatsCard title="Conversations" value="1,234" />
            <StatsCard title="Message Today" value="567" />
          </div>

          <AnalyticsChart />
          <ReviewChart />

          <RecentConversations />
          <UsageChart />
        </div>
      </main>
    </div>
  );
}
