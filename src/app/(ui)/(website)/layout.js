'use client';

import SiteHeader from '@/components/website/SiteHeader';
import SiteFooter from '@/components/website/SiteFooter';
import FloatingRightWidget from '@/components/website/FloatingRightWidget';

export default function WebsiteLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <FloatingRightWidget />
    </div>
  );
}
