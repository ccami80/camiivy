'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import OrderCompleteInfo from './OrderCompleteInfo';

export default function OrderComplete() {
  const lastOrder = useSelector((state) => state.cart.lastOrder);
  return (
    <div className="mx-auto max-w-lg px-4 py-12 md:py-16">
      <OrderCompleteInfo order={lastOrder} />
    </div>
  );
}
