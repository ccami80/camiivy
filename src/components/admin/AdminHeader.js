'use client';

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-[9] flex h-14 items-center justify-between border-b border-gray-100 bg-white px-8">
      <h1 className="text-sm text-gray-600">관리자</h1>
      <div className="text-xs text-gray-400">까미 & 아이비</div>
    </header>
  );
}
