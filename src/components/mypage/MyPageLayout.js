'use client';

import SideMenu from './SideMenu';

export default function MyPageLayout({ children }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 md:flex-row md:gap-10 md:px-6 md:py-12">
      <aside className="w-full shrink-0 md:w-52">
        <SideMenu />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
