'use client';

import { useState, useId } from 'react';
import Link from 'next/link';
import api from '@/utils/apis';
import { getBackendUri, store } from '@/utils/apiPaths';

function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}

/** 옵션: 이미지 스타일. optionPriceByValue 있으면 사이즈별로 "옵션 - 가격" 표시 */
function OptionDropdown({ id, label, value, options, onChange, optionPriceByValue }) {
  const [open, setOpen] = useState(false);
  const displayValue = value || '선택';
  const displaySub = optionPriceByValue && value && optionPriceByValue[value] != null
    ? optionPriceByValue[value]
    : null;

  return (
    <div
      id={id}
      className="overflow-hidden rounded-md border border-gray-200 bg-white"
      role="listbox"
      aria-expanded={open}
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50"
        aria-haspopup="listbox"
      >
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-sm font-semibold text-gray-900">
            {displayValue}
            {displaySub && <span className="ml-1 font-normal text-gray-600">{displaySub}</span>}
          </p>
        </div>
        <span className="flex shrink-0 text-gray-500" aria-hidden>
          {open ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </span>
      </button>
      {open && options.length > 0 && (
        <ul className="border-t border-gray-200">
          {options.map((opt) => (
            <li key={opt} className="border-b border-gray-100 last:border-b-0">
              <button
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`flex w-full px-3 py-2.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 ${
                  value === opt ? 'bg-gray-50' : ''
                }`}
                role="option"
                aria-selected={value === opt}
              >
                {opt}
                {optionPriceByValue && optionPriceByValue[opt] != null && (
                  <span className="ml-1 font-normal text-gray-600">{optionPriceByValue[opt]}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProductInfo({
  productId,
  name,
  price,
  compareAtPrice = null,
  sizeOptions = [],
  colorOptions = [],
  stock = 99,
  variants = [],
  rating = null,
  reviewCount = 0,
  onAddToCart,
  onBuy,
  onReviewClick,
  shippingPeriod = null,
  shippingFee = null,
}) {
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]); // { id, size, color, quantity } when both options
  const [cartSuccessModalOpen, setCartSuccessModalOpen] = useState(false);
  const idSeed = useId();

  // 사이즈별 variant (optionLabel = 사이즈값, priceAdjust = 기본가 대비 추가금)
  const variantBySize = {};
  (variants || []).forEach((v) => {
    variantBySize[v.optionLabel] = { priceAdjust: v.priceAdjust ?? 0, quantity: v.quantity ?? 0 };
  });

  const hasBothOptions = colorOptions.length > 0 && sizeOptions.length > 0;

  function getUnitPriceForSize(sz) {
    if (!sz) return price;
    return price + (variantBySize[sz]?.priceAdjust ?? 0);
  }
  function getMaxQtyForSize(sz) {
    const total = Math.max(0, Number(stock) ?? 0);
    if (!sz) return total;
    const variantQty = variantBySize[sz]?.quantity ?? 0;
    return Math.max(0, variantQty > 0 ? variantQty : total);
  }

  const effectivePrice =
    size && variantBySize[size] != null
      ? price + (variantBySize[size].priceAdjust || 0)
      : price;
  const maxQty =
    size && variantBySize[size] != null
      ? getMaxQtyForSize(size)
      : Math.max(0, Number(stock) ?? 0);
  const isSingleModeSoldOut = maxQty === 0;
  const effectiveMaxQty = isSingleModeSoldOut ? 0 : Math.max(1, maxQty);

  const totalQuantityFromList = selectedItems.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const totalPriceFromList = selectedItems.reduce((sum, i) => sum + (i.quantity || 0) * getUnitPriceForSize(i.size), 0);

  // 품절: variant가 있으면 variant 수량 합 사용, 단 합이 0이면 상품 재고(totalStock)로 판단 (상품 재고만 있어도 재고 있음)
  const variantSum = (variants || []).reduce((sum, v) => sum + (Number(v.quantity) ?? 0), 0);
  const productStock = Math.max(0, Number(stock) ?? 0);
  const totalVariantStock = (variants || []).length > 0
    ? Math.max(variantSum, productStock)
    : productStock;
  const isSoldOut = totalVariantStock === 0;
  const canSubmit = !isSoldOut && (!hasBothOptions || selectedItems.length > 0);
  const optionLabel = [color, size].filter(Boolean).join(' / ') || null;
  const displayQty = hasBothOptions ? totalQuantityFromList : (isSingleModeSoldOut ? 0 : qty);
  const subtotal = hasBothOptions ? totalPriceFromList : effectivePrice * (isSingleModeSoldOut ? 0 : qty);
  const total = subtotal;

  // 사이즈 옵션별 표시 가격 (사이즈별 가격이 있을 때만)
  const sizePriceDisplay = {};
  if (sizeOptions.length > 0) {
    sizeOptions.forEach((s) => {
      const p = price + (variantBySize[s]?.priceAdjust ?? 0);
      sizePriceDisplay[s] = formatPrice(p);
    });
  }
  const hasSizePrices = Object.keys(variantBySize).length > 0;

  function addToSelectedList(c, s) {
    const col = c ?? color;
    const sz = s ?? size;
    if (!col || !sz) return;
    const maxQ = getMaxQtyForSize(sz);
    if (maxQ === 0) return;
    setSelectedItems((prev) => {
      const i = prev.findIndex((x) => x.size === sz && x.color === col);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: Math.min(next[i].quantity + 1, maxQ) };
        return next;
      }
      return [...prev, { id: `${idSeed}-${Date.now()}-${prev.length}`, size: sz, color: col, quantity: 1 }];
    });
  }

  function updateSelectedItemQty(id, delta) {
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const maxQ = getMaxQtyForSize(item.size);
        const nextQ = Math.max(0, Math.min(maxQ, (item.quantity || 0) + delta));
        return nextQ === 0 ? null : { ...item, quantity: nextQ };
      }).filter(Boolean)
    );
  }

  function removeSelectedItem(id) {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleCart() {
    if (hasBothOptions && selectedItems.length > 0) {
      const items = selectedItems.filter((i) => i.quantity > 0);
      if (items.length === 0) return;
      if (onAddToCart) {
        items.forEach((item) => {
          onAddToCart({ productId, quantity: item.quantity, optionLabel: `${item.size}/${item.color}` });
        });
      } else if (typeof window !== 'undefined') {
        (async () => {
          try {
            let ok = false;
            for (const item of items) {
              try {
                await api.post({
                  uri: getBackendUri(),
                  path: store.cart,
                  data: {
                    productId,
                    quantity: item.quantity,
                    optionLabel: `${item.size}/${item.color}`,
                  },
                });
                ok = true;
              } catch {
                // continue
              }
            }
            if (ok) {
              window.dispatchEvent(new Event('cart-updated'));
              setCartSuccessModalOpen(true);
            }
          } catch {
            window.alert('장바구니에 담지 못했습니다.');
          }
        })();
      }
      return;
    }
    if (onAddToCart) {
      onAddToCart({ productId, quantity: qty, optionLabel });
    } else if (typeof window !== 'undefined') {
      api
        .post({
          uri: getBackendUri(),
          path: store.cart,
          data: {
            productId,
            quantity: qty,
            optionLabel: optionLabel || null,
          },
        })
        .then(() => {
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('cart-updated'));
          setCartSuccessModalOpen(true);
        })
        .catch((err) => {
          window.alert(err?.message || '장바구니에 담지 못했습니다.');
        });
    }
  }

  function handleBuy() {
    if (hasBothOptions && selectedItems.length > 0) {
      const items = selectedItems.filter((i) => i.quantity > 0);
      if (items.length === 0) return;
      if (onBuy) {
        items.forEach((item) => {
          const optionLabel = `${item.size}/${item.color}`;
          onBuy({ productId, quantity: item.quantity, optionLabel });
        });
      } else if (typeof window !== 'undefined') {
        Promise.all(
          items.map((item) =>
            api.post({
              uri: getBackendUri(),
              path: store.cart,
              data: {
                productId,
                quantity: item.quantity,
                optionLabel: `${item.size}/${item.color}`,
              },
            })
          )
        ).then(() => {
          window.location.href = '/checkout';
        });
      }
      return;
    }
    if (onBuy) {
      onBuy({ productId, quantity: qty, optionLabel });
    } else {
      if (typeof window !== 'undefined')
        window.location.href = `/checkout?productId=${productId}&qty=${qty}${optionLabel ? '&option=' + encodeURIComponent(optionLabel) : ''}`;
    }
  }

  const displayRating = rating != null ? Number(rating).toFixed(1) : null;
  const hasOptions = colorOptions.length > 0 || sizeOptions.length > 0;

  return (
    <div className="flex flex-col">
      <h1 className="text-xl font-bold text-gray-900 md:text-2xl">{name}</h1>

      {(displayRating != null || reviewCount > 0) && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-amber-500">★</span>
          <span className="text-sm font-medium text-gray-700">{displayRating ?? '-'}</span>
          {reviewCount > 0 && (
            <button
              type="button"
              onClick={onReviewClick}
              className="text-sm text-gray-600 underline hover:text-gray-900"
            >
              {reviewCount}건
            </button>
          )}
        </div>
      )}

      <hr className="my-4 border-gray-100" />

      {/* 옵션 선택 여부와 관계없이 기본가(또는 선택한 옵션 가격) 항상 표시 */}
      <div className="flex flex-wrap items-baseline gap-2">
        {hasOptions && !size && (
          <span className="text-sm text-gray-500">기본가</span>
        )}
        <span className="text-xl font-bold text-gray-900 md:text-2xl">{formatPrice(effectivePrice)}</span>
        {compareAtPrice != null && compareAtPrice > price && (
          <span className="text-sm text-gray-400 line-through">{formatPrice(compareAtPrice)}</span>
        )}
        {isSoldOut && (
          <span className="rounded bg-gray-200 px-2 py-0.5 text-sm font-medium text-gray-600">품절</span>
        )}
      </div>

      {hasOptions && (
        <div className="mt-6 space-y-3">
          {colorOptions.length > 0 && (
            <OptionDropdown
              id="opt-color"
              label="색상"
              value={color}
              options={colorOptions}
              onChange={(c) => {
                setColor(c);
                if (hasBothOptions && size && getMaxQtyForSize(size) > 0) addToSelectedList(c, size);
              }}
            />
          )}
          {sizeOptions.length > 0 && (
            <OptionDropdown
              id="opt-size"
              label="사이즈"
              value={size}
              options={sizeOptions}
              onChange={(s) => {
                setSize(s);
                if (!hasBothOptions) {
                  const q = variantBySize[s]?.quantity ?? 0;
                  setQty(q === 0 ? 0 : 1);
                } else if (color && getMaxQtyForSize(s) > 0) {
                  addToSelectedList(color, s);
                }
              }}
              optionPriceByValue={hasSizePrices ? sizePriceDisplay : undefined}
            />
          )}
        </div>
      )}

      {hasBothOptions && (
        <div className="mt-4 space-y-0 rounded-md border border-gray-200 overflow-hidden">
          {selectedItems.length === 0 ? (
            <div className="bg-white px-3 py-4 text-center text-sm text-gray-400">
              색상과 사이즈를 선택하면 아래에 자동으로 추가됩니다.
            </div>
          ) : null}
          {selectedItems.map((item) => {
            const unitPrice = getUnitPriceForSize(item.size);
            const maxQ = getMaxQtyForSize(item.size);
            const label = `${item.size}/${item.color}`;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 border-b border-gray-100 last:border-b-0 bg-white px-3 py-2.5"
              >
                <span className="w-24 shrink-0 text-sm font-medium text-gray-900">{label}</span>
                <div className="flex items-center rounded-md border border-gray-200">
                  <button
                    type="button"
                    onClick={() => updateSelectedItemQty(item.id, -1)}
                    className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-50"
                    aria-label="수량 감소"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={maxQ}
                    value={item.quantity}
                    onChange={(e) => {
                      const v = Math.max(0, Math.min(maxQ, Number(e.target.value) || 0));
                      setSelectedItems((prev) =>
                        prev.map((i) => (i.id === item.id ? { ...i, quantity: v } : i)).filter((i) => i.quantity > 0)
                      );
                    }}
                    className="h-9 w-10 border-0 border-x border-gray-200 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateSelectedItemQty(item.id, 1)}
                    className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-50"
                    aria-label="수량 증가"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeSelectedItem(item.id)}
                  className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="삭제"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
                <span className="ml-auto text-sm font-medium text-gray-700 shrink-0">
                  {formatPrice(unitPrice * (item.quantity || 0))}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {!hasBothOptions && !isSoldOut && (
        <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center rounded-md border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              className="flex h-10 w-10 items-center justify-center text-gray-600 hover:bg-gray-50"
              aria-label="수량 감소"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={effectiveMaxQty}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(effectiveMaxQty, Number(e.target.value) || 1)))}
              className="h-10 w-12 border-0 border-x border-gray-200 text-center text-sm text-gray-900 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:outline-none"
              aria-label="수량"
            />
            <button
              type="button"
              onClick={() => setQty((prev) => Math.min(effectiveMaxQty, prev + 1))}
              className="flex h-10 w-10 items-center justify-center text-gray-600 hover:bg-gray-50"
              aria-label="수량 증가"
            >
              +
            </button>
          </div>
          <span className="ml-auto text-sm font-medium text-gray-700">{formatPrice(subtotal)}</span>
        </div>
      )}

      {isSoldOut && !hasBothOptions && (
        <div className="mt-6 border-b border-gray-100 pb-4">
          <p className="text-sm font-medium text-gray-500">재고가 없어 구매할 수 없습니다.</p>
        </div>
      )}

      <div className="flex items-center justify-between py-4">
        <span className="text-sm text-gray-500">총 {displayQty}개</span>
        <span className="text-lg font-bold text-red-600">{formatPrice(total)}</span>
      </div>

      <div className="flex gap-3">
        {isSoldOut ? (
          <button
            type="button"
            disabled
            className="flex-1 rounded-md border border-gray-300 bg-gray-100 py-3.5 text-sm font-semibold text-gray-500"
          >
            품절
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCart}
              disabled={!canSubmit}
              className="flex-1 rounded-md border-2 border-red-500 bg-white py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            >
              장바구니 담기
            </button>
            <button
              type="button"
              onClick={handleBuy}
              disabled={!canSubmit}
              className="flex-1 rounded-md bg-red-500 py-3.5 text-sm font-semibold text-white hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500"
            >
              바로 구매하기
            </button>
          </>
        )}
      </div>

      <div className="mt-6 border-t border-gray-100 pt-4">
        <p className="text-sm font-medium text-gray-500">배송정보</p>
        <p className="mt-1 text-sm text-gray-700">
          {shippingPeriod ? (
            <span className="text-blue-600">{shippingPeriod}</span>
          ) : (
            '기본 2~3일 소요 (제주·도서산간 추가 소요)'
          )}
        </p>
        <p className="mt-0.5 text-sm text-gray-600">
          {shippingFee != null && Number(shippingFee) > 0
            ? `배송비 ${Number(shippingFee).toLocaleString()}원`
            : '배송비 무료'}
        </p>
        <button type="button" className="mt-1 text-sm text-gray-500 hover:text-gray-700">
          더보기
        </button>
      </div>

      {cartSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartSuccessModalOpen(false)} aria-hidden />
          <div className="relative w-full max-w-sm rounded-lg border border-gray-300 bg-white p-6 shadow-lg">
            <p className="text-center text-base font-bold text-gray-900">선택하신 상품이 장바구니에 담겼습니다.</p>
            <p className="mt-2 text-center text-sm text-gray-700">장바구니로 이동하시겠습니까?</p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setCartSuccessModalOpen(false)}
                className="flex items-center justify-center gap-1 rounded-md border border-gray-800 bg-white py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                쇼핑 계속하기 <span aria-hidden>&gt;</span>
              </button>
              <Link
                href="/cart"
                className="flex items-center justify-center gap-1 rounded-md bg-gray-800 py-3 text-sm font-medium text-white hover:bg-gray-700"
                onClick={() => setCartSuccessModalOpen(false)}
              >
                장바구니 가기 <span aria-hidden>&gt;</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
