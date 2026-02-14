"use client";

import Link from "next/link";
import { Apple, Chrome } from "lucide-react";
import styles from "./landing.module.css";

export default function LandingPage() {
  return (
    <div className={styles.container}>
      {/* Left Section: Sign Up */}
      <div className={styles.leftSection}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <span className={styles.globe}>🌐</span>
            </div>
            <span className={styles.logoText}>
              WebChat <span className={styles.bold}>AI</span>
            </span>
          </div>
        </div>

        <div className={styles.signUpBox}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>
            Log in to manage your AI chatbots and conversations.
          </p>

          <div className={styles.buttonGroup}>
            <button className={styles.socialButton}>
              <Apple size={18} fill="currentColor" />
              <span>Continue with Apple</span>
            </button>
            <button className={styles.socialButton}>
              <Chrome size={18} />
              <span>Continue with Google</span>
            </button>
          </div>

          <div className={styles.divider}>
            <div className={styles.line}></div>
            <span className={styles.orText}>OR</span>
            <div className={styles.line}></div>
          </div>

          <Link href="/login" className={styles.emailButton}>
            Log in with Email
          </Link>

          <p className={styles.terms}>
            By clicking the button above, you agree to our{" "}
            <Link href="#">Terms of Use</Link> and{" "}
            <Link href="#">Privacy Policy</Link>.
          </p>

          <p className={styles.footerLink}>
            New here?{" "}
            <Link href="/signup" className={styles.getStarted}>
              Get Started
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section: Preview */}
      <div className={styles.rightSection}>
        <div className={styles.previewContent}>
          <h2 className={styles.previewTitle}>
            An AI-powered website assistant that talks to your visitors,
            represents your business, answers FAQs, captures leads, and boosts
            conversions — even when you{"'"}re offline.
          </h2>

          <div className={styles.dashboardMockup}>
            <div className={styles.mockupSidebar}>
              <div className={styles.mockupLogo}></div>
              <div className={styles.mockupNav}>
                <div className={styles.mockupNavItemActive}></div>
                <div className={styles.mockupNavItem}></div>
                <div className={styles.mockupNavItem}></div>
              </div>
            </div>
            <div className={styles.mockupMain}>
              <div className={styles.mockupHeader}>
                <div className={styles.mockupTitleText}>Dashboard</div>
                <div className={styles.mockupBadge}></div>
              </div>
              <div className={styles.mockupCardRow}>
                <div className={styles.mockupCard}>
                  <div className={styles.mockupBar}></div>
                  <div
                    className={styles.mockupBar}
                    style={{ width: "70%", opacity: 0.4 }}
                  ></div>
                  <div
                    className={styles.mockupBar}
                    style={{ width: "85%", opacity: 0.25 }}
                  ></div>
                </div>
              </div>
              <div className={styles.mockupChartCard}>
                <div className={styles.mockupChartLines}>
                  <div className={styles.mockupLine1}></div>
                  <div className={styles.mockupLine2}></div>
                </div>
              </div>
              <div className={styles.mockupBottomRow}>
                <div className={styles.mockupSmallCard}></div>
                <div className={styles.mockupSmallCard}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
