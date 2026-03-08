'use client';

import { useState, useEffect } from 'react';

const MAX_LENGTH = 50;

const RECEIPT_OPTIONS = [
  { value: 'door', label: '문 앞에 놓아주세요' },
  { value: 'guardhouse', label: '경비실에 맡겨주세요' },
  { value: 'custom', label: '직접 입력' },
];

const ENTRANCE_OPTIONS = [
  { value: 'code', label: '공동현관 출입번호', hasInput: true },
  { value: 'guard_call', label: '경비실 호출' },
  { value: 'no_password', label: '비밀번호 없이 출입 가능' },
  { value: 'intercom', label: '인터폰으로 연락' },
  { value: 'other', label: '기타', hasInput: true },
];

function getReceiptLabel(value, custom) {
  if (value === 'custom') return custom || '직접 입력';
  return RECEIPT_OPTIONS.find((o) => o.value === value)?.label || value;
}

function getEntranceLabel(value, detail) {
  const opt = ENTRANCE_OPTIONS.find((o) => o.value === value);
  if (!opt) return value;
  if (opt.hasInput && detail) return `${opt.label} ${detail}`;
  return opt.label;
}

export default function DeliveryRequestModal({ open, onClose, value, onSave }) {
  const [receiptLocation, setReceiptLocation] = useState('door');
  const [receiptLocationCustom, setReceiptLocationCustom] = useState('');
  const [entranceMethod, setEntranceMethod] = useState('code');
  const [entranceMethodDetail, setEntranceMethodDetail] = useState('');
  const [deliveryRequest, setDeliveryRequest] = useState('');

  useEffect(() => {
    if (open && value) {
      setReceiptLocation(value.receiptLocation || 'door');
      setReceiptLocationCustom(value.receiptLocationCustom || '');
      setEntranceMethod(value.entranceMethod || 'code');
      setEntranceMethodDetail(value.entranceMethodDetail || '');
      setDeliveryRequest(value.deliveryRequest || value.memo || '');
    }
  }, [open, value]);

  const handleSave = () => {
    onSave?.({
      receiptLocation,
      receiptLocationCustom: receiptLocation === 'custom' ? receiptLocationCustom : '',
      entranceMethod,
      entranceMethodDetail: (entranceMethod === 'code' || entranceMethod === 'other') ? entranceMethodDetail : '',
      deliveryRequest,
      memo: deliveryRequest,
    });
    onClose?.();
  };

  if (!open) return null;

  const entranceOpt = ENTRANCE_OPTIONS.find((o) => o.value === entranceMethod);
  const showEntranceInput = entranceOpt?.hasInput ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delivery-request-modal-title">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 shrink-0">
          <h2 id="delivery-request-modal-title" className="text-lg font-semibold text-gray-900">
            배송 요청사항 변경하기
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="닫기"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-6">
          {/* 수령위치 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">주간배송 수령위치</h3>
            <ul className="space-y-2">
              {RECEIPT_OPTIONS.map((opt) => (
                <li key={opt.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="receipt"
                    id={`receipt-${opt.value}`}
                    checked={receiptLocation === opt.value}
                    onChange={() => setReceiptLocation(opt.value)}
                    className="h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor={`receipt-${opt.value}`} className="text-sm text-gray-800 cursor-pointer">
                    {opt.label}
                  </label>
                </li>
              ))}
            </ul>
            {receiptLocation === 'custom' && (
              <input
                type="text"
                value={receiptLocationCustom}
                onChange={(e) => setReceiptLocationCustom(e.target.value.slice(0, MAX_LENGTH))}
                placeholder="수령위치 직접 입력"
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            )}
          </div>

          {/* 공동현관 출입 방법 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">공동현관 출입 방법</h3>
            <p className="text-xs text-gray-500 mb-2">
              공동현관 출입 방법이 부정확한 경우, 공동현관 앞에 배송될 수 있습니다.
            </p>
            <ul className="space-y-2">
              {ENTRANCE_OPTIONS.map((opt) => (
                <li key={opt.value} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="entrance"
                      id={`entrance-${opt.value}`}
                      checked={entranceMethod === opt.value}
                      onChange={() => setEntranceMethod(opt.value)}
                      className="h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor={`entrance-${opt.value}`} className="text-sm text-gray-800 cursor-pointer">
                      {opt.label}
                    </label>
                  </div>
                  {opt.hasInput && entranceMethod === opt.value && (
                    <div className="ml-6 flex items-center gap-2">
                      <input
                        type="text"
                        value={entranceMethodDetail}
                        onChange={(e) => setEntranceMethodDetail(e.target.value.slice(0, MAX_LENGTH))}
                        placeholder={opt.value === 'code' ? '출입번호 입력' : '기타 내용 입력'}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                      <span className="text-xs text-gray-400 shrink-0">
                        {entranceMethodDetail.length}/{MAX_LENGTH}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* 배송시 요청사항 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">배송시 요청사항</h3>
            <div className="flex items-end gap-2">
              <textarea
                value={deliveryRequest}
                onChange={(e) => setDeliveryRequest(e.target.value.slice(0, MAX_LENGTH))}
                placeholder="예: 물건에 문제 없이 잘 보내주세요"
                rows={3}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm resize-none"
              />
              <span className="text-xs text-gray-400 shrink-0 pb-2">
                {deliveryRequest.length}/{MAX_LENGTH}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export { getReceiptLabel, getEntranceLabel, RECEIPT_OPTIONS, ENTRANCE_OPTIONS };
