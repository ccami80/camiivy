'use client';

// TODO: 결제 수단 선택은 UI만. 실제 PG(결제 게이트웨이) 연동 시 선택값으로 결제 요청 처리 필요.
export default function PaymentMethod({ value, onChange }) {
  const options = [
    { id: 'card', label: '카드 결제' },
    { id: 'simple', label: '간편 결제' },
  ];

  return (
    <div className="space-y-4 rounded-lg border border-gray-100 bg-white p-5">
      <h3 className="text-lg font-medium text-gray-800">결제 수단</h3>
      <ul className="space-y-2">
        {options.map((opt) => (
          <li key={opt.id}>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value={opt.id}
                checked={value === opt.id}
                onChange={() => onChange(opt.id)}
                className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              <span className="text-sm font-medium text-gray-800">{opt.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
