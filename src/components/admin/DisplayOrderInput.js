'use client';

/**
 * 정렬 순서 숫자 입력
 * - 숫자 낮을수록 상단 노출
 * - 변경 시 부모에서 일괄 저장
 */
export default function DisplayOrderInput({ value, onChange, min = 0, max = 9999 }) {
  const num = Number(value);
  const safeNum = Number.isNaN(num) ? min : Math.min(max, Math.max(min, num));
  const handleChange = (e) => {
    const v = e.target.value;
    if (v === '') {
      onChange(min);
      return;
    }
    const n = parseInt(v, 10);
    if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
  };

  return (
    <input
      type="number"
      min={min}
      max={max}
      value={typeof value === 'number' && !Number.isNaN(value) ? value : safeNum}
      onChange={handleChange}
      className="w-20 rounded-md border border-gray-200 px-2 py-1.5 text-center text-sm text-gray-800 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
    />
  );
}
