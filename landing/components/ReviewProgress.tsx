"use client";

import { useState, useEffect } from "react";
import styles from "./ReviewProgress.module.css";

const getApiUrl = () => {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
  return `http://${hostname}:8000`;
};

interface ReviewStat {
  label: string;
  value: number;
}

export default function ReviewProgress({ botId }: { botId?: string }) {
  const [reviews, setReviews] = useState<ReviewStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviewStats() {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem("user");
        let userId = "";
        if (storedUser) {
          const user = JSON.parse(storedUser);
          userId = user.id;
        }

        const url = botId
          ? `${getApiUrl()}/api/analytics/reviews/summary?bot_id=${botId}`
          : `${getApiUrl()}/api/analytics/reviews/summary?user_id=${userId}`;

        const res = await fetch(url);
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch review summary:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviewStats();
  }, [botId]);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Chat Bot Review</h3>
      <div className={styles.levels}>
        {loading ? (
          <div style={{ color: "var(--text-muted)", padding: "20px 0" }}>
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ color: "var(--text-muted)", padding: "20px 0" }}>
            No reviews yet
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.label} className={styles.level}>
              <div className={styles.labelRow}>
                <span className={styles.label}>{review.label}</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${review.value}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
