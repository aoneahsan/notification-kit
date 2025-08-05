const config = {
  title: 'notification-kit',
  tagline: 'Unified notifications for React + Capacitor apps',
  favicon: 'img/favicon.ico',
  url: 'https://aoneahsan.github.io',
  baseUrl: '/notification-kit/',
  organizationName: 'aoneahsan',
  projectName: 'notification-kit',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/aoneahsan/notification-kit/tree/main/website/',
          remarkPlugins: [],
          showLastUpdateTime: true,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'notification-kit',
      logo: {
        alt: 'notification-kit Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/aoneahsan/notification-kit',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://www.npmjs.com/package/notification-kit',
          label: 'NPM',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/guides/quick-start',
            },
            {
              label: 'API Reference',
              to: '/docs/api/core',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/aoneahsan/notification-kit',
            },
            {
              label: 'Issues',
              href: 'https://github.com/aoneahsan/notification-kit/issues',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} notification-kit.`,
    },
    prism: {
      theme: require('prism-react-renderer').themes.github,
      darkTheme: require('prism-react-renderer').themes.dracula,
    },
  },
};

export default config;