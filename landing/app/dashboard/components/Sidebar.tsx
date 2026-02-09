"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = React.useState("User");

  const navItems = [
    { name: "Dashboard", icon: "🏠", path: "/dashboard" },
    { name: "Chat Bots", icon: "🤖", path: "/dashboard/chatbots" },
    { name: "Billing", icon: "💳", path: "/dashboard/billing" },
    { name: "Setting", icon: "⚙️", path: "/dashboard/setting" },
  ];

  React.useEffect(() => {
    const name = localStorage.getItem("user_name");
    if (name) {
      setUserName(name);
    }
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Image src="/logo.png" alt="Logo" width={100} height={100} />
        <h2 style={{ fontSize: "18px", fontWeight: 700 }}>WebChat AI</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`nav-item ${pathname === item.path ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link
          href="/dashboard/user"
          className="user-profile nav-item"
          style={{ padding: "8px 24px", textDecoration: "none" }}
        >
          <div className="user-avatar">
            <span>👤</span>
          </div>
          <div className="user-info">
            <p style={{ fontSize: "14px", fontWeight: 600, color: "white" }}>
              {userName}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
