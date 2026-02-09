"use client";

import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../dashboard.css";

export default function BillingPage() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="dashboard-body" style={{ display: "block" }}>
          <div className="card">
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              Billing
            </h2>
            <p style={{ color: "#64748b" }}>
              Manage your subscription and billing details.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
