module.exports = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'README',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'guides/quick-start',
        'guides/installation',
        'guides/configuration',
        'guides/platform-setup',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: [
        'guides/architecture',
        'guides/providers',
        'guides/notification-types',
        'guides/permissions',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/core',
        'api/notifications',
        'api/types',
        'api/react-hooks',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/basic',
      ],
    },
    {
      type: 'category',
      label: 'Help',
      items: [
        'guides/troubleshooting',
      ],
    },
  ],
};