import styles from "./HeroSection.module.css";
import heroImage from "../public/HeroImage.png";
import Image from "next/image";
export default function HeroSection() {
  return (
    <section className={styles.section} aria-label="Product overview">
      <div className={styles.content}>
        <h2 className={styles.headline}>
          An AI-powered website assistant that talks to your visitors,
          represents your business, answers FAQs, captures leads, and boosts
          conversions even when you&apos;re offline.
        </h2>
      </div>
      <div className={styles.imageContainer}>
        <Image src={heroImage} alt="Hero Image" />
      </div>
    </section>
  );
}
