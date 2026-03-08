'use client';

/**
 * Coupon / point section (UI only, no logic).
 * TODO: 쿠폰 적용 API, 포인트 조회/사용 API 연동 후 실제 동작 구현.
 */
export default function CouponPointSection() {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5">
      <h3 className="text-sm font-medium text-gray-800">Coupon & points</h3>
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Coupon code"
            readOnly
            className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
          />
          {/* TODO: 버튼 동작 없음. 쿠폰 검증/적용 API 연동 필요 */}
          <button
            type="button"
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Apply
          </button>
        </div>
        {/* TODO: 더미 문구. 실제 보유 포인트 API 연동 필요 */}
        <p className="text-xs text-gray-500">Available points: 0 (UI only)</p>
      </div>
    </div>
  );
}
