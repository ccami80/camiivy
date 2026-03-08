'use client';

const LABEL = {
  PENDING: '대기',
  APPROVED: '승인',
  REJECTED: '반려',
};

const STYLES = {
  PENDING: 'bg-gray-100 text-gray-600',
  APPROVED: 'bg-gray-100 text-gray-800',
  REJECTED: 'bg-gray-100 text-gray-500',
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] ?? STYLES.PENDING;
  const label = LABEL[status] ?? status;

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
