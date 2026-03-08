export default function ReturnPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">교환·반품 안내</h1>
      <p className="mt-2 text-sm text-gray-500">CAMI 반품·교환 정책입니다.</p>

      <section className="mt-10 space-y-8">
        <div>
          <h2 className="text-base font-semibold text-gray-900">1. 반품·교환 가능 기간</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            상품 수령일로부터 <strong>7일 이내</strong>에 한하여 반품·교환이 가능합니다. 단, 상품의 내용을 확인하기 위해
            포장 등을 훼손한 경우에는 반품·교환이 제한될 수 있습니다 (상품의 하자·오배송·표시·광고와 다를 때는 예외).
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">2. 반품·교환이 불가한 경우</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-gray-700">
            <li>고객님의 사유로 상품 가치가 훼손된 경우 (사용, 착용, 세탁, 향수·화장품 사용 등)</li>
            <li>상품 수령 후 7일이 경과한 경우</li>
            <li>시간이 지나 재판매가 어려울 정도로 가치가 떨어진 경우</li>
            <li>복제가 가능한 상품의 포장을 훼손한 경우 (CD, 도서, 식품 등)</li>
            <li>주문 시 구성된 맞춤 상품의 경우</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">3. 반품·교환 절차</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm leading-relaxed text-gray-700">
            <li>마이페이지 &gt; 주문 내역에서 해당 주문의 「반품/교환 신청」을 선택합니다.</li>
            <li>사유를 선택하고, 필요 시 사진을 첨부한 뒤 신청을 완료합니다.</li>
            <li>승인 시 반품 안내(반품 택배사·주소 등)를 안내해 드립니다.</li>
            <li>상품을 안내된 주소로 발송해 주시면, 도착 후 검수 후 환불 또는 교환 처리됩니다.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">4. 반품 배송비</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            단순 변심·고객 사유의 반품·교환 시에는 <strong>배송비는 고객 부담</strong>입니다. 상품 하자, 오배송,
            표시·광고와 상이한 경우에는 배송비를 당사가 부담합니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">5. 환불 안내</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            반품 상품 검수 후 이상이 없으면, 신청일로부터 영업일 기준 약 3~5일 내에 결제 수단에 따라 환불됩니다.
            카드 결제의 경우 카드사 사정에 따라 취소 반영이 며칠 더 걸릴 수 있습니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">6. 문의</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            교환·반품 관련 문의는 <strong>고객센터</strong> 또는 마이페이지의 주문 상세에서 신청해 주세요.
          </p>
        </div>
      </section>

      <p className="mt-12 text-xs text-gray-400">
        시행일: 2025년 1월 1일 (추후 변경 시 사전 안내 후 적용됩니다.)
      </p>
    </div>
  );
}
