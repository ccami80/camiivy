'use client';

import { useEffect, useMemo, useState } from 'react';
import MainBanner from '@/components/website/MainBanner';
import PromoBanner from '@/components/website/PromoBanner';
import MainCurationSection from '@/components/website/MainCurationSection';
import CategoryShortcut from '@/components/website/CategoryShortcut';
import CuratedCollections from '@/components/website/CuratedCollections';
import BrandStory from '@/components/website/BrandStory';
import BestProducts from '@/components/website/BestProducts';
import { getProducts } from '@/lib/api/productApi';
import { DUMMY_BANNERS } from '@/data/dummyBanners';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import api from '@/utils/apis';
import { getBackendUri, store } from '@/utils/apiPaths';

function mapToCard(p) {
  return {
    id: p.id,
    name: p.name,
    image: p.images?.[0]?.url ?? p.image ?? '',
    brand: p.brand ?? 'CAMI',
    price: p.basePrice ?? p.price ?? 0,
  };
}

/** API 데이터 없을 때 메인에 보여줄 플레이스홀더 상품 */
const PLACEHOLDER_PRODUCTS = [
  { id: 'ph1', name: '강아지 3단 미끄럼방지 계단', image: '/img/cami.jpg', price: 45000 },
  { id: 'ph2', name: '몰리스 미끄러지지않는 패드 L', image: '/img/cami.jpg', price: 18000 },
  { id: 'ph3', name: '프리미엄 강아지 사료 2kg', image: '/img/cami.jpg', price: 68000 },
  { id: 'ph4', name: '동물 친구들 강아지 실내복', image: '/img/cami.jpg', price: 14800 },
  { id: 'ph5', name: '아망떼 펫 방석 베개세트', image: '/img/cami.jpg', price: 34000 },
  { id: 'ph6', name: '휘게 강아지 고양이 클리퍼 V3', image: '/img/cami.jpg', price: 56910 },
].map((p) => ({ ...p, brand: 'CAMI' }));

export default function HomePage() {
  const [banners, setBanners] = useState(DUMMY_BANNERS);
  const [homeSections, setHomeSections] = useState({ newBest: [], best: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get({ uri: getBackendUri(), path: store.homeSections })
      .then((data) => {
        setHomeSections({
          newBest: Array.isArray(data?.newBest) ? data.newBest : [],
          best: Array.isArray(data?.best) ? data.best : [],
        });
      })
      .catch((err) => {
        setError(err?.message || '메인 섹션을 불러올 수 없습니다.');
        getProducts({ brand: 'CAMI' })
          .then((data) => {
            const list = Array.isArray(data) ? data : [];
            setHomeSections({
              newBest: list.slice(0, 6),
              best: list.slice(0, 4),
            });
          })
          .catch(() => setHomeSections({ newBest: [], best: [] }));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get({ uri: getBackendUri(), path: store.banners })
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        setBanners(items.length > 0 ? items : DUMMY_BANNERS);
      })
      .catch(() => setBanners(DUMMY_BANNERS));
  }, []);

  const mainProducts = useMemo(
    () => (homeSections.newBest.length > 0 ? homeSections.newBest.map(mapToCard) : PLACEHOLDER_PRODUCTS.slice(0, 6)),
    [homeSections.newBest]
  );
  const bestProducts = useMemo(
    () => (homeSections.best.length > 0 ? homeSections.best.map(mapToCard) : PLACEHOLDER_PRODUCTS.slice(0, 4)),
    [homeSections.best]
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col">
      {error && <ErrorMessage message={error} className="mx-4 mt-4" />}
      {/* 메인 배너 (관리자에서 등록한 배너 또는 더미) */}
      <MainBanner banners={banners} />
      {/* 이벤트 배너 */}
      <PromoBanner />
      {/* 체형별 스타일 · 집사와 함께 */}
      <CuratedCollections />
      {/* 카테고리 바로가기 */}
      <CategoryShortcut />
      {/* 브랜드 */}
      <BrandStory brand="cami" />
      {/* 신상품 베스트 */}
      <MainCurationSection products={mainProducts} title="신상품 베스트" />
      <BestProducts products={bestProducts} title="베스트 상품" />
    </div>
  );
}
