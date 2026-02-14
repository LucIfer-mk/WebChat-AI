"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Used", value: 75 },
  { name: "Remaining", value: 25 },
];

const COLORS = ["#6366F1", "#F1F5F9"];

export default function PlanUsage() {
  return (
    <div
      style={{
        background: "white",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          fontSize: "0.95rem",
          fontWeight: 600,
          marginBottom: "20px",
          color: "var(--text-main)",
          letterSpacing: "-0.01em",
        }}
      >
        Plan Usage
      </h3>
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={450}
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  strokeWidth={0}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                fontSize: "13px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: "absolute", textAlign: "center" }}>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text-main)",
              letterSpacing: "-0.5px",
            }}
          >
            75%
          </div>
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              fontWeight: 500,
              marginTop: "2px",
            }}
          >
            Messages Used
          </div>
        </div>
      </div>
    </div>
  );
}
