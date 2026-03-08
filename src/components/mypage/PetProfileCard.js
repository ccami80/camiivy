'use client';

const BODY_LABEL = {
  SHORT_LEG: '짧은 다리',
  LONG_LEG: '긴 다리',
  STANDARD: '표준',
};

export default function PetProfileCard({ pet, onEdit }) {
  if (!pet) return null;

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-gray-900">{pet.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{pet.species || '—'}</p>
          <ul className="mt-3 space-y-1 text-xs text-gray-600">
            <li>체형: {BODY_LABEL[pet.bodyType] ?? pet.bodyType ?? '—'}</li>
            <li>몸무게: {pet.weight ? `${pet.weight}kg` : '—'}</li>
            <li>나이: {pet.age ? `${pet.age}세` : '—'}</li>
          </ul>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(pet)}
            className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            수정
          </button>
        )}
      </div>
    </div>
  );
}
