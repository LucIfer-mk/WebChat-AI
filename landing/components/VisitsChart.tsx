"use client";

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

const data = [
  { name: "Jan", visits: 400, bots: 240 },
  { name: "Feb", visits: 300, bots: 139 },
  { name: "Mar", visits: 200, bots: 980 },
  { name: "Apr", visits: 278, bots: 390 },
  { name: "May", visits: 189, bots: 480 },
  { name: "Jun", visits: 239, bots: 380 },
  { name: "Jul", visits: 349, bots: 430 },
  { name: "Aug", visits: 400, bots: 500 },
  { name: "Sep", visits: 450, bots: 600 },
  { name: "Oct", visits: 600, bots: 700 },
  { name: "Nov", visits: 700, bots: 800 },
  { name: "Dec", visits: 650, bots: 750 },
];

export default function VisitsChart() {
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
            dataKey="name"
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
            dataKey="bots"
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
