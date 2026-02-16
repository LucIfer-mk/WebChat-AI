"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const getApiUrl = () => {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
  return `http://${hostname}:8000`;
};

export default function VisitsChart({ botId }: { botId?: string }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChartData() {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem("user");
        let userId = "";
        if (storedUser) {
          const user = JSON.parse(storedUser);
          userId = user.id;
        }

        const url = botId
          ? `${getApiUrl()}/api/analytics/chart?bot_id=${botId}&days=7`
          : `${getApiUrl()}/api/analytics/chart?user_id=${userId}&days=7`;

        const res = await fetch(url);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch chart data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();
  }, [botId]);

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: 350,
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94A3B8",
        }}
      >
        Loading analytics...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: 350,
        backgroundColor: "white",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid var(--border)",
      }}
    >
      <h3
        style={{
          marginBottom: "20px",
          fontSize: "0.95rem",
          fontWeight: 600,
          color: "var(--text-main)",
          letterSpacing: "-0.01em",
        }}
      >
        Website Visits & Chat Bot Usage
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#F1F5F9"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#94A3B8" }}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
              padding: "12px 16px",
              fontSize: "13px",
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            align="left"
            verticalAlign="top"
            wrapperStyle={{
              paddingBottom: "20px",
              fontSize: "11px",
              fontWeight: 500,
              color: "#64748B",
            }}
          />
          <Line
            type="monotone"
            dataKey="visits"
            name="Website Visits"
            stroke="#6366F1"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: "#6366F1",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
          <Line
            type="monotone"
            dataKey="usage"
            name="Chatbot Usage"
            stroke="#06B6D4"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: "#06B6D4",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
