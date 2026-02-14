"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  CreditCard,
  Settings,
  MessageSquare,
  LogOut,
} from "lucide-react";
import styles from "./Sidebar.module.css";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Chat Bots", icon: Bot, href: "/chat-bots" },
  { name: "Billing", icon: CreditCard, href: "/billing" },
  { name: "Settings", icon: Settings, href: "/setting" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <MessageSquare size={16} fill="currentColor" />
        </div>
        <span className={styles.logo}>WebChat AI</span>
      </div>

      <nav className={styles.nav}>
        <ul>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.activeNavLink : ""}`}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.userProfile}>
        <div className={styles.avatar}>{getInitials(user?.name || "User")}</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user?.name || "User"}</div>
          <div className={styles.userRole}>Free Plan</div>
        </div>
        <button
          title="Logout"
          style={{ color: "var(--sidebar-text)" }}
          onClick={handleLogout}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
