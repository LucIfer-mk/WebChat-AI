"use client";

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Star, MessageSquare, Bot, Calendar } from "lucide-react";
import styles from "./reviews.module.css";

const API_URL = "http://localhost:8000";

interface Review {
  id: string;
  chatbot_id: string;
  chatbot_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const storedUser = localStorage.getItem("user");
      let userId = "";
      if (storedUser) {
        const user = JSON.parse(storedUser);
        userId = user.id;
      }
      const res = await fetch(`${API_URL}/api/reviews?user_id=${userId}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className={styles.rating}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={16}
            fill={s <= rating ? "#ffb800" : "none"}
            className={s <= rating ? styles.starFilled : styles.star}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.reviewsPage}>
        <DashboardHeader title="Chat Bot Reviews" />
        <div className={styles.content}>
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.reviewsPage}>
      <DashboardHeader title="Chat Bot Reviews" />

      <div className={styles.content}>
        <div className={styles.topBar}>
          <h2>
            {reviews.length} Review{reviews.length !== 1 ? "s" : ""}
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Star size={36} fill="currentColor" />
            </div>
            <h3>No Reviews Yet</h3>
            <p>
              When visitors close your chatbot and leave a rating, they will
              appear here.
            </p>
          </div>
        ) : (
          <div className={styles.reviewsGrid}>
            {reviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.botBadge}>
                    <Bot size={12} style={{ marginRight: 6 }} />
                    {review.chatbot_name}
                  </div>
                  {renderStars(review.rating)}
                </div>

                <div className={styles.reviewComment}>
                  {review.comment ? (
                    review.comment
                  ) : (
                    <span className={styles.noComment}>
                      No comment provided
                    </span>
                  )}
                </div>

                <div className={styles.reviewFooter}>
                  <div className={styles.reviewDate}>
                    <Calendar size={12} style={{ marginRight: 6 }} />
                    {new Date(review.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
