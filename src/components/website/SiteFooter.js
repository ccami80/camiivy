import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">CAMI</p>
            <p className="mt-2 text-sm text-gray-600">
              강아지 프리미엄 반려동물 이커머스
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">쇼핑</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/products" className="text-sm text-gray-600 hover:text-gray-900">
                  전체 상품
                </Link>
              </li>
              <li>
                <Link href="/products?brand=CAMI&petType=DOG" className="text-sm text-gray-600 hover:text-gray-900">
                  까미 (강아지)
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">이용 안내</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">이용약관</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">개인정보처리방침</Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-sm text-gray-600 hover:text-gray-900">교환·반품 안내</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">업체</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/signup" className="text-sm text-gray-600 hover:text-gray-900">
                  입점업체 회원가입
                </Link>
              </li>
              <li>
                <Link href="/partner/login" className="text-sm text-gray-600 hover:text-gray-900">
                  입점업체 로그인
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-sm text-gray-600 hover:text-gray-900">
                  관리자
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} CAMI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
