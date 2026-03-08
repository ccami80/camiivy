'use client';

import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Reusable Admin UI layout: fixed left sidebar + top header + main content.
 * Use in app/admin/layout.js or wrap any admin page.
 */
export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="pl-56">
        <Header />
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
