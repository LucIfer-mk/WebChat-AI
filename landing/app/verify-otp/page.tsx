"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";

export default function VerifyOTP() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push("/");
    }
  }, [email, router]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: otpCode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store session token (optional)
        if (data.session_token) {
          localStorage.setItem("session_token", data.session_token);
          localStorage.setItem("user_email", email);
          if (data.user && data.user.name) {
            localStorage.setItem("user_name", data.user.name);
          }
        }
        // Navigate to dashboard
        router.push("/dashboard");
      } else {
        setError(
          data.detail || data.message || "Invalid OTP. Please try again.",
        );
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error verifying OTP:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResendCountdown(60); // 60 seconds cooldown
        setOtp(["", "", "", "", "", ""]); // Clear OTP inputs
      } else {
        setError(data.detail || data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error resending OTP:", err);
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Verify Your Email</h1>
          <p className={styles.subtitle}>
            We've sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.otpContainer} onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={styles.otpInput}
                disabled={loading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || otp.join("").length !== 6}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          <div className={styles.resendContainer}>
            <button
              type="button"
              onClick={handleResend}
              className={styles.resendButton}
              disabled={resendLoading || resendCountdown > 0}
            >
              {resendLoading
                ? "Sending..."
                : resendCountdown > 0
                  ? `Resend in ${resendCountdown}s`
                  : "Resend OTP"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
