'use client';

/**
 * Generic admin table: columns (array of { key, label }) + rows (array of objects).
 * Renders a minimal, neutral table; cell content can be string or React node.
 */
export default function AdminTable({ columns = [], rows = [], emptyMessage = '데이터가 없습니다.' }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={row.id ?? rowIndex}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 text-sm text-gray-700">
                      {typeof row[col.key] === 'object' && row[col.key] !== null && !Array.isArray(row[col.key])
                        ? row[col.key]
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
