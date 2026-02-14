"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const hostname =
        typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
      const res = await fetch(`http://${hostname}:8000/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // In a real app, we'd save the token/user in context/localStorage
      localStorage.setItem("user", JSON.stringify(data));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authBox}>
        <div className={styles.header}>
          <div className={styles.logo}>🌐</div>
          <h1>Welcome Back</h1>
          <p>Glad to see you again!</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
