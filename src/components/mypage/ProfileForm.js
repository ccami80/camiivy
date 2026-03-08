'use client';

import { useState } from 'react';

export default function ProfileForm({ initial, onLogout }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-gray-100 bg-white p-6">
        <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500">회원 정보</h2>
        <dl className="mt-5 space-y-5">
          <div>
            <dt className="text-sm text-gray-600">이름</dt>
            <dd>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 block w-full rounded-md border border-gray-200 px-3 py-2 text-gray-800 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">이메일</dt>
            <dd>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-md border border-gray-200 px-3 py-2 text-gray-800 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500">비밀번호 변경</h2>
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {showPassword ? '취소' : '변경하기'}
          </button>
        </div>
        {showPassword && (
          <div className="mt-5 space-y-5">
            <div>
              <label className="block text-sm text-gray-600">새 비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-md border border-gray-200 px-3 py-2 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">비밀번호 확인</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="mt-1.5 block w-full rounded-md border border-gray-200 px-3 py-2 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            {/* TODO: 버튼 동작 없음. 비밀번호 변경 API 연동 필요 */}
            <button
              type="button"
              className="rounded-md border border-gray-800 bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              비밀번호 변경 (UI)
            </button>
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
