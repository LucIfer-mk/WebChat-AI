import React from "react";
import styles from "./Logo.module.css";
import Image from "next/image";
import log from "../public/Logo.png";
export default function Logo() {
  return (
    <div className={styles.logo}>
      <div className={styles.icon}>
        <Image src={log} alt="Logo" width={80} height={60} />
      </div>
      <div className={styles.text}>
        <span className={styles.web}>Web</span>
        <span className={styles.chat}>Chat</span>
        <span className={styles.ai}> AI</span>
      </div>
    </div>
  );
}
