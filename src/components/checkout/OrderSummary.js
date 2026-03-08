'use client';

function formatPrice(n) {
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
}

const SHIPPING_FREE_THRESHOLD = 50000;
const SHIPPING_FEE = 3000;

export default function OrderSummary({ items, showShipping = true }) {
  const productTotal = (items || []).reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
  const shipping = showShipping
    ? productTotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE
    : 0;
  const total = productTotal + shipping;

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5">
      <h3 className="text-lg font-medium text-gray-800">주문 요약</h3>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <dt>상품 금액</dt>
          <dd>{formatPrice(productTotal)}</dd>
        </div>
        {showShipping && (
          <div className="flex justify-between text-gray-600">
            <dt>배송비</dt>
            <dd>{shipping === 0 ? '무료' : formatPrice(shipping)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-gray-100 pt-3 font-semibold text-gray-900">
          <dt>총 결제 금액</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
