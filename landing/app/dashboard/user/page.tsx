"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../dashboard.css";

export default function UserPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Check authentication
    const sessionToken = localStorage.getItem("session_token");
    const email = localStorage.getItem("user_email");
    const name = localStorage.getItem("user_name");

    if (!sessionToken || !email) {
      router.push("/");
      return;
    }

    setUserEmail(email);
    if (name) {
      setUserName(name);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("session_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    router.push("/");
  };

  if (!userEmail) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="dashboard-body" style={{ display: "block" }}>
          <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: "40px",
                }}
              >
                👤
              </div>
              <h2
                style={{ fontSize: "28px", fontWeight: 800, color: "#1e293b" }}
              >
                {userName}
              </h2>
              <p style={{ color: "#64748b", fontSize: "16px" }}>{userEmail}</p>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "24px" }}>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  borderRadius: "8px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Logout from Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
