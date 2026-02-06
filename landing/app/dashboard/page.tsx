"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

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

  const handleLogout = () => {
    localStorage.removeItem("session_token");
    localStorage.removeItem("user_email");
    router.push("/");
  };

  if (!email) return null;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome to WebChat AI! 🎉</h1>
          <p className={styles.subtitle}>
            Your email has been successfully verified.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Email:</span>
            <span className={styles.value}>{email}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Status:</span>
            <span className={styles.statusBadge}>Verified ✓</span>
          </div>
        </div>

        <div className={styles.content}>
          <h2 className={styles.sectionTitle}>What's Next?</h2>
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>💬</div>
              <h3>Start Chatting</h3>
              <p>Create your first AI chatbot</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>⚙️</div>
              <h3>Customize Settings</h3>
              <p>Configure your preferences</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📊</div>
              <h3>View Analytics</h3>
              <p>Track your chatbot performance</p>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </main>
  );
}
