'use client';

export default function ErrorMessage({ message, onRetry, className = '' }) {
  if (!message) return null;
  return (
    <div
      className={`rounded-md bg-red-50 p-3 text-sm text-red-700 ${className}`}
      role="alert"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm font-medium text-red-800 underline hover:no-underline"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
