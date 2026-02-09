"use client";

import React from "react";

export default function RecentConversations() {
  const conversations = [
    {
      id: 1,
      user: "John Doe",
      message: "How can I integrate the bot?",
      status: "Solved",
      time: "2h ago",
    },
    {
      id: 2,
      user: "Jane Smith",
      message: "Pricing inquiry",
      status: "Pending",
      time: "4h ago",
    },
    {
      id: 3,
      user: "Mike Ross",
      message: "Setup guide needed",
      status: "In Progress",
      time: "1d ago",
    },
  ];

  return (
    <div className="conversations-card card">
      <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>
        Recent Conversation
      </h3>
      <table className="recent-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Message</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {conversations.map((conv) => (
            <tr key={conv.id}>
              <td>{conv.user}</td>
              <td style={{ color: "#64748b" }}>{conv.message}</td>
              <td>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    backgroundColor:
                      conv.status === "Solved"
                        ? "#dcfce7"
                        : conv.status === "Pending"
                          ? "#fee2e2"
                          : "#fef9c3",
                    color:
                      conv.status === "Solved"
                        ? "#166534"
                        : conv.status === "Pending"
                          ? "#991b1b"
                          : "#854d0e",
                  }}
                >
                  {conv.status}
                </span>
              </td>
              <td style={{ color: "#94a3b8", fontSize: "12px" }}>
                {conv.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
