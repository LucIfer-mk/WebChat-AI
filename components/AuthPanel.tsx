import React from "react";
import Logo from "./Logo";
import SocialButton from "./SocialButton";
import EmailForm from "./EmailForm";
import styles from "./AuthPanel.module.css";

export default function AuthPanel() {
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

        <EmailForm />

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

        <p className={styles.signin}>
          Already Have an Account?{" "}
          <a href="/signin" className={styles.signinLink}>
            Sign In
          </a>
        </p>
      </div>
    </section>
  );
}
