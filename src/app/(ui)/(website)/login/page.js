'use client';

import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-light tracking-wide text-gray-900">CAMI</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
      </div>
      <Suspense fallback={<div className="h-10" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
