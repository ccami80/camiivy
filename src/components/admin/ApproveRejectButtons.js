'use client';

export default function ApproveRejectButtons({ status, onApprove, onReject }) {
  const isPending = status === 'PENDING';

  return (
    <span className="inline-flex gap-2">
      <button
        type="button"
        disabled={!isPending}
        onClick={onApprove}
        className="rounded-md border border-gray-800 bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        승인
      </button>
      <button
        type="button"
        disabled={!isPending}
        onClick={onReject}
        className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        반려
      </button>
    </span>
  );
}
