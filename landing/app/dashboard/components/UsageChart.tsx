"use client";

import React from "react";

export default function UsageChart() {
  return (
    <div className="usage-card card">
      <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "24px" }}>
        Plan Usage
      </h3>
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "180px",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{
            width: "150px",
            height: "150px",
            transform: "rotate(-90deg)",
          }}
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#ff4d94"
            strokeWidth="10"
            strokeDasharray="251.2"
            strokeDashoffset="125.6"
          />
        </svg>
        <div style={{ position: "absolute", textAlign: "center" }}>
          <span style={{ fontSize: "24px", fontWeight: 800 }}>50%</span>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginTop: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#ff4d94",
            }}
          ></div>
          <span style={{ fontSize: "10px", color: "#64748b" }}>Used</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#f1f5f9",
            }}
          ></div>
          <span style={{ fontSize: "10px", color: "#64748b" }}>Remaining</span>
        </div>
      </div>
    </div>
  );
}
