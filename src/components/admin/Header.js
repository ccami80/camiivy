'use client';

/**
 * Admin top header: admin name display + logout button (UI only, no logic).
 */
export default function Header({ adminName = 'Admin' }) {
  return (
    <header className="sticky top-0 z-[9] flex h-14 items-center justify-between border-b border-gray-100 bg-white px-8">
      <span className="text-sm text-gray-700">{adminName}</span>
      <button
        type="button"
        className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
      >
        Logout
      </button>
    </header>
  );
}
