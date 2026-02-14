import DashboardHeader from "@/components/DashboardHeader";
import styles from "../layout.module.css";

export default function SettingPage() {
  return (
    <div className={styles.container}>
      <DashboardHeader title="Settings" />
      <div className={styles.content}>
        <div
          style={{
            background: "white",
            padding: "36px",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            maxWidth: "640px",
          }}
        >
          <h2
            style={{
              color: "var(--text-main)",
              marginBottom: "32px",
              fontSize: "1.25rem",
              letterSpacing: "-0.5px",
            }}
          >
            General Settings
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                defaultValue="Manoj KAPRI"
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid var(--border)",
                  outline: "none",
                  fontSize: "0.9rem",
                  color: "var(--text-main)",
                  background: "var(--bg-main)",
                  transition: "all 0.15s ease",
                }}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                defaultValue="manoj@example.com"
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid var(--border)",
                  outline: "none",
                  fontSize: "0.9rem",
                  color: "var(--text-main)",
                  background: "var(--bg-main)",
                  transition: "all 0.15s ease",
                }}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                Timezone
              </label>
              <select
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid var(--border)",
                  outline: "none",
                  fontSize: "0.9rem",
                  color: "var(--text-main)",
                  background: "var(--bg-main)",
                  transition: "all 0.15s ease",
                }}
              >
                <option>UTC+11:00 (Sydney)</option>
                <option>UTC+00:00 (GMT)</option>
              </select>
            </div>

            <button
              style={{
                marginTop: "8px",
                padding: "12px 28px",
                background: "#0F172A",
                color: "white",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "0.9rem",
                width: "fit-content",
                border: "none",
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
