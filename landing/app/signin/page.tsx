import React from "react";
import Logo from "../../components/Logo";
import SignInForm from "../../components/SignInForm";
import styles from "../../components/AuthPanel.module.css";
import SocialButton from "../../components/SocialButton";

export default function SignInPage() {
  return (
      <section
        className={styles.panel}
        style={{ width: "100%", margin: "0 auto" }}
      >
        <div className={styles.content}>
          <Logo />
          <h1 className={styles.heading}>Welcome Back</h1>

          <SignInForm />

          <p className={styles.signin}>
            Don't have an account?{" "}
            <a href="/register" className={styles.signinLink}>
              Create Account
            </a>
          </p>
        </div>
      </section>
  );
}
