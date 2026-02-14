import styles from "./StatsCard.module.css";

interface StatsCardProps {
  title: string;
  value: string | number;
}

export default function StatsCard({ title, value }: StatsCardProps) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      <h2 className={styles.value}>{value}</h2>
    </div>
  );
}
