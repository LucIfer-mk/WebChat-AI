"use client";

import { useState, useEffect } from "react";
import styles from "./RecentConversations.module.css";

const getApiUrl = () => {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
  return `http://${hostname}:8000`;
};

interface Conversation {
  id: string;
  chatbot_id: string;
  session_id: string;
  visitor_name: string;
  status: string;
  started_at: string;
  updated_at: string;
  message_count: number;
  last_message: string | null;
  bot_name: string | null;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now.getTime() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export default function RecentConversations({ botId }: { botId?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem("user");
        let userId = "";
        if (storedUser) {
          const user = JSON.parse(storedUser);
          userId = user.id;
        }

        const url = botId
          ? `${getApiUrl()}/api/conversations?limit=10&bot_id=${botId}`
          : `${getApiUrl()}/api/conversations?limit=10&user_id=${userId}`;

        const res = await fetch(url);
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, [botId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Recent Conversations</h3>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            textAlign: "center",
            padding: "24px",
          }}
        >
          Loading...
        </p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Recent Conversations</h3>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            textAlign: "center",
            padding: "24px",
          }}
        >
          No conversations yet. They will appear here once visitors start
          chatting with your bots.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Recent Conversations</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Visitor</th>
            <th>Bot</th>
            <th>Last Message</th>
            <th>Messages</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {conversations.map((conv) => (
            <tr key={conv.id}>
              <td className={styles.userName}>{conv.visitor_name}</td>
              <td
                style={{
                  color: "var(--secondary)",
                  fontWeight: 500,
                  fontSize: "0.85rem",
                }}
              >
                {conv.bot_name || "Unknown"}
              </td>
              <td className={styles.message}>{conv.last_message || "—"}</td>
              <td style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                {conv.message_count}
              </td>
              <td>
                <span
                  className={`${styles.status} ${styles[conv.status.toLowerCase()]}`}
                >
                  {conv.status}
                </span>
              </td>
              <td className={styles.time}>{timeAgo(conv.updated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
