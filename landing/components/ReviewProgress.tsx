import styles from "./ReviewProgress.module.css";

const reviews = [
  { label: "Excellent", value: 85 },
  { label: "Good", value: 65 },
  { label: "Average", value: 45 },
  { label: "Poor", value: 15 },
];

export default function ReviewProgress() {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Chat Bot Review</h3>
      <div className={styles.levels}>
        {reviews.map((review) => (
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
        ))}
      </div>
    </div>
  );
}
