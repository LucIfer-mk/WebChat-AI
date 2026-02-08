"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./EmailForm.module.css"; // Reuse existing styles or create new ones

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Navigate to OTP verification page
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        setError(
          data.detail ||
            data.message ||
            "Registration failed. Please try again.",
        );
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error("Error during registration:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputGroup}>
        <label htmlFor="name" className={styles.label}>
          Full Name
        </label>
        <input
          id="name"
          type="text"
          className={styles.input}
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          aria-required="true"
          disabled={loading}
        />
      </div>

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

      <div className={styles.inputGroup}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          id="password"
          type="password"
          className={styles.input}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          aria-required="true"
          disabled={loading}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}
