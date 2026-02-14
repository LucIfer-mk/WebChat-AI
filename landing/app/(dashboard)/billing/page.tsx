import DashboardHeader from "@/components/DashboardHeader";
import styles from "../layout.module.css";

export default function BillingPage() {
  return (
    <div className={styles.container}>
      <DashboardHeader title="Billing" />
      <div className={styles.content}>
        <div
          style={{
            background: "white",
            padding: "36px",
            borderRadius: "16px",
            border: "1px solid var(--border)",
          }}
        >
          <h2
            style={{
              color: "var(--text-main)",
              marginBottom: "24px",
              fontSize: "1.25rem",
              letterSpacing: "-0.5px",
            }}
          >
            Subscription Plan
          </h2>
          <div
            style={{
              padding: "24px",
              borderRadius: "14px",
              border: "1.5px solid rgba(99, 102, 241, 0.2)",
              backgroundColor: "rgba(99, 102, 241, 0.04)",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3
                  style={{
                    color: "var(--primary)",
                    marginBottom: "4px",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                  }}
                >
                  Free Plan
                </h3>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                  }}
                >
                  Next billing date: Never
                </p>
              </div>
              <button
                style={{
                  padding: "10px 24px",
                  background: "linear-gradient(135deg, #6366F1, #818CF8)",
                  color: "white",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
                  transition: "all 0.25s ease",
                }}
              >
                Upgrade Plan
              </button>
            </div>
          </div>
          <h3
            style={{
              marginBottom: "16px",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Payment History
          </h3>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
            }}
          >
            No transactions yet.
          </p>
        </div>
      </div>
    </div>
  );
}
