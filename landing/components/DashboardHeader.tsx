import { Bell, Search, User } from "lucide-react";
import styles from "./DashboardHeader.module.css";

interface DashboardHeaderProps {
  title: string;
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
          />
        </div>
      </div>
    </header>
  );
}
