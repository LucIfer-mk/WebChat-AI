"use client";

import React, { useState, FormEvent } from "react";
import styles from "./EmailForm.module.css";

export default function EmailForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: Implement email signup logic
    console.log("Email submitted:", email);
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
        />
      </div>
      <button type="submit" className={styles.submitButton}>
        Sign Up With Email
      </button>
    </form>
  );
}
