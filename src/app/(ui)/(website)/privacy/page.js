export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">개인정보처리방침</h1>
      <p className="mt-2 text-sm text-gray-500">CAMI(까미&amp;아이비)는 이용자의 개인정보를 소중히 하며, 관련 법령을 준수합니다.</p>

      <section className="mt-10 space-y-8">
        <div>
          <h2 className="text-base font-semibold text-gray-900">1. 수집하는 개인정보 항목</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            회원가입, 주문, 고객상담 시 아래와 같은 항목을 수집할 수 있습니다.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-gray-700">
            <li><strong>필수:</strong> 이메일, 비밀번호, 이름, 휴대폰 번호, 배송 주소</li>
            <li><strong>선택:</strong> 반려동물 정보(이름, 종류, 품종, 체형, 생년월일 등) — 서비스 이용 시</li>
            <li>주문·결제 시: 결제 정보, 수령인 정보</li>
            <li>자동 수집: IP 주소, 쿠키, 서비스 이용 기록</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">2. 수집 및 이용 목적</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-gray-700">
            <li>회원 가입·관리, 본인 확인</li>
            <li>상품 주문·배송·환불·교환 처리</li>
            <li>맞춤 상품 추천, 반려동물 체형·연령 기반 서비스 제공</li>
            <li>마케팅·이벤트 안내 (동의 시에 한함)</li>
            <li>고객 문의 응대, 분쟁 조정, 법적 의무 이행</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">3. 보유 및 이용 기간</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            원칙적으로 개인정보는 <strong>목적 달성 후 지체 없이 파기</strong>합니다. 다만 관계 법령에 따라 다음처럼 보관할 수 있습니다.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-gray-700">
            <li>계약·청약 철회 등: 5년</li>
            <li>대금 결제·재화 공급 기록: 5년</li>
            <li>소비자 불만·분쟁 처리 기록: 3년</li>
            <li>표시·광고 기록: 6개월</li>
            <li>웹사이트 방문 기록: 3개월 (통신비밀보호법)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">4. 제3자 제공</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            원칙적으로 이용자 동의 없이 제3자에게 제공하지 않습니다. 배송·결제 등 서비스 제공을 위해 필요한 경우
            (택배사, 결제 대행사 등) 최소 정보만 제공하며, 해당 업체에 대해 개인정보 보호에 관한 계약 등을 요구합니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">5. 쿠키 및 동일 설비 이용</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            서비스 이용 편의를 위해 쿠키를 사용할 수 있습니다. 쿠키는 브라우저 설정에서 거부할 수 있으며, 거부 시 일부 기능이 제한될 수 있습니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">6. 이용자의 권리</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            이용자는 개인정보의 열람·정정·삭제·처리 정지를 요구할 수 있으며, 마이페이지 또는 고객센터를 통해 요청하실 수 있습니다. 법령에서 정한 경우 등 일부 권리는 제한될 수 있습니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">7. 개인정보 보호 조치</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            개인정보의 안전한 처리를 위해 기술적·관리적 조치(접근 제한, 암호화, 접근 기록 관리, 교육 등)를 시행하고 있습니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">8. 문의</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            개인정보 처리와 관련한 문의·불만은 <strong>고객센터</strong>로 연락 주시면 신속히 안내·조치하겠습니다. 개인정보 침해 신고는 개인정보침해신고센터 등 권한 있는 기관에 문의하실 수 있습니다.
          </p>
        </div>
      </section>

      <p className="mt-12 text-xs text-gray-400">
        시행일: 2025년 1월 1일 (변경 시 홈페이지 등을 통해 사전 공지 후 적용됩니다.)
      </p>
    </div>
  );
}
