"use client";

import Link from "next/link";
import { useTheme } from "@/providers/ThemeProvider";
import {
  ArrowRightOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import styles from "./page.module.css";

export default function LandingPage() {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`${styles.layout} ${isDarkMode ? styles.layoutDark : styles.layoutLight}`}
    >
      <header className={styles.header}>
        <Link href="/" className={styles.logoContainer}>
          <div className={styles.logoIcon}>PM</div>
          <span className={styles.logoText}>PM Agent</span>
        </Link>
        <nav className={styles.navLinks}>
          <Link href="#features" className={styles.navLink}>
            Features
          </Link>
          <Link href="#solutions" className={styles.navLink}>
            Solutions
          </Link>
          <Link href="#pricing" className={styles.navLink}>
            Pricing
          </Link>
        </nav>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link
            href="/auth"
            className={styles.navLink}
            style={{ fontWeight: 600 }}
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className={styles.primaryAction}
            style={{ padding: "10px 20px", fontSize: "14px" }}
          >
            Get Started
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <RocketOutlined className={styles.heroBadgeIcon} />
            <span>PM Agent 2.0 is now live</span>
          </div>
          <h1 className={styles.heroTitle}>
            Supercharge Project Management <br />
            <span className={styles.heroTitleHighlight}>Powered by AI</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Automate workflows, predict risks, and deliver projects faster than
            ever before. The intelligent assistant designed for modern product
            teams.
          </p>
          <div className={styles.buttonGroup}>
            <Link href="/dashboard" className={styles.primaryAction}>
              Start for free <ArrowRightOutlined />
            </Link>
            <Link href="#docs" className={styles.secondaryAction}>
              View documentation
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={styles.features}>
          <div className={styles.featuresContainer}>
            <div className={styles.featuresHeader}>
              <span className={styles.featuresSubtitle}>Platform Features</span>
              <h2 className={styles.featuresTitle}>
                Everything you need to ship faster
              </h2>
            </div>
            <div className={styles.grid}>
              <div className={styles.card}>
                <div className={styles.cardIcon}>
                  <ThunderboltOutlined />
                </div>
                <h3 className={styles.cardTitle}>Real-time Insights</h3>
                <p className={styles.cardDesc}>
                  Get instant updates and predictive analytics on your project
                  health, budget, and timeline to make data-driven decisions.
                </p>
              </div>
              <div className={styles.card}>
                <div className={styles.cardIcon}>
                  <SafetyCertificateOutlined />
                </div>
                <h3 className={styles.cardTitle}>Automated Compliance</h3>
                <p className={styles.cardDesc}>
                  Ensure all deliverables meet industry standards automatically
                  with our AI-powered intelligent compliance checker.
                </p>
              </div>
              <div className={styles.card}>
                <div className={styles.cardIcon}>
                  <TeamOutlined />
                </div>
                <h3 className={styles.cardTitle}>Smart Resource Allocation</h3>
                <p className={styles.cardDesc}>
                  Optimize team workload effortlessly and prevent burnout with
                  AI-driven resource distribution suggestions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className={styles.ctaContainer}>
            <h2 className={styles.ctaTitle}>
              Ready to transform your workflow?
            </h2>
            <p className={styles.ctaDesc}>
              Join thousands of forward-thinking project managers who are
              delivering better results with PM Agent.
            </p>
            <Link
              href="/dashboard"
              className={styles.primaryAction}
              style={{ display: "inline-flex" }}
            >
              Start your free trial <ArrowRightOutlined />
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        PM Agent © {new Date().getFullYear()} Designed with precision for modern
        teams.
      </footer>
    </div>
  );
}
