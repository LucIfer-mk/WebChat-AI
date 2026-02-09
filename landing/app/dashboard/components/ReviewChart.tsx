"use client";

import React from "react";

export default function ReviewChart() {
  const reviews = [
    { label: "Excellent", value: 85 },
    { label: "Good", value: 65 },
    { label: "Average", value: 45 },
    { label: "Poor", value: 20 },
  ];

  return (
    <div className="review-card card">
      <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>
        Chat Bot Review
      </h3>
      {reviews.map((review) => (
        <div key={review.label} className="progress-bar-container">
          <div className="progress-bar-label">
            <span>{review.label}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${review.value}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
