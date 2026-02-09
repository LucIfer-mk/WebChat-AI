"use client";

import React from "react";

export default function Header() {
  return (
    <header className="header">
      <h1>Dashboard</h1>
      <div className="header-actions">
        <div className="notification-btn">
          <span style={{ fontSize: "20px" }}>🔔</span>
          <span className="notification-dot"></span>
        </div>
      </div>
    </header>
  );
}
