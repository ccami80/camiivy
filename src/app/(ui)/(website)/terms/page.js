export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">이용약관</h1>
      <p className="mt-2 text-sm text-gray-500">CAMI(까미&amp;아이비) 서비스 이용에 관한 약관입니다.</p>

      <section className="mt-10 space-y-8">
        <div>
          <h2 className="text-base font-semibold text-gray-900">제1조 (목적)</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            본 약관은 CAMI(까미&amp;아이비)(이하 「회사」)가 운영하는 인터넷 쇼핑몰 및 관련 서비스(이하 「서비스」)의 이용과
            회사와 이용자 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">제2조 (정의)</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-gray-700">
            <li>「서비스」: 회사가 제공하는 재화·용역의 거래, 정보 제공, 회원 서비스 등 일체의 온라인 서비스를 말합니다.</li>
            <li>「이용자」: 회사에 접속하여 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
            <li>「회원」: 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
            <li>「비회원」: 회원에 가입하지 않고 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">제3조 (약관의 효력 및 변경)</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            본 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력이 발생합니다. 회사는 합리적인 사유가 있을 경우
            약관을 변경할 수 있으며, 변경 시 적용일자 및 변경 내용을 명시하여 적용일 7일 전부터 공지합니다. 이용자가 변경된 약관에
            동의하지 않을 경우 이용 계약을 해지할 수 있습니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">제4조 (회원가입)</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
            회사는 다음 각 호에 해당하는 경우 회원가입을 거부하거나 사후에 이용 계약을 해지할 수 있습니다.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-gray-700">
            <li>허위 정보 기재, 타인의 정보 도용</li>
            <li>법령 또는 본 약관에 위배되는 행위</li>
            <li>기타 회사의 정책에 따른 부적절한 이용</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">제5조 (서비스의 제공)</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            회사는 반려동물 관련 상품의 판매, 주문·결제·배송 처리, 회원 맞춤 정보 제공, 리뷰·찜·최근 본 상품 등 서비스를 제공합니다.
            서비스는 회사의 업무상·기술상 문제 등이 없는 한 연중 무휴로 제공하되, 필요한 경우 사전 공지 후 일시 중단할 수 있습니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">제6조 (이용자의 의무)</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            이용자는 다음 행위를 하여서는 안 됩니다.
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-gray-700">
            <li>신청 또는 변경 시 허위 내용의 등록</li>
            <li>타인의 정보 도용</li>
            <li>회사 및 제3자의 저작권·지식재산권 등 권리 침해</li>
            <li>회사 및 제3자에 대한 비방, 명예 훼손</li>
            <li>서비스 이용을 방해하거나 시스템을 부정 사용하는 행위</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">제7조 (개인정보 보호)</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            회사는 이용자의 개인정보를 「개인정보처리방침」에 따라 수집·이용·보관·파기하며, 이용자의 동의 없이 목적 외로 이용하거나
            제3자에게 제공하지 않습니다. 자세한 내용은 개인정보처리방침을 참고해 주세요.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">제8조 (면책)</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            회사는 천재지변, 전쟁, 서비스 설비 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다. 또한 이용자의
            귀책사유로 인한 손해, 제3자의 불법 행위로 인한 손해에 대해서는 법령에 따라 책임이 제한될 수 있습니다.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-900">제9조 (분쟁 해결)</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            서비스 이용으로 발생한 분쟁에 대해 회사와 이용자 간에 협의가 이루어지지 않을 경우, 회사의 본사 소재지를 관할하는
            법원을 관할 법원으로 합니다. 대한민국 법률에 따릅니다.
          </p>
        </div>
      </section>

      <p className="mt-12 text-xs text-gray-400">
        시행일: 2025년 1월 1일 (변경 시 홈페이지 등을 통해 사전 공지 후 적용됩니다.)
      </p>
    </div>
  );
}
