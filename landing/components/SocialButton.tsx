import React from "react";
import styles from "./SocialButton.module.css";

interface SocialButtonProps {
  provider: "apple" | "google";
  onClick?: () => void;
}

export default function SocialButton({ provider, onClick }: SocialButtonProps) {
  const isApple = provider === "apple";

  return (
    <button
      className={styles.button}
      onClick={onClick}
      aria-label={`Continue with ${isApple ? "Apple" : "Google"}`}
    >
      <span className={styles.icon}>
        {isApple ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15.5 10c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1 2.8-2.1.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.4-.9-2.4-3.7zM13 4.4c.6-.8 1.1-1.8 1-2.9-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.8 1.1.1 2.2-.6 2.9-1.4z" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.8 10.2c0-.6-.1-1.2-.2-1.8H10v3.5h5.5c-.2 1.2-1 2.2-2 2.9v2.3h3.2c1.9-1.7 3-4.3 3-7z"
              fill="#4285F4"
            />
            <path
              d="M10 20c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H1v2.6C2.7 17.9 6.1 20 10 20z"
              fill="#34A853"
            />
            <path
              d="M4.4 11.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V5.5H1C.4 6.7 0 8.3 0 10s.4 3.3 1 4.5l3.4-2.6z"
              fill="#FBBC05"
            />
            <path
              d="M10 4c1.5 0 2.8.5 3.9 1.5l2.9-2.9C15 1 12.7 0 10 0 6.1 0 2.7 2.1 1 5.4l3.4 2.6C5.2 5.8 7.4 4 10 4z"
              fill="#EA4335"
            />
          </svg>
        )}
      </span>
      <span className={styles.label}>
        Continue With {isApple ? "Apple" : "Google"}
      </span>
    </button>
  );
}
