'use client';

import { useCallback, useRef } from 'react';

const DAUM_POSTCODE_SCRIPT = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

const emptyAddr = { name: '', phone: '', zipCode: '', address: '', addressDetail: '' };

function normalizeValue(value) {
  if (!value) return { ...emptyAddr };
  return {
    name: value.name ?? '',
    phone: value.phone ?? '',
    zipCode: value.zipCode ?? '',
    address: value.address ?? '',
    addressDetail: value.addressDetail ?? '',
  };
}

export default function AddressForm({ value, onChange }) {
  const v = normalizeValue(value);
  const valueRef = useRef(v);
  valueRef.current = v;

  const handleChange = useCallback(
    (field, val) => {
      onChange?.({ ...valueRef.current, [field]: val });
    },
    [onChange]
  );

  const loadPostcodeScript = useCallback(() => {
    if (typeof window === 'undefined') return Promise.reject();
    if (window.daum?.Postcode) return Promise.resolve();
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${DAUM_POSTCODE_SCRIPT}"]`)) {
        if (window.daum?.Postcode) {
          resolve();
        } else {
          window.addEventListener('load', () => resolve());
        }
        return;
      }
      const script = document.createElement('script');
      script.src = DAUM_POSTCODE_SCRIPT;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  const openAddressSearch = useCallback(() => {
    loadPostcodeScript().then(() => {
      if (typeof window === 'undefined' || !window.daum?.Postcode) return;
      const current = valueRef.current;
      new window.daum.Postcode({
        oncomplete(data) {
          const zonecode = data.zonecode || '';
          let addr = data.address || '';
          if (data.addressType === 'R' && data.bname !== '') {
            addr += data.buildingName ? ` (${data.bname}, ${data.buildingName})` : ` (${data.bname})`;
          } else if (data.buildingName) {
            addr += ` (${data.buildingName})`;
          }
          onChange?.({ ...current, zipCode: zonecode, address: addr });
        },
      }).open();
    }).catch(() => {
      alert('주소 검색 서비스를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.');
    });
  }, [loadPostcodeScript, onChange]);

  return (
    <div className="space-y-4 rounded-lg border border-gray-100 bg-white p-5">
      <h3 className="text-lg font-medium text-gray-800">배송 정보</h3>
      <div>
        <label htmlFor="addr-name" className="block text-sm text-gray-600">
          수령인
        </label>
        <input
          id="addr-name"
          type="text"
          value={v.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="이름"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-800 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>
      <div>
        <label htmlFor="addr-phone" className="block text-sm text-gray-600">
          연락처
        </label>
        <input
          id="addr-phone"
          type="tel"
          value={v.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="010-0000-0000"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-800 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600">
          주소
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            value={v.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            placeholder="우편번호"
            className="block w-28 shrink-0 rounded-md border border-gray-300 px-3 py-2 text-gray-800 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            readOnly
          />
          <button
            type="button"
            onClick={openAddressSearch}
            className="shrink-0 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
          >
            주소 검색
          </button>
        </div>
        <input
          type="text"
          value={v.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="주소를 검색한 뒤 선택하면 자동으로 입력됩니다"
          className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-800 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
        <input
          type="text"
          value={v.addressDetail}
          onChange={(e) => handleChange('addressDetail', e.target.value)}
          placeholder="상세 주소 (동/호수, 건물명 등)"
          className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-800 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>
    </div>
  );
}
