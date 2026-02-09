"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import SocialButton from "./SocialButton";
import EmailForm from "./EmailForm";
import styles from "./AuthPanel.module.css";

export default function AuthPanel() {
  const router = useRouter();

  const handleDemoLogin = () => {
    localStorage.setItem("session_token", "demo-session-token");
    localStorage.setItem("user_email", "demo@example.com");
    localStorage.setItem("user_name", "Demo User");
    router.push("/dashboard");
  };

  return (
    <section className={styles.panel} aria-label="Sign up section">
      <div className={styles.content}>
        <Logo />

        <h1 className={styles.heading}>Sign Up</h1>

        <div className={styles.socialButtons}>
          <SocialButton provider="apple" />
          <SocialButton provider="google" />
        </div>

        <div className={styles.divider}>
          <span className={styles.dividerLine}></span>
          <span className={styles.dividerText}>OR</span>
          <span className={styles.dividerLine}></span>
        </div>

        <a
          href="/signin"
          className={styles.emailButton}
          style={{
            display: "block",
            textAlign: "center",
            padding: "12px",
            background: "#1f2937",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
            marginBottom: "1rem",
          }}
        >
          Sign Up with Email
        </a>

        <button
          onClick={handleDemoLogin}
          className={styles.emailButton}
          style={{
            width: "100%",
            textAlign: "center",
            padding: "12px",
            background: "#3b82f6",
            color: "white",
            borderRadius: "8px",
            border: "none",
            fontWeight: "600",
            marginBottom: "1rem",
            cursor: "pointer",
          }}
        >
          Demo Login (No Auth)
        </button>

        <p className={styles.terms}>
          By clicking the button above, you agree to our{" "}
          <a href="/terms" className={styles.link}>
            Terms of Use
          </a>{" "}
          and{" "}
          <a href="/privacy" className={styles.link}>
            Privacy Policy
          </a>
          .
        </p>

        <p className={styles.signin} style={{ marginTop: "1rem" }}>
          New here?{" "}
          <a
            href="/register"
            className={styles.signinLink}
            style={{ color: "#3b82f6" }}
          >
            Get Started
          </a>
        </p>
      </div>
    </section>
  );
}
