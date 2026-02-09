"use client";

import React from "react";

export default function AnalyticsChart() {
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  return (
    <div className="analytics-card card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700 }}>
            Website Visit & Chat Bot Use
          </h3>
          <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "2px",
                  backgroundColor: "#3b82f6",
                }}
              ></div>
              <span
                style={{ fontSize: "10px", fontWeight: 700, color: "#1e293b" }}
              >
                WEBSITE VISIT
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "2px",
                  backgroundColor: "#ff4d94",
                }}
              ></div>
              <span
                style={{ fontSize: "10px", fontWeight: 700, color: "#1e293b" }}
              >
                CHAT BOT USED
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="chart-container"
        style={{ position: "relative", height: "200px" }}
      >
        <svg viewBox="0 0 1000 200" style={{ width: "100%", height: "100%" }}>
          {/* Grid lines */}
          {[0, 50, 100, 150, 200].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="1000"
              y2={y}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          ))}

          {/* Website Visit Line (Blue) */}
          <path
            d="M 0 180 Q 100 170 200 180 T 400 150 T 600 120 T 800 100 T 1000 90"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            opacity="0.6"
          />

          {/* Chat Bot Use Line (Pink) */}
          <path
            d="M 0 190 Q 100 185 200 190 T 400 180 T 600 160 T 800 140 T 1000 130"
            fill="none"
            stroke="#ff4d94"
            strokeWidth="2"
            opacity="0.6"
          />

          {/* X Axis labels */}
          {months.map((month, i) => (
            <text
              key={month}
              x={(i * 1000) / 11}
              y="215"
              textAnchor="middle"
              fontSize="10"
              fill="#94a3b8"
            >
              {month}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
