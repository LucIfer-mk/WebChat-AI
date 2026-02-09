"use client";

import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
}

export default function StatsCard({ title, value }: StatsCardProps) {
  return (
    <div className="stats-card card">
      <h4>{title}</h4>
      <p style={{ fontSize: "24px", fontWeight: 800, color: "#1e293b" }}>
        {value}
      </p>
    </div>
  );
}
