'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setOrderItems } from '@/redux/reducers/cartReducer';
import CartItem from './CartItem';
import OrderSummary from './OrderSummary';
import api from '@/utils/apis';
import { getBackendUri, store } from '@/utils/apiPaths';

function EmptyCartIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 6h4l4 12h44l-8 24H18L14 42H6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="54" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="54" cy="54" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CartNotes() {
  return (
    <section className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h2 className="text-sm font-semibold text-gray-900">유의사항</h2>
      <ul className="mt-2 space-y-1 pl-4 text-sm text-gray-600">
        <li className="list-disc">
          장바구니에 담긴 상품(옵션 단위)은 99개까지 보여지고, 최대 90일까지 보관됩니다.
        </li>
        <li className="list-disc">
          PC와 모바일은 서로 연동되지만 적용에 시간 차가 있을 수 있습니다.
        </li>
        <li className="list-disc">
          상품의 판매상태(판매종료/상품정보변경/품절 등)는 별도 표기 됩니다.
        </li>
      </ul>
    </section>
  );
}

function RecommendedForCart() {
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get({ uri: getBackendUri(), path: `${store.products}?sort=latest` })
      .then((data) => setProducts(Array.isArray(data) ? data.slice(0, 12) : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const step = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  if (loading || products.length === 0) return null;

  return (
    <section className="mt-12" aria-label="이 상품은 어떠세요?">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">이 상품은 어떠세요?</h2>
        <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900">
          전체보기 &gt;
        </Link>
      </div>
      <div className="relative mt-4">
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="이전"
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow-sm hover:bg-gray-50 disabled:opacity-40"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p) => {
            const imgUrl = p.images?.[0]?.url;
            const price = p.basePrice ?? 0;
            const isFreeShip = p.shippingFee == null || Number(p.shippingFee) === 0;
            return (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="flex w-40 shrink-0 flex-col rounded-lg border border-gray-100 bg-white p-2 hover:border-gray-200"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                  {imgUrl ? (
                    <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gray-200" />
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-gray-900">{p.name}</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">
                  {price.toLocaleString()}원
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{isFreeShip ? '무료배송' : `배송비 ${Number(p.shippingFee || 0).toLocaleString()}원`}</p>
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="다음"
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow-sm hover:bg-gray-50 disabled:opacity-40"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}

/** API 장바구니 항목을 CartItem 형식으로 변환 */
function mapApiItem(item) {
  const product = item.product || {};
  const price = product.basePrice ?? 0;
  const quantity = item.quantity ?? 1;
  const image = product.images?.[0]?.url ?? '';
  return {
    id: item.id,
    productId: item.productId,
    name: product.name ?? '',
    image,
    option: item.optionLabel ?? '',
    quantity,
    price,
    lineTotal: item.lineTotal ?? price * quantity,
  };
}

export default function Cart() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const loadCart = useCallback(() => {
    setLoading(true);
    api
      .get({ uri: getBackendUri(), path: store.cart })
      .then((data) => {
        const items = (data?.items || []).map(mapApiItem);
        setCartItems(items);
        setSelectedIds(new Set(items.map((i) => i.id)));
      })
      .catch(() => setCartItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCart();
    const onCartUpdated = () => {
      setTimeout(() => loadCart(), 200);
    };
    window.addEventListener('cart-updated', onCartUpdated);
    return () => window.removeEventListener('cart-updated', onCartUpdated);
  }, [loadCart]);

  const selectedItems = cartItems.filter((i) => selectedIds.has(i.id));

  const toggle = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === cartItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cartItems.map((i) => i.id)));
    }
  }, [cartItems, selectedIds.size]);

  const updateQty = useCallback((id, quantity) => {
    if (quantity < 1) return;
    api
      .patch({
        uri: getBackendUri(),
        path: store.cartItem(id),
        data: { quantity },
      })
      .then((data) => {
        if (data?.removed) {
          setCartItems((prev) => prev.filter((i) => i.id !== id));
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        } else {
          setCartItems((prev) =>
            prev.map((i) =>
              i.id === id ? { ...i, quantity, lineTotal: (i.price || 0) * quantity } : i
            )
          );
        }
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart-updated'));
      })
      .catch(() => {});
  }, []);

  const removeItem = useCallback((id) => {
    api
      .delete({ uri: getBackendUri(), path: store.cartItem(id) })
      .then(() => {
        setCartItems((prev) => prev.filter((i) => i.id !== id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart-updated'));
      })
      .catch(() => {});
  }, []);

  const removeSelected = useCallback(() => {
    Promise.all(
      Array.from(selectedIds).map((id) =>
        api.delete({ uri: getBackendUri(), path: store.cartItem(id) })
      )
    ).then(() => {
      setCartItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart-updated'));
    });
  }, [selectedIds]);

  const goToCheckout = useCallback(() => {
    if (selectedItems.length === 0) {
      if (typeof window !== 'undefined') window.alert('주문할 상품을 1개 이상 선택해 주세요.');
      return;
    }
    dispatch(setOrderItems(selectedItems));
    router.push('/checkout');
  }, [selectedItems, router, dispatch]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-xl font-semibold text-gray-900">장바구니</h1>
        <p className="mt-8 text-center text-sm text-gray-500">장바구니를 불러오는 중…</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 md:py-12">
        <h1 className="text-xl font-semibold text-gray-900">장바구니</h1>
        <div className="mt-6 rounded-lg border border-gray-200 bg-white py-16 text-center">
          <EmptyCartIcon className="mx-auto h-24 w-24 text-gray-300" />
          <p className="mt-4 text-gray-600">장바구니에 담긴 상품이 없어요.</p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-md border border-gray-800 bg-gray-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            쇼핑 계속하기
          </Link>
        </div>
        <RecommendedForCart />
        <CartNotes />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-12">
      <h1 className="text-xl font-semibold text-gray-900">장바구니</h1>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={selectedIds.size === cartItems.length}
            onChange={selectAll}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
          />
          <span className="text-sm text-gray-600">전체 선택</span>
        </label>
        <button
          type="button"
          onClick={removeSelected}
          disabled={selectedIds.size === 0}
          className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-50"
        >
          선택 삭제
        </button>
      </div>

      <ul className="mt-6 space-y-4">
        {cartItems.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            checked={selectedIds.has(item.id)}
            onToggle={toggle}
            onQtyChange={updateQty}
            onRemove={removeItem}
          />
        ))}
      </ul>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr,300px]">
        <div />
        <div className="md:row-start-1">
          <OrderSummary items={selectedItems} showShipping />
          <button
            type="button"
            onClick={goToCheckout}
            disabled={selectedItems.length === 0}
            className="mt-4 w-full rounded-md border border-gray-800 bg-gray-800 py-3 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            주문하기
          </button>
        </div>
      </div>
      <CartNotes />
    </div>
  );
}
