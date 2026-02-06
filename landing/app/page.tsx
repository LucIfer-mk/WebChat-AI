import AuthPanel from "@/components/AuthPanel";
import HeroSection from "@/components/HeroSection";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <AuthPanel />
      <HeroSection />
    </div>
  );
}
