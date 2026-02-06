"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./EmailForm.module.css";

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/submit-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Navigate to OTP verification page with email as query parameter
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        setError(
          data.detail ||
            data.message ||
            "Failed to send OTP. Please try again.",
        );
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error("Error submitting email:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputGroup}>
        <label htmlFor="email" className={styles.label}>
          Your Email Address
        </label>
        <input
          id="email"
          type="email"
          className={styles.input}
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-required="true"
          disabled={loading}
        />
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? "Sending..." : "Sign Up With Email"}
      </button>
    </form>
  );
}
