/**
 * Next.js App Router Layout with Secure Notification Initialization
 */

import { ReactNode } from 'react';
import { NotificationInitializer } from '../components/NotificationInitializer';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Initialize notifications securely on client side */}
        <NotificationInitializer />
        {children}
      </body>
    </html>
  );
}