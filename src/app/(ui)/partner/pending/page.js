'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PartnerPendingPage() {
  const searchParams = useSearchParams();
  const isReapproval = searchParams.get('reapproval') === '1';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm text-center">
        <h1 className="text-lg font-semibold text-gray-900">승인 대기 중</h1>
        <p className="mt-2 text-sm text-gray-600">
          {isReapproval
            ? '업체명을 변경하셨습니다. 관리자 재승인 후 다시 이용 가능합니다.'
            : '입점 신청이 검토 중입니다. 승인되면 상품 등록 및 주문 관리를 이용하실 수 있습니다.'}
        </p>
        <p className="mt-4 text-sm text-gray-500">
          문의: 관리자에게 연락해 주세요.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link href="/partner/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 underline">
            입점업체 로그인
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 underline">
            메인으로
          </Link>
        </div>
      </div>
    </div>
  );
}
