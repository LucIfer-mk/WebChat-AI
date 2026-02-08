import React from "react";
import Logo from "../../components/Logo";
import RegisterForm from "../../components/RegisterForm";
import styles from "../../components/AuthPanel.module.css";
import SocialButton from "../../components/SocialButton";

export default function RegisterPage() {
  return (
    <section
      className={styles.panel}
      style={{ width: "100%", margin: "0 auto" }}
    >
      <div className={styles.content}>
        <Logo />
        <h1 className={styles.heading}>Create Account</h1>

        <RegisterForm />

        <p className={styles.signin}>
          Already have an account?{" "}
          <a href="/signin" className={styles.signinLink}>
            Sign In
          </a>
        </p>
      </div>
    </section>
  );
}
