import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/guides/quick-start">
            Get Started →
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Unified Notifications`}
      description="A unified notification library for React + Capacitor apps">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <div className="col col--4">
                <h3>🔔 Push Notifications</h3>
                <p>Firebase & OneSignal support with automatic token management</p>
              </div>
              <div className="col col--4">
                <h3>💬 In-App Notifications</h3>
                <p>Beautiful toast-style notifications with customizable themes</p>
              </div>
              <div className="col col--4">
                <h3>⏰ Local Notifications</h3>
                <p>Advanced scheduling with recurring patterns and actions</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}