'use client';

const STATUS_LABEL = {
  PENDING: '대기',
  APPROVED: '승인',
  REJECTED: '반려',
};

const STATUS_STYLES = {
  PENDING: 'bg-gray-100 text-gray-700',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function SellerTable({ sellers, onStatusChange }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              업체명
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              대표자명
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              사업자번호
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              신청일
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
              상태
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sellers.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-sm text-gray-500"
              >
                입점 신청 업체가 없습니다.
              </td>
            </tr>
          ) : (
            sellers.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {row.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {row.owner}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {row.businessNumber}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {row.createdAt}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[row.status] ?? STATUS_STYLES.PENDING}`}
                  >
                    {STATUS_LABEL[row.status] ?? row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {row.status === 'PENDING' && (
                    <span className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => onStatusChange(row.id, 'APPROVED')}
                        className="rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
                      >
                        승인
                      </button>
                      <button
                        type="button"
                        onClick={() => onStatusChange(row.id, 'REJECTED')}
                        className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                      >
                        반려
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
